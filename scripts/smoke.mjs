/**
 * @file scripts/smoke.mjs
 * @desc Runs the built package the way apps will: imports dist/ (fonts found from there) and runs
 *       the haruhime-brand bin through node into a temp folder. Run by `bun run test:dist`.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bannerSvg, brandFiles, PRODUCTS } from "../dist/index.js";

const files = brandFiles(PRODUCTS.pools);
assert.equal(files.length, 11);
assert.ok(String(files[0].contents).startsWith("<svg "), "wordmark is an SVG");
assert.ok(
  String(brandFiles(PRODUCTS.haruhime)[0].contents).includes('aria-label="haruhime.moe"'),
  "the parent brand's stacked wordmark draws from dist",
);
assert.ok(
  bannerSvg(PRODUCTS.haruhime).includes('width="1280" height="320"'),
  "the README banner draws from dist",
);

const root = mkdtempSync(path.join(tmpdir(), "brand-smoke-"));
try {
  const bin = new URL("../dist/cli.js", import.meta.url);
  // An app with src/app, so the run also exercises app directory detection.
  mkdirSync(path.join(root, "src/app"), { recursive: true });
  const output = execFileSync(process.execPath, [fileURLToPath(bin), "sheets", "--root", root], {
    encoding: "utf8",
  });
  assert.equal(output.trim().split("\n").length, 11);
  const png = readFileSync(path.join(root, "src/app/opengraph-image.png"));
  assert.equal(png.readUInt32BE(16), 1200);
  const banner = readFileSync(path.join(root, "public/brand/sheets-banner.png"));
  assert.equal(banner.readUInt32BE(16), 1280);
  assert.ok(existsSync(path.join(root, "public/brand/sheets-palette.json")));
  assert.ok(readFileSync(bin, "utf8").startsWith("#!/usr/bin/env node"), "bin keeps its shebang");
} finally {
  rmSync(root, { recursive: true, force: true });
}
// The public types must not reach modules consumers can't resolve (opentype.js ships no types).
const seen = new Set();
const walk = (file) => {
  if (seen.has(file)) return;
  seen.add(file);
  const source = readFileSync(new URL(file, new URL("../dist/", import.meta.url)), "utf8");
  for (const [, specifier] of source.matchAll(/from "([^"]+)"/g)) {
    assert.ok(specifier.startsWith("./"), `${file} imports "${specifier}" in its public types`);
    walk(specifier.replace(/\.js$/, ".d.ts").slice(2));
  }
};
walk("index.d.ts");

console.log("smoke: ok");

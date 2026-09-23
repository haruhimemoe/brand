/**
 * @file tests/cli.test.ts
 * @desc The haruhime-brand command through `run`: list, write, dry run, preview, help and errors.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { run, USAGE } from "../src/cli.js";

let cwd = "";
let out: string[] = [];
let err: string[] = [];
const cli = (...args: string[]) =>
  run(args, { cwd, out: (line) => out.push(line), err: (line) => err.push(line) });

beforeEach(() => {
  cwd = mkdtempSync(path.join(tmpdir(), "brand-cli-"));
  out = [];
  err = [];
});
afterEach(() => rmSync(cwd, { recursive: true, force: true }));

describe("haruhime-brand", () => {
  it("lists the products", () => {
    expect(cli("list")).toBe(0);
    expect(out).toEqual([
      "packs\tpk.\thue 333\thttps://packs.haruhime.moe",
      "pools\tpl.\thue 200\thttps://pools.haruhime.moe",
      "sheets\tsh.\thue 150\thttps://sheets.haruhime.moe",
    ]);
  });

  it("writes a product's files into the app", () => {
    expect(cli("pools")).toBe(0);
    expect(out).toHaveLength(8);
    expect(existsSync(path.join(cwd, "public/brand/pools-wordmark.svg"))).toBe(true);
    expect(existsSync(path.join(cwd, "src/app/opengraph-image.png"))).toBe(true);
  });

  it("honors --root, --public and --app", () => {
    expect(cli("sheets", "--root", "site", "--public", "static", "--app", "app")).toBe(0);
    expect(existsSync(path.join(cwd, "site/static/brand/sheets-icon.svg"))).toBe(true);
    expect(existsSync(path.join(cwd, "site/app/apple-icon.png"))).toBe(true);
  });

  it("prints paths without writing on --dry-run", () => {
    expect(cli("packs", "--dry-run")).toBe(0);
    expect(out[0]).toBe(path.join(cwd, "public/brand/packs-wordmark.svg"));
    expect(existsSync(path.join(cwd, "public"))).toBe(false);
  });

  it("writes a preview page", () => {
    expect(cli("preview", "--out", "look")).toBe(0);
    const html = readFileSync(path.join(cwd, "look/index.html"), "utf8");
    for (const name of ["packs", "pools", "sheets"]) expect(html).toContain(`<h2>${name} `);
  });

  it("prints usage for --help", () => {
    expect(cli("--help")).toBe(0);
    expect(out).toEqual([USAGE]);
  });

  it.each([
    [[], USAGE],
    [["pools", "extra"], USAGE],
    [["nope"], 'Unknown product "nope". Products: packs, pools, sheets.'],
    [["pools", "--bogus"], "Unknown option '--bogus'"],
  ])("fails with exit 1 for %j", (args, message) => {
    expect(cli(...args)).toBe(1);
    expect(err.join("\n")).toContain(message);
  });
});

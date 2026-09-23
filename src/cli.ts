#!/usr/bin/env node
/**
 * @file src/cli.ts
 * @desc haruhime-brand: writes a product's brand files into an app, lists the products, or
 *       writes a preview page of all of them. `run` does the work and returns an exit code, so
 *       tests call it directly; the bottom lines run it when this file is the program.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { brandFiles, writeBrandFiles } from "./generate.js";
import { previewHtml } from "./preview.js";
import { isProductKey, PRODUCTS } from "./products.js";

export const USAGE = `Usage:
  haruhime-brand <product> [--root <dir>] [--public <dir>] [--app <dir>] [--dry-run]
      Write the product's brand files into an app (defaults: --root . --public public --app src/app).
  haruhime-brand preview [--out <dir>]
      Write <dir>/index.html (default: preview) showing every product.
  haruhime-brand list
      List the products.`;

export type Io = { cwd: string; out: (line: string) => void; err: (line: string) => void };

/**
 * @function run
 * @param args {string[]} the arguments after the program name
 * @param io {Io} working directory and output lines
 * @returns {number} the exit code: 0 done, 1 bad usage
 */
export const run = (args: readonly string[], io: Io): number => {
  let parsed: ReturnType<typeof parse>;
  try {
    parsed = parse(args);
  } catch (error) {
    io.err(`${(error as Error).message}\n\n${USAGE}`);
    return 1;
  }
  const { values, positionals } = parsed;
  const [command, ...rest] = positionals;
  if (values.help) {
    io.out(USAGE);
    return 0;
  }
  if (!command || rest.length > 0) {
    io.err(USAGE);
    return 1;
  }
  if (command === "list") {
    for (const [key, product] of Object.entries(PRODUCTS)) {
      io.out(`${key}\t${product.mark}.\thue ${product.hue}\t${product.url}`);
    }
    return 0;
  }
  if (command === "preview") {
    const dir = path.resolve(io.cwd, values.out ?? "preview");
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "index.html");
    writeFileSync(file, previewHtml(Object.values(PRODUCTS)));
    io.out(`wrote ${file}`);
    return 0;
  }
  if (!isProductKey(command)) {
    io.err(`Unknown product "${command}". Products: ${Object.keys(PRODUCTS).join(", ")}.`);
    return 1;
  }
  const files = brandFiles(PRODUCTS[command], {
    ...(values.public ? { publicDir: values.public } : {}),
    ...(values.app ? { appDir: values.app } : {}),
  });
  const root = path.resolve(io.cwd, values.root ?? ".");
  if (values["dry-run"]) {
    for (const file of files) io.out(path.join(root, file.path));
    return 0;
  }
  for (const written of writeBrandFiles(files, root)) io.out(`wrote ${written}`);
  return 0;
};

const parse = (args: readonly string[]) =>
  parseArgs({
    args: [...args],
    allowPositionals: true,
    options: {
      root: { type: "string" },
      public: { type: "string" },
      app: { type: "string" },
      out: { type: "string" },
      "dry-run": { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });

// Run when executed (also through a node_modules/.bin symlink), not when imported by tests.
const invoked = process.argv[1] ? realpathSync(process.argv[1]) : "";
if (invoked === fileURLToPath(import.meta.url)) {
  process.exitCode = run(process.argv.slice(2), {
    cwd: process.cwd(),
    out: (line) => console.log(line),
    err: (line) => console.error(line),
  });
}

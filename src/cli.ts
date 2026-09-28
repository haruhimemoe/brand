#!/usr/bin/env node
/**
 * @file src/cli.ts
 * @desc haruhime-brand: writes a product's brand files into an app, lists the products, or
 *       writes a preview page of all of them. `run` does the work and returns an exit code, so
 *       tests call it directly; the bottom lines run it when this file is the program.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { brandFiles, metadataConflicts, writeBrandFiles } from "./generate.js";
import { previewHtml } from "./preview.js";
import { isProductKey, PRODUCTS } from "./products.js";

export const USAGE = `Usage:
  haruhime-brand <product> [--root <dir>] [--public <dir>] [--app <dir>] [--dry-run] [--force]
      Write the product's brand files into a Next.js app. Defaults: --root . --public public,
      --app src/app or app (whichever exists; an explicit --app must exist too). --app and
      --public must resolve inside --root. Refuses when the app directory already has
      icon/apple-icon/opengraph-image/favicon.ico files it wouldn't replace (Next would serve
      both, or, on the product's first run, a hand-made file), or when a symlink would take a
      write outside --root, unless --force.
  haruhime-brand preview [--out <dir>]
      Write <dir>/index.html (default: preview) showing every product.
  haruhime-brand list
      List the products.
  haruhime-brand help
      Show this usage.
  haruhime-brand --version
      Print the installed version.`;

export type Io = { cwd: string; out: (line: string) => void; err: (line: string) => void };

// Options each command accepts, beyond the global --help/--version. Anything else is rejected.
const COMMAND_OPTIONS: Record<string, readonly string[]> = {
  list: [],
  help: [],
  preview: ["out"],
};
const PRODUCT_OPTIONS = ["root", "public", "app", "dry-run", "force"];

/**
 * @function packageVersion
 * @returns {string} the installed package.json's version
 */
const packageVersion = (): string => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
    version: string;
  };
  return pkg.version;
};

// True when `target` (absolute) is `root` or under it. A folder named "..cache" is inside.
const isInside = (root: string, target: string): boolean => {
  const rel = path.relative(root, target);
  return rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
};

// Throws when `target`, resolved against `root`, would land outside it (an absolute path
// elsewhere, or a "../" that escapes --root).
const requireInsideRoot = (root: string, target: string, flag: string): void => {
  if (!isInside(root, path.resolve(root, target))) {
    throw new RangeError(`${flag} must resolve inside --root (got ${target}).`);
  }
};

// Where a write to `target` really lands once symlinks are followed: its deepest existing path
// (a symlink counts, even a dangling one), resolved, plus the part still to be created. null when
// that path is a dangling symlink, whose destination can't be known.
const realTarget = (target: string): string | null => {
  let existing = target;
  while (!lstatSync(existing, { throwIfNoEntry: false })) existing = path.dirname(existing);
  try {
    return path.join(realpathSync(existing), path.relative(existing, target));
  } catch {
    return null;
  }
};

/**
 * @function run
 * @param args {string[]} the arguments after the program name
 * @param io {Io} working directory and output lines
 * @returns {number} the exit code: 0 done (or --help, --version), 1 on any error it reports
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
  if (values.version) {
    io.out(`haruhime-brand ${packageVersion()}`);
    return 0;
  }
  if (!command || rest.length > 0) {
    io.err(USAGE);
    return 1;
  }
  // Own keys only: "constructor" or "toString" must be an unknown product, not Object's methods.
  const allowed = Object.hasOwn(COMMAND_OPTIONS, command)
    ? COMMAND_OPTIONS[command]
    : isProductKey(command)
      ? PRODUCT_OPTIONS
      : null;
  if (allowed) {
    const bad = Object.keys(values).find((key) => !allowed.includes(key));
    if (bad) {
      io.err(`Unknown option '--${bad}' for "${command}".\n\n${USAGE}`);
      return 1;
    }
  }
  if (command === "help") {
    io.out(USAGE);
    return 0;
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
  const root = path.resolve(io.cwd, values.root ?? ".");
  let appDir: string | null;
  try {
    appDir = values.app ?? findAppDir(root);
    if (appDir) requireInsideRoot(root, appDir, "--app");
    if (values.public) requireInsideRoot(root, values.public, "--public");
  } catch (error) {
    io.err((error as Error).message);
    return 1;
  }
  if (!appDir || !existsSync(path.resolve(root, appDir))) {
    io.err(
      `No app directory: neither ${path.join(root, "src/app")} nor ${path.join(root, "app")} exists. Pass --app <dir>.`,
    );
    return 1;
  }
  const files = brandFiles(PRODUCTS[command], {
    appDir,
    ...(values.public ? { publicDir: values.public } : {}),
  });
  const conflicts = metadataConflicts(root, appDir, files);
  if (conflicts.length > 0 && !values.force) {
    io.err(
      [
        "These files would make Next.js serve two icons or link previews:",
        ...conflicts.map((file) => `  ${file}`),
        "Delete them (the generated files replace them), or pass --force to write anyway.",
      ].join("\n"),
    );
    return 1;
  }
  const targets = files.map((file) => path.resolve(root, file.path));
  // --app and --public were checked as text; a symlink on the way could still lead out of --root.
  const realRoot = realpathSync(root);
  const escaping = targets.filter((target) => {
    const real = realTarget(target);
    return real === null || !isInside(realRoot, real);
  });
  if (escaping.length > 0 && !values.force) {
    io.err(
      [
        "A symlink would take these writes outside --root:",
        ...escaping.map((target) => `  ${target}`),
        "Point --root at the real folder, or pass --force to write anyway.",
      ].join("\n"),
    );
    return 1;
  }
  if (values["dry-run"]) {
    for (const target of targets) io.out(existsSync(target) ? `${target} (exists)` : target);
    return 0;
  }
  const existed = new Set(targets.filter((target) => existsSync(target)));
  for (const written of writeBrandFiles(files, root)) {
    io.out(`${existed.has(written) ? "replaced" : "wrote"} ${written}`);
  }
  return 0;
};

// Next.js looks for src/app first, then app.
const findAppDir = (root: string): string | null => {
  for (const candidate of ["src/app", "app"]) {
    if (existsSync(path.join(root, candidate))) return candidate;
  }
  return null;
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
      force: { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean" },
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

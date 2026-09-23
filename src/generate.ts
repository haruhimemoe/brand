/**
 * @file src/generate.ts
 * @desc Every brand file an app commits, as paths and contents: the wordmarks, icon and palette
 *       for its brand page (public/brand/), and the files Next.js serves by name from the app
 *       directory (icon.svg, apple-icon.png, opengraph-image.png and its alt text). Static files,
 *       so nothing renders per request.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { palette } from "./palette.js";
import { svgToPng } from "./png.js";
import type { Product } from "./products.js";
import { iconSvg, ogSvg, wordmarkSvg } from "./svg.js";

export type BrandFile = { path: string; contents: string | Uint8Array };

export type BrandFileOptions = {
  /** The app's static folder. Default "public". */
  publicDir?: string;
  /** The Next.js app directory. Default "src/app". */
  appDir?: string;
};

/**
 * @function brandFiles
 * @param product {Product} the tool
 * @param options {BrandFileOptions} where the app keeps static files and routes
 * @returns {BrandFile[]} the files, paths relative to the app's root, in a fixed order
 */
export const brandFiles = (product: Product, options: BrandFileOptions = {}): BrandFile[] => {
  const { publicDir = "public", appDir = "src/app" } = options;
  const brand = `${publicDir}/brand/${product.name}`;
  const icon = iconSvg(product);
  return [
    { path: `${brand}-wordmark.svg`, contents: wordmarkSvg(product) },
    { path: `${brand}-wordmark-dark.svg`, contents: wordmarkSvg(product, { background: "light" }) },
    { path: `${brand}-icon.svg`, contents: icon },
    {
      path: `${brand}-palette.json`,
      contents: `${JSON.stringify({ hue: product.hue, colors: palette(product.hue) }, null, 2)}\n`,
    },
    { path: `${appDir}/icon.svg`, contents: icon },
    {
      path: `${appDir}/apple-icon.png`,
      contents: svgToPng(iconSvg(product, { shape: "square" }), 180),
    },
    { path: `${appDir}/opengraph-image.png`, contents: svgToPng(ogSvg(product), 1200) },
    { path: `${appDir}/opengraph-image.alt.txt`, contents: `${product.name}: ${product.tagline}` },
  ];
};

// Next.js metadata files by name: icon, apple-icon, opengraph-image, twitter-image, optionally
// numbered, as images or as code that renders one.
const METADATA_FILE =
  /^(icon|apple-icon|opengraph-image|twitter-image)\d*\.(ico|png|jpe?g|gif|svg|tsx?|jsx?)$/;

/**
 * @function metadataConflicts
 * @param root {string} the app's root folder
 * @param appDir {string} the app directory, relative to root
 * @param files {BrandFile[]} what's about to be written
 * @returns {string[]} metadata files already in appDir that these files don't replace (e.g. an
 *          apple-icon.tsx next to the apple-icon.png being added): Next.js would serve both
 */
export const metadataConflicts = (
  root: string,
  appDir: string,
  files: readonly BrandFile[],
): string[] => {
  const dir = path.resolve(root, appDir);
  if (!existsSync(dir)) return [];
  const writing = new Set(files.map((file) => path.resolve(root, file.path)));
  return readdirSync(dir)
    .filter((name) => METADATA_FILE.test(name) && !writing.has(path.join(dir, name)))
    .sort()
    .map((name) => path.join(appDir, name));
};

/**
 * @function writeBrandFiles
 * @param files {BrandFile[]} from brandFiles
 * @param root {string} the app's root folder
 * @returns {string[]} the absolute paths written
 */
export const writeBrandFiles = (files: readonly BrandFile[], root: string): string[] =>
  files.map((file) => {
    const target = path.resolve(root, file.path);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, file.contents);
    return target;
  });

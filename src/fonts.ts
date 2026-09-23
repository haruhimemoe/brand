/**
 * @file src/fonts.ts
 * @desc Nunito Regular (400) and ExtraBold (800), SIL OFL (fonts/OFL.txt), subset to printable
 *       ASCII. Read from the package's fonts/ folder once per weight.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { readFileSync } from "node:fs";
import opentype, { type Font } from "opentype.js";
import type { Weight } from "./text.js";

// src/ and dist/ both sit next to fonts/.
const FONTS = new URL("../fonts/", import.meta.url);
const cache = new Map<Weight, Font>();

/**
 * @function loadFont
 * @param weight {Weight} 400 (Regular) or 800 (ExtraBold)
 * @returns {Font} the parsed font
 */
export const loadFont = (weight: Weight): Font => {
  const cached = cache.get(weight);
  if (cached) return cached;
  const bytes = readFileSync(new URL(`nunito-${weight}.ttf`, FONTS));
  const font = opentype.parse(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  );
  cache.set(weight, font);
  return font;
};

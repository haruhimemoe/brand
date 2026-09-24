/**
 * @file src/index.ts
 * @desc @haruhimemoe/brand: the haruhime.moe tools' palettes, wordmarks, icons and link previews,
 *       generated from one table of products. Use the `haruhime-brand` CLI to write an app's
 *       files, or these functions to draw them yourself.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

export {
  type BrandFile,
  type BrandFileOptions,
  brandFiles,
  metadataConflicts,
  writeBrandFiles,
} from "./generate.js";
export { hslToHex, type Palette, palette, TOKENS, type Token } from "./palette.js";
export { svgToPng } from "./png.js";
export { previewHtml } from "./preview.js";
export { isProductKey, PRODUCTS, type Product, type ProductKey } from "./products.js";
export {
  type BannerOptions,
  bannerSvg,
  escapeXml,
  type IconOptions,
  iconSvg,
  ogSvg,
  type WordmarkOptions,
  wordmarkSvg,
} from "./svg.js";
export { type Box, layoutText, type TextOptions, type TextRun, type Weight } from "./text.js";

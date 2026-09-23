/**
 * @file src/svg.ts
 * @desc The brand drawings as SVG strings, all text outlined (no fonts needed to view them):
 *       the wordmark ("pools" and the dot), the monogram icon ("pl" and the dot) and the
 *       1200×630 link preview. The dot is a circle sitting on the baseline, in the h1 color.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { palette } from "./palette.js";
import type { Product } from "./products.js";
import { type Box, layoutText, num, type TextRun } from "./text.js";

/** The dot's radius and its gap from the last letter, in em. */
const DOT_RADIUS = 0.075;
const DOT_GAP = 0.09;

type Drawn = { svg: string; ink: Box };

// Text plus the dot after it, in one color scheme.
const textWithDot = (
  text: string,
  size: number,
  x: number,
  baseline: number,
  colors: { text: string; dot: string },
): Drawn => {
  const run: TextRun = layoutText(text, { weight: 800, size, x, baseline });
  const r = DOT_RADIUS * size;
  const cx = run.end + DOT_GAP * size;
  const cy = baseline - r;
  return {
    svg: [
      `<path fill="${colors.text}" d="${run.d}"/>`,
      `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(r)}" fill="${colors.dot}"/>`,
    ].join("\n  "),
    ink: {
      x1: Math.min(run.ink.x1, cx - r),
      y1: Math.min(run.ink.y1, cy - r),
      x2: Math.max(run.ink.x2, cx + r),
      y2: Math.max(run.ink.y2, cy + r),
    },
  };
};

/**
 * @function escapeXml
 * @param value {string} text for an attribute or element
 * @returns {string} the text with &, <, >, " and ' escaped
 */
export const escapeXml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const svgDocument = (attributes: string, label: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attributes} role="img" aria-label="${escapeXml(label)}">\n  ${body}\n</svg>\n`;

export type WordmarkOptions = {
  /** "dark": white text for dark backgrounds (default). "light": dark text for light ones. */
  background?: "dark" | "light";
};

/**
 * @function wordmarkSvg
 * @param product {Product} the tool
 * @param options {WordmarkOptions} which background it's for
 * @returns {string} the wordmark, cropped to its ink plus a 40-unit margin (font size 1000)
 */
export const wordmarkSvg = (product: Product, options: WordmarkOptions = {}): string => {
  const colors = palette(product.hue);
  // On white, h1 is too pale for the dot (sheets' green is 1.3:1); the deeper h2 carries it.
  const scheme =
    options.background === "light"
      ? { text: colors.b6, dot: colors.h2 }
      : { text: colors.c1, dot: colors.h1 };
  const drawn = textWithDot(product.name, 1000, 0, 1000, scheme);
  const pad = 40;
  const { x1, y1, x2, y2 } = drawn.ink;
  const viewBox = [x1 - pad, y1 - pad, x2 - x1 + 2 * pad, y2 - y1 + 2 * pad].map(num).join(" ");
  return svgDocument(`viewBox="${viewBox}"`, product.name, drawn.svg);
};

export type IconOptions = {
  /** "rounded" (default) for favicons and brand pages; "square" for platforms that mask it. */
  shape?: "rounded" | "square";
};

/**
 * The icon's canvas and its letters' font size. Every product uses the same size, so the icons
 * match as a family whatever the letters; the ink is centered both ways.
 */
const ICON_SIZE = 64;
const ICON_FONT_SIZE = 32;

/**
 * @function iconSvg
 * @param product {Product} the tool
 * @param options {IconOptions} rounded or square corners
 * @returns {string} a 64×64 icon: the monogram and dot on the darkest background
 */
export const iconSvg = (product: Product, options: IconOptions = {}): string => {
  const colors = palette(product.hue);
  const scheme = { text: colors.c1, dot: colors.h1 };
  const probe = textWithDot(product.mark, ICON_FONT_SIZE, 0, 0, scheme).ink;
  const x = ICON_SIZE / 2 - (probe.x1 + probe.x2) / 2;
  const baseline = ICON_SIZE / 2 - (probe.y1 + probe.y2) / 2;
  const drawn = textWithDot(product.mark, ICON_FONT_SIZE, x, baseline, scheme);
  const radius = options.shape === "square" ? "" : ` rx="14"`;
  const background = `<rect width="${ICON_SIZE}" height="${ICON_SIZE}"${radius} fill="${colors.b6}"/>`;
  return svgDocument(
    `viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}"`,
    product.name,
    `${background}\n  ${drawn.svg}`,
  );
};

/** Link preview layout, in pixels. */
const OG = { width: 1200, height: 630, padding: 96, title: 150, tagline: 48, gap: 16 } as const;

/**
 * @function ogSvg
 * @param product {Product} the tool
 * @returns {string} the 1200×630 link preview: wordmark over tagline, left-aligned, centered
 *          vertically
 */
export const ogSvg = (product: Product): string => {
  const colors = palette(product.hue);
  // Lay out at baseline 0 to measure the two line boxes, then center the pair.
  const titleLine = layoutText(product.name, { weight: 800, size: OG.title }).line;
  const taglineLine = layoutText(product.tagline, { weight: 400, size: OG.tagline }).line;
  const taglineBaseline = titleLine.bottom + OG.gap - taglineLine.top;
  const blockHeight = taglineBaseline + taglineLine.bottom - titleLine.top;
  const titleBaseline = (OG.height - blockHeight) / 2 - titleLine.top;
  const title = textWithDot(product.name, OG.title, OG.padding, titleBaseline, {
    text: colors.c1,
    dot: colors.h1,
  });
  const tagline = layoutText(product.tagline, {
    weight: 400,
    size: OG.tagline,
    x: OG.padding,
    baseline: titleBaseline + taglineBaseline,
  });
  return svgDocument(
    `width="${OG.width}" height="${OG.height}" viewBox="0 0 ${OG.width} ${OG.height}"`,
    `${product.name}: ${product.tagline}`,
    [
      `<rect width="${OG.width}" height="${OG.height}" fill="${colors.b6}"/>`,
      title.svg,
      `<path fill="${colors.c3}" d="${tagline.d}"/>`,
    ].join("\n  "),
  );
};

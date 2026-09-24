/**
 * @file src/svg.ts
 * @desc The brand drawings as SVG strings, all text outlined (no fonts needed to view them):
 *       the wordmark ("pools" and the dot), the monogram icon ("pl" and the dot), the 1200×630
 *       link preview and the 1280×320 README banner. The dot is a circle sitting on the
 *       baseline, in the h1 color. A product with a suffix stacks it instead: "haruhime" over a
 *       half-size ".moe", whose own dot takes the highlight.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { type Palette, palette } from "./palette.js";
import { fullName, type Product } from "./products.js";
import { type Box, layoutText, num, type TextRun } from "./text.js";

/** The dot's radius and its gap from the last letter, in em. */
const DOT_RADIUS = 0.075;
const DOT_GAP = 0.09;

/**
 * A suffix's font size, as a share of the name's, and the space between the name's ink and the
 * suffix's, in the name's em. At 0.1 the lines sit close enough to read as one mark.
 */
const SUFFIX_SCALE = 0.5;
const SUFFIX_GAP = 0.1;

type Colors = { text: string; dot: string };
/** SVG elements, their exact ink, and the bottom of the last line's line box (for layout). */
type Drawn = { svg: string; ink: Box; bottom: number };

// Text plus the dot after it, in one color scheme.
const textWithDot = (
  text: string,
  size: number,
  x: number,
  baseline: number,
  colors: Colors,
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
    bottom: run.line.bottom,
  };
};

// The name, and under it the suffix at SUFFIX_SCALE, right-aligned to the name's ink. The
// suffix's first character (the "." of ".moe") is drawn in the dot color, the rest in the text
// color, each placed exactly where it sits when the suffix is laid out as one run.
const stacked = (
  name: string,
  suffix: string,
  size: number,
  x: number,
  baseline: number,
  colors: Colors,
): Drawn => {
  const text = layoutText(name, { weight: 800, size, x, baseline });
  const small = { weight: 800, size: size * SUFFIX_SCALE } as const;
  const probe = layoutText(suffix, small).ink;
  const at = {
    x: text.ink.x2 - probe.x2,
    baseline: text.ink.y2 + SUFFIX_GAP * size - probe.y1,
  };
  const whole = layoutText(suffix, { ...small, ...at });
  const [head = "", ...rest] = suffix;
  const tail = rest.join("");
  const first = layoutText(head, { ...small, ...at });
  const others = layoutText(tail, { ...small, ...at, x: whole.end - layoutText(tail, small).end });
  return {
    svg: [
      `<path fill="${colors.text}" d="${text.d}"/>`,
      `<path fill="${colors.dot}" d="${first.d}"/>`,
      `<path fill="${colors.text}" d="${others.d}"/>`,
    ].join("\n  "),
    ink: {
      x1: Math.min(text.ink.x1, whole.ink.x1),
      y1: Math.min(text.ink.y1, whole.ink.y1),
      x2: Math.max(text.ink.x2, whole.ink.x2),
      y2: Math.max(text.ink.y2, whole.ink.y2),
    },
    bottom: whole.line.bottom,
  };
};

// A product's wordmark at any size: stacked when it has a suffix, else the name and the dot.
const drawWordmark = (
  product: Product,
  size: number,
  x: number,
  baseline: number,
  colors: Colors,
): Drawn =>
  product.suffix === undefined
    ? textWithDot(product.name, size, x, baseline, colors)
    : stacked(product.name, product.suffix, size, x, baseline, colors);

/**
 * @function escapeXml
 * @param value {string} text for an attribute or element
 * @returns {string} the text with &, <, >, " and ' escaped
 */
export const escapeXml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const svgDocument = (attributes: string, label: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attributes} role="img" aria-label="${escapeXml(label)}">\n  ${body}\n</svg>\n`;

type Background = "dark" | "light";

// The wordmark's colors on a background. On white, h1 is too pale for the dot (sheets' green is
// 1.3:1); the deeper h2 carries it.
const wordmarkColors = (colors: Palette, background: Background = "dark"): Colors =>
  background === "light"
    ? { text: colors.b6, dot: colors.h2 }
    : { text: colors.c1, dot: colors.h1 };

export type WordmarkOptions = {
  /** "dark": white text for dark backgrounds (default). "light": dark text for light ones. */
  background?: Background;
};

/**
 * @function wordmarkSvg
 * @param product {Product} the tool
 * @param options {WordmarkOptions} which background it's for
 * @returns {string} the wordmark, cropped to its ink plus a 40-unit margin (font size 1000);
 *          with a suffix, both lines
 */
export const wordmarkSvg = (product: Product, options: WordmarkOptions = {}): string => {
  const scheme = wordmarkColors(palette(product.hue), options.background);
  const drawn = drawWordmark(product, 1000, 0, 1000, scheme);
  const pad = 40;
  const { x1, y1, x2, y2 } = drawn.ink;
  const viewBox = [x1 - pad, y1 - pad, x2 - x1 + 2 * pad, y2 - y1 + 2 * pad].map(num).join(" ");
  return svgDocument(`viewBox="${viewBox}"`, fullName(product), drawn.svg);
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
    fullName(product),
    `${background}\n  ${drawn.svg}`,
  );
};

/** Font sizes of a wordmark over a tagline, and the space between their line boxes. */
type LockupSizes = { title: number; tagline: number; gap: number };

/** Where a lockup's lines go: each line's pen x, and the title's baseline. */
type LockupPlace = { title: number; tagline: number; baseline: number };

// The wordmark (stacked, with a suffix) over the tagline, as the link preview and the banner
// draw it. Measured with the title's baseline at 0 and both pens at x 0: the block's line box
// (the name's ascender to the tagline's descender), its ink top and bottom, and the pen x that
// centers each line's ink on 0. `draw` places it.
const lockup = (product: Product, sizes: LockupSizes, scheme: Colors, taglineColor: string) => {
  const titleTop = layoutText(product.name, { weight: 800, size: sizes.title }).line.top;
  const title = drawWordmark(product, sizes.title, 0, 0, scheme);
  const tagline = layoutText(product.tagline, { weight: 400, size: sizes.tagline });
  const taglineBaseline = title.bottom + sizes.gap - tagline.line.top;
  return {
    line: { top: titleTop, bottom: taglineBaseline + tagline.line.bottom },
    ink: { top: title.ink.y1, bottom: taglineBaseline + tagline.ink.y2 },
    center: {
      title: -(title.ink.x1 + title.ink.x2) / 2,
      tagline: -(tagline.ink.x1 + tagline.ink.x2) / 2,
    },
    draw: (at: LockupPlace): string => {
      const drawn = layoutText(product.tagline, {
        weight: 400,
        size: sizes.tagline,
        x: at.tagline,
        baseline: at.baseline + taglineBaseline,
      });
      return [
        drawWordmark(product, sizes.title, at.title, at.baseline, scheme).svg,
        `<path fill="${taglineColor}" d="${drawn.d}"/>`,
      ].join("\n  ");
    },
  };
};

/** Link preview layout, in pixels. */
const OG = { width: 1200, height: 630, padding: 96, title: 150, tagline: 48, gap: 16 } as const;

/**
 * @function ogSvg
 * @param product {Product} the tool
 * @returns {string} the 1200×630 link preview: wordmark (stacked, with a suffix) over tagline,
 *          left-aligned, centered vertically
 */
export const ogSvg = (product: Product): string => {
  const colors = palette(product.hue);
  const block = lockup(product, OG, wordmarkColors(colors), colors.c3);
  // Center the block's line box (font metrics, not ink), so the tools' titles share a baseline
  // whatever their letters.
  const baseline = (OG.height - (block.line.bottom - block.line.top)) / 2 - block.line.top;
  return svgDocument(
    `width="${OG.width}" height="${OG.height}" viewBox="0 0 ${OG.width} ${OG.height}"`,
    `${fullName(product)}: ${product.tagline}`,
    [
      `<rect width="${OG.width}" height="${OG.height}" fill="${colors.b6}"/>`,
      block.draw({ title: OG.padding, tagline: OG.padding, baseline }),
    ].join("\n  "),
  );
};

/**
 * README banner layout, in pixels: 4:1, sized so the wordmark still reads when a README shows
 * it 640 to 830 wide. The title and tagline keep about the link preview's 3:1 ratio.
 */
const BANNER = { width: 1280, height: 320, radius: 24, title: 128, tagline: 40, gap: 0 } as const;

export type BannerOptions = {
  /** "dark": the b6 background, white text (default). "light": white, dark text. */
  background?: Background;
};

/**
 * @function bannerSvg
 * @param product {Product} the tool
 * @param options {BannerOptions} dark or light background
 * @returns {string} the 1280×320 README banner, rounded corners: the wordmark (stacked, with a
 *          suffix) over the tagline, each centered across, the two centered down by their ink
 */
export const bannerSvg = (product: Product, options: BannerOptions = {}): string => {
  const colors = palette(product.hue);
  const light = options.background === "light";
  // The tagline steps down from the name the same way on both: c3 under c1 on b6 (10:1 to 12:1
  // contrast for these hues), b2 under b6 on white (8:1 to 9:1). c1 is white for every hue.
  const block = lockup(
    product,
    BANNER,
    wordmarkColors(colors, options.background),
    light ? colors.b2 : colors.c3,
  );
  const baseline = BANNER.height / 2 - (block.ink.top + block.ink.bottom) / 2;
  return svgDocument(
    `width="${BANNER.width}" height="${BANNER.height}" viewBox="0 0 ${BANNER.width} ${BANNER.height}"`,
    `${fullName(product)}: ${product.tagline}`,
    [
      `<rect width="${BANNER.width}" height="${BANNER.height}" rx="${BANNER.radius}" fill="${light ? colors.c1 : colors.b6}"/>`,
      block.draw({
        title: BANNER.width / 2 + block.center.title,
        tagline: BANNER.width / 2 + block.center.tagline,
        baseline,
      }),
    ].join("\n  "),
  );
};

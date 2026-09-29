/**
 * @file src/card.ts
 * @desc Per-page link previews ("cards"): the 1200×630 ogSvg look (b6 background, outlined
 *       Nunito) with the product's wordmark at the top left and, anchored to the bottom, an
 *       optional eyebrow, the page's title (88px on up to 2 lines, else 76 or 64px on up to 3,
 *       clamped with "...") and an optional subtitle (up to 2 lines). User text is folded to
 *       ASCII first (asciiText), since the bundled fonts hold nothing else.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { asciiText, fitLines } from "./fit.js";
import { palette } from "./palette.js";
import { svgToPng } from "./png.js";
import { fullName, type Product } from "./products.js";
import { drawWordmark, svgDocument, wordmarkColors } from "./svg.js";
import { layoutText, type Weight } from "./text.js";

/** What a card says. Text outside printable ASCII is folded or left out (see asciiText). */
export type OgCardOptions = {
  /** The page's name, like a pack's. Falls back to the product's tagline when nothing's left. */
  title: string;
  /** One or two lines under it, like "13 maps · 5.2-6.4★ · NM HD HR DT". */
  subtitle?: string | undefined;
  /** A short line over the title in the highlight color, like "Mappool pack". */
  eyebrow?: string | undefined;
};

/** The card's size and layout, in pixels. */
export const OG_CARD = { width: 1200, height: 630, padding: 80 } as const;

const WORDMARK_SIZE = 56;
const MAX_WIDTH = OG_CARD.width - 2 * OG_CARD.padding;
// Title sizes to try, largest first, and how many lines each may take.
const TITLE_STEPS = [
  { size: 88, lines: 2 },
  { size: 76, lines: 3 },
  { size: 64, lines: 3 },
] as const;
const TITLE_LEADING = 1.12;
const SUBTITLE = { size: 40, lines: 2, leading: 1.25 } as const;
const EYEBROW_SIZE = 32;
const GAP = 16;

type Line = { text: string; weight: Weight; size: number; fill: string; baseline: number };

const titleLines = (title: string): { lines: string[]; size: number } => {
  for (const step of TITLE_STEPS) {
    const fit = fitLines(title, {
      weight: 800,
      size: step.size,
      maxWidth: MAX_WIDTH,
      maxLines: step.lines,
    });
    if (!fit.clamped || step === TITLE_STEPS.at(-1)) return { lines: fit.lines, size: step.size };
  }
  /* v8 ignore next */
  return { lines: [title], size: 64 };
};

// Lays a paragraph out from `top` (the first line box's top): each line's baseline, and where
// the last line box ends.
const paragraph = (
  texts: readonly string[],
  style: { weight: Weight; size: number; fill: string; leading: number },
  top: number,
): { lines: Line[]; bottom: number } => {
  const probe = layoutText("Mg", { weight: style.weight, size: style.size });
  const first = top - probe.line.top;
  const lines = texts.map((text, index) => ({
    text,
    weight: style.weight,
    size: style.size,
    fill: style.fill,
    baseline: first + index * style.size * style.leading,
  }));
  const last = lines.at(-1)?.baseline ?? first;
  return { lines, bottom: last + probe.line.bottom };
};

/**
 * @function ogCardSvg
 * @param product {Product} the tool the page is on
 * @param options {OgCardOptions} title, subtitle and eyebrow
 * @returns {string} a 1200×630 SVG link preview, all text outlined, everything inside the image
 */
export const ogCardSvg = (product: Product, options: OgCardOptions): string => {
  const colors = palette(product.hue);
  const scheme = wordmarkColors(colors);
  const probe = drawWordmark(product, WORDMARK_SIZE, 0, 0, scheme);
  const mark = drawWordmark(
    product,
    WORDMARK_SIZE,
    OG_CARD.padding - probe.ink.x1,
    OG_CARD.padding - probe.ink.y1,
    scheme,
  );

  const title = titleLines(asciiText(options.title) || product.tagline);
  const eyebrow = asciiText(options.eyebrow ?? "");
  const subtitle = asciiText(options.subtitle ?? "");
  const lines: Line[] = [];
  let cursor = 0;
  if (eyebrow) {
    const [text = ""] = fitLines(eyebrow, {
      weight: 800,
      size: EYEBROW_SIZE,
      maxWidth: MAX_WIDTH,
      maxLines: 1,
    }).lines;
    const block = paragraph(
      [text],
      { weight: 800, size: EYEBROW_SIZE, fill: colors.h1, leading: 1 },
      cursor,
    );
    lines.push(...block.lines);
    cursor = block.bottom;
  }
  const heading = paragraph(
    title.lines,
    { weight: 800, size: title.size, fill: colors.c1, leading: TITLE_LEADING },
    cursor,
  );
  lines.push(...heading.lines);
  cursor = heading.bottom;
  if (subtitle) {
    const fit = fitLines(subtitle, {
      weight: 400,
      size: SUBTITLE.size,
      maxWidth: MAX_WIDTH,
      maxLines: SUBTITLE.lines,
    });
    const block = paragraph(
      fit.lines,
      { weight: 400, size: SUBTITLE.size, fill: colors.c3, leading: SUBTITLE.leading },
      cursor + GAP,
    );
    lines.push(...block.lines);
    cursor = block.bottom;
  }
  // Anchor the block's last line box to the bottom padding.
  const shift = OG_CARD.height - OG_CARD.padding - cursor;
  const paths = lines.map((line) => {
    const run = layoutText(line.text, {
      weight: line.weight,
      size: line.size,
      x: OG_CARD.padding,
      baseline: line.baseline + shift,
    });
    return `<path fill="${line.fill}" d="${run.d}"/>`;
  });
  const label = [options.eyebrow, options.title, options.subtitle].filter(Boolean).join(": ");
  return svgDocument(
    `width="${OG_CARD.width}" height="${OG_CARD.height}" viewBox="0 0 ${OG_CARD.width} ${OG_CARD.height}"`,
    `${label || product.tagline} - ${fullName(product)}`,
    [
      `<rect width="${OG_CARD.width}" height="${OG_CARD.height}" fill="${colors.b6}"/>`,
      mark.svg,
      ...paths,
    ].join("\n  "),
  );
};

/**
 * @function ogCard
 * @param product {Product} the tool the page is on
 * @param options {OgCardOptions} title, subtitle and eyebrow
 * @returns {Uint8Array} the card as a 1200×630 PNG (ogCardSvg through svgToPng, which loads
 *          resvg's native binary on first use: Node.js runtime only, not edge)
 */
export const ogCard = (product: Product, options: OgCardOptions): Uint8Array =>
  svgToPng(ogCardSvg(product, options), OG_CARD.width);

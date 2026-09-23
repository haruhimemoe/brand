/**
 * @file src/text.ts
 * @desc Text as outlined SVG path data: glyphs laid out with the font's kerning, turned from font
 *       units (y up) into SVG units (y down) here rather than with opentype.js's getPath, which in
 *       2.0 leaves glyphs upside down. Also measures the exact ink box, for centering.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { loadFont } from "./fonts.js";

/** Nunito Regular (400) or ExtraBold (800), the two bundled weights. */
export type Weight = 400 | 800;

export type Box = { x1: number; y1: number; x2: number; y2: number };

export type TextOptions = {
  weight: Weight;
  /** Font size in SVG units. */
  size: number;
  /** Left edge of the first glyph's advance box. */
  x?: number;
  /** Baseline, in SVG units (y down). */
  baseline?: number;
  /** Extra space between letters, in em (e.g. -0.027 for -4px at 150px). */
  tracking?: number;
};

export type TextRun = {
  /** SVG path data for every glyph. */
  d: string;
  /** Where the pen ends: x + the advance of the whole run. */
  end: number;
  /** The glyphs' ink, exactly (quadratic curves are solved for their extremes). */
  ink: Box;
  /** The font's line box at this size: baseline minus ascender to baseline minus descender. */
  line: { top: number; bottom: number };
};

/**
 * @function num
 * @param value {number} a coordinate
 * @returns {string} at most two decimals, no trailing zeros, never "-0"
 */
export const num = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded === 0 ? 0 : rounded);
};

const emptyBox = (): Box => ({ x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity });

const grow = (box: Box, x: number, y: number): void => {
  box.x1 = Math.min(box.x1, x);
  box.y1 = Math.min(box.y1, y);
  box.x2 = Math.max(box.x2, x);
  box.y2 = Math.max(box.y2, y);
};

// The extreme of one axis of a quadratic segment, if it falls inside the segment.
const quadExtreme = (p0: number, p1: number, p2: number): number | null => {
  const denominator = p0 - 2 * p1 + p2;
  if (denominator === 0) return null;
  const t = (p0 - p1) / denominator;
  if (t <= 0 || t >= 1) return null;
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
};

/**
 * @function layoutText
 * @param text {string} printable ASCII (the bundled fonts hold nothing else)
 * @param options {TextOptions} weight, size, position and tracking
 * @returns {TextRun} path data, pen end, ink box and line box
 */
export const layoutText = (text: string, options: TextOptions): TextRun => {
  const { weight, size, x = 0, baseline = 0, tracking = 0 } = options;
  const font = loadFont(weight);
  const scale = size / font.unitsPerEm;
  // Check characters before shaping: ligatures (fi, fl) merge glyphs, so glyph i isn't char i.
  // Only a plain space may be blank; other spaces would draw as an empty .notdef box.
  for (const char of text) {
    if (char !== " " && (/\s/.test(char) || !font.hasChar(char))) {
      throw new Error(`No glyph for ${JSON.stringify(char)}: the bundled fonts cover ASCII only`);
    }
  }
  const glyphs = font.stringToGlyphs(text);
  const parts: string[] = [];
  const ink = emptyBox();
  let pen = 0;

  glyphs.forEach((glyph, index) => {
    const toX = (gx: number) => x + (pen + gx) * scale;
    const toY = (gy: number) => baseline - gy * scale;
    let last: [number, number] = [0, 0];
    for (const command of glyph.path.commands) {
      if (command.type === "Z") {
        parts.push("Z");
        continue;
      }
      const px = toX(command.x);
      const py = toY(command.y);
      switch (command.type) {
        case "M":
          parts.push(`M${num(px)} ${num(py)}`);
          break;
        case "L":
          // Fonts often repeat the current point; a zero-length line draws nothing.
          if (num(px) !== num(last[0]) || num(py) !== num(last[1])) {
            parts.push(`L${num(px)} ${num(py)}`);
          }
          break;
        case "Q": {
          const cx = toX(command.x1);
          const cy = toY(command.y1);
          parts.push(`Q${num(cx)} ${num(cy)} ${num(px)} ${num(py)}`);
          // A curve can bulge past its end points; its extreme on each axis widens the box on
          // that axis only (the other coordinate given is an end point, already inside).
          const ex = quadExtreme(last[0], cx, px);
          const ey = quadExtreme(last[1], cy, py);
          if (ex !== null) grow(ink, ex, py);
          if (ey !== null) grow(ink, px, ey);
          break;
        }
        case "C": {
          const c1 = [toX(command.x1), toY(command.y1)] as const;
          const c2 = [toX(command.x2), toY(command.y2)] as const;
          parts.push(
            `C${num(c1[0])} ${num(c1[1])} ${num(c2[0])} ${num(c2[1])} ${num(px)} ${num(py)}`,
          );
          // Cubic control points bound the curve; TrueType fonts like Nunito have none.
          grow(ink, ...c1);
          grow(ink, ...c2);
          break;
        }
      }
      grow(ink, px, py);
      last = [px, py];
    }
    const next = glyphs[index + 1];
    pen += glyph.advanceWidth ?? 0;
    if (next) pen += font.getKerningValue(glyph, next) + tracking * font.unitsPerEm;
  });

  return {
    d: parts.join(""),
    end: x + pen * scale,
    ink: ink.x1 === Infinity ? { x1: x, y1: baseline, x2: x, y2: baseline } : ink,
    line: { top: baseline - font.ascender * scale, bottom: baseline - font.descender * scale },
  };
};

/**
 * @file src/fit.ts
 * @desc Fitting user text (a pack, pool or template name) into the bundled ASCII-only Nunito:
 *       `asciiText` folds it to printable ASCII (accents dropped, typographic punctuation
 *       straightened, anything else left out), and `fitLines` wraps it at word breaks into at
 *       most N lines of a width, ending the last one with "..." when it doesn't fit.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { layoutText, type Weight } from "./text.js";

// Typographic characters with a close ASCII stand-in. Everything else outside printable ASCII
// (CJK, emoji, symbols) is left out: the bundled fonts hold nothing else.
const STAND_INS: Record<string, string> = {
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "–": "-",
  "—": "-",
  "…": "...",
  "·": "-",
  "•": "-",
  "×": "x",
  "★": "*",
  "☆": "*",
};

const ELLIPSIS = "...";

/**
 * @function asciiText
 * @param text {string} any text
 * @returns {string} the same text in printable ASCII on one line: accents dropped (é to e),
 *          curly quotes, dashes, "…", "·", "×" and "★" swapped for ASCII, anything else left out,
 *          runs of whitespace collapsed. May be "" (a name in Japanese only).
 */
export const asciiText = (text: string): string =>
  text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\x20-\x7e]/gu, (char) => STAND_INS[char] ?? (/\s/u.test(char) ? " " : ""))
    .replace(/\s+/g, " ")
    .trim();

/** How fitLines measures: the weight and size the lines are drawn at. */
export type FitOptions = { weight: Weight; size: number; maxWidth: number; maxLines: number };

const width = (text: string, weight: Weight, size: number): number =>
  layoutText(text, { weight, size }).end;

// The longest prefix of `text` (whole characters) that fits with "..." after it.
const clampToWidth = (text: string, options: FitOptions): string => {
  const { weight, size, maxWidth } = options;
  let end = text.length;
  while (end > 0 && width(`${text.slice(0, end).trimEnd()}${ELLIPSIS}`, weight, size) > maxWidth) {
    end -= 1;
  }
  return `${text.slice(0, end).trimEnd()}${ELLIPSIS}`;
};

// Splits a word too wide for a line into pieces that each fit.
const breakWord = (word: string, options: FitOptions): string[] => {
  const pieces: string[] = [];
  let piece = "";
  for (const char of word) {
    if (piece && width(piece + char, options.weight, options.size) > options.maxWidth) {
      pieces.push(piece);
      piece = char;
    } else piece += char;
  }
  return piece ? [...pieces, piece] : pieces;
};

/**
 * @function fitLines
 * @param text {string} printable ASCII on one line (see asciiText)
 * @param options {FitOptions} weight, size, the widest a line may be and how many lines
 * @returns {{ lines: string[]; clamped: boolean }} the lines, broken at spaces (a word wider
 *          than a line is broken inside), each within maxWidth by advance; past maxLines the
 *          last line ends in "..." and clamped is true
 */
export const fitLines = (
  text: string,
  options: FitOptions,
): { lines: string[]; clamped: boolean } => {
  const { weight, size, maxWidth, maxLines } = options;
  const words = text
    .split(" ")
    .filter(Boolean)
    .flatMap((word) => (width(word, weight, size) > maxWidth ? breakWord(word, options) : [word]));
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last !== undefined && width(`${last} ${word}`, weight, size) <= maxWidth) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else lines.push(word);
  }
  if (lines.length <= maxLines) return { lines, clamped: false };
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = clampToWidth(`${kept[maxLines - 1]} ${lines[maxLines]}`, options);
  return { lines: kept, clamped: true };
};

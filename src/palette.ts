/**
 * @file src/palette.ts
 * @desc The palette every haruhime.moe tool uses, built from one hue: six backgrounds (b1 to b6,
 *       light to dark), four text colors (c1 to c4) and two highlights (h1, h2), as hex. The
 *       same HSL recipe as @haruhimemoe/ui's theme.css (which haruhime.moe, packs and pools
 *       import), where an app only needs to set `--hue`. Imports nothing, so it's also the
 *       browser-safe @haruhimemoe/brand/palette entry.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

/** Saturation and lightness (percent) per token; the hue comes from the product. */
export const TOKENS = {
  b1: [10, 40],
  b2: [10, 30],
  b3: [10, 25],
  b4: [10, 20],
  b5: [10, 15],
  b6: [10, 10],
  c1: [40, 100],
  c2: [40, 90],
  c3: [40, 80],
  c4: [40, 70],
  h1: [100, 70],
  h2: [50, 45],
} as const satisfies Record<string, readonly [number, number]>;

export type Token = keyof typeof TOKENS;
export type Palette = Record<Token, string>;

/**
 * @function hslToHex
 * @param h {number} hue in degrees, any angle (-75 is 285, 480 is 120)
 * @param s {number} saturation, 0 to 100 (clamped, as browsers do)
 * @param l {number} lightness, 0 to 100 (clamped, as browsers do)
 * @returns {string} "#rrggbb", rounded the way browsers resolve hsl()
 * @throws {RangeError} when any argument isn't a finite number
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  if (![h, s, l].every(Number.isFinite)) {
    throw new RangeError(`hslToHex takes finite numbers, got (${h}, ${s}, ${l}).`);
  }
  const hue = ((h % 360) + 360) % 360;
  const clamp = (value: number) => Math.min(Math.max(value, 0), 100) / 100;
  const sat = clamp(s);
  const light = clamp(l);
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number): string => {
    const k = (n + hue / 30) % 12;
    const value = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
};

/**
 * @function palette
 * @param hue {number} the product's hue, 0 to 359
 * @returns {Palette} every token as "#rrggbb"
 */
export const palette = (hue: number): Palette => {
  if (!Number.isInteger(hue) || hue < 0 || hue > 359) {
    throw new RangeError(`hue must be an integer 0 to 359, got ${hue}.`);
  }
  const entries = Object.entries(TOKENS).map(([token, [s, l]]) => [token, hslToHex(hue, s, l)]);
  return Object.fromEntries(entries) as Palette;
};

/**
 * @file tests/palette.test.ts
 * @desc The palette recipe: packs.haruhime.moe's shipped colors at hue 333, and hslToHex the
 *       way browsers resolve hsl(): rounding, any hue angle, clamped saturation and lightness.
 *       And the @haruhimemoe/brand/palette entry: exactly these exports, and no imports.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { hslToHex, palette, TOKENS } from "../src/index.js";
import * as paletteEntry from "../src/palette.js";

describe("palette", () => {
  it("matches packs.haruhime.moe's brand colors at hue 333", () => {
    expect(palette(333)).toMatchObject({
      b6: "#1c1719",
      b4: "#382e32",
      c1: "#ffffff",
      c3: "#e0b8ca",
      h1: "#ff66ab",
      h2: "#ac396d",
    });
  });

  it("has every token, as #rrggbb", () => {
    const colors = palette(200);
    expect(Object.keys(colors)).toEqual(Object.keys(TOKENS));
    for (const hex of Object.values(colors)) expect(hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("converts HSL like browsers do", () => {
    expect(hslToHex(0, 100, 50)).toBe("#ff0000");
    expect(hslToHex(120, 100, 25)).toBe("#008000");
    expect(hslToHex(240, 0, 100)).toBe("#ffffff");
  });

  it.each([
    [-75, 285],
    [480, 120],
    [360, 0],
    [-360, 0],
  ])("reads hue %d as the same angle as %d", (hue, same) => {
    expect(hslToHex(hue, 100, 50)).toBe(hslToHex(same, 100, 50));
  });

  it("gives #bf00ff for hue -75, like hsl(-75 100% 50%)", () => {
    expect(hslToHex(-75, 100, 50)).toBe("#bf00ff");
  });

  it.each([
    [0, 0, 150, "#ffffff"],
    [0, 0, -10, "#000000"],
    [0, 150, 50, "#ff0000"],
    [0, -20, 50, "#808080"],
  ])("clamps hsl(%d, %d, %d) like a browser: %s", (h, s, l, hex) => {
    expect(hslToHex(h, s, l)).toBe(hex);
  });

  it.each([
    [Number.NaN, 50, 50],
    [0, Number.POSITIVE_INFINITY, 50],
    [0, 50, Number.NaN],
  ])("rejects hslToHex(%d, %d, %d)", (h, s, l) => {
    expect(() => hslToHex(h, s, l)).toThrow(RangeError);
  });

  it.each([-1, 360, 1.5, Number.NaN])("rejects a hue outside 0 to 359 (%j)", (hue) => {
    expect(() => palette(hue)).toThrow(RangeError);
  });
});

describe("the @haruhimemoe/brand/palette entry", () => {
  it("exports the palette and nothing else", () => {
    expect(Object.keys(paletteEntry).sort()).toEqual(["TOKENS", "hslToHex", "palette"]);
  });

  // Browser-safe: an import here could pull the fonts, node:fs or resvg into an app's bundle.
  it("imports nothing", () => {
    const source = readFileSync(new URL("../src/palette.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/^\s*(import|export .* from)\b/m);
  });
});

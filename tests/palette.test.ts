/**
 * @file tests/palette.test.ts
 * @desc The palette recipe: packs.haruhime.moe's shipped colors at hue 333, and hex rounding.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { describe, expect, it } from "vitest";
import { hslToHex, palette, TOKENS } from "../src/index.js";

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

  it.each([-1, 360, 1.5, Number.NaN])("rejects a hue outside 0 to 359 (%j)", (hue) => {
    expect(() => palette(hue)).toThrow(RangeError);
  });
});

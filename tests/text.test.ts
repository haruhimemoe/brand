/**
 * @file tests/text.test.ts
 * @desc Text layout: glyphs upright (opentype.js 2.0's getPath flips them), kerning and tracking
 *       applied, exact ink boxes, number formatting, and a clear error outside ASCII.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { describe, expect, it } from "vitest";
import { layoutText } from "../src/index.js";
import { num } from "../src/text.js";

const bold = { weight: 800 as const, size: 1000 };

describe("layoutText", () => {
  it("draws glyphs upright: p's bowl above the baseline, its stem below", () => {
    // Nunito ExtraBold p: x-height 501 units, descender 189.
    const { ink } = layoutText("p", { ...bold, baseline: 1000 });
    expect(ink.y1).toBeCloseTo(499, 0);
    expect(ink.y2).toBeCloseTo(1189, 0);
    // The stem is the leftmost ink and reaches the bottom: its first point is below the baseline.
    const { d } = layoutText("p", { ...bold, baseline: 1000 });
    const [, , y] = /^M([\d.]+) ([\d.]+)/.exec(d) ?? [];
    expect(Number(y)).toBeGreaterThan(1000);
  });

  it("applies the font's kerning", () => {
    const pair = layoutText("ks", bold).end;
    const apart = layoutText("k", bold).end + layoutText("s", bold).end;
    expect(pair).toBeLessThan(apart);
  });

  it("adds tracking between letters only", () => {
    const plain = layoutText("abc", bold).end;
    expect(layoutText("abc", { ...bold, tracking: -0.05 }).end).toBeCloseTo(plain - 100, 5);
    expect(layoutText("a", { ...bold, tracking: -0.05 }).end).toBe(layoutText("a", bold).end);
  });

  it("offsets by x and baseline", () => {
    const base = layoutText("o", bold);
    const moved = layoutText("o", { ...bold, x: 10, baseline: 20 });
    expect(moved.ink.x1 - base.ink.x1).toBeCloseTo(10, 5);
    expect(moved.ink.y1 - base.ink.y1).toBeCloseTo(20, 5);
    expect(moved.line.top - base.line.top).toBeCloseTo(20, 5);
  });

  it("measures curves to their extremes, not their control points", () => {
    // "o" is all curves; its ink sits inside the control-point hull.
    const { ink } = layoutText("o", bold);
    const points = [...layoutText("o", bold).d.matchAll(/-?[\d.]+/g)].map(Number);
    const ys = points.filter((_, index) => index % 2 === 1);
    expect(ink.y1).toBeGreaterThanOrEqual(Math.min(...ys) - 0.01);
    expect(ink.y2).toBeLessThanOrEqual(Math.max(...ys) + 0.01);
  });

  it("gives an empty run a zero-size box at the pen", () => {
    expect(layoutText(" ", { ...bold, x: 5, baseline: 7 }).ink).toEqual({
      x1: 5,
      y1: 7,
      x2: 5,
      y2: 7,
    });
  });

  it("refuses characters the bundled fonts don't have", () => {
    expect(() => layoutText("café", bold)).toThrow('No glyph for "é"');
  });
});

describe("num", () => {
  it.each([
    [1.005, "1"],
    [2.5, "2.5"],
    [-0.001, "0"],
    [123.456, "123.46"],
  ])("formats %d as %s", (value, text) => {
    expect(num(value)).toBe(text);
  });
});

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

  it.each(["o", "packs", "Qgjy@"])("measures %j's ink exactly (against sampled curves)", (text) => {
    const { d, ink } = layoutText(text, bold);
    // Walk the path, sampling each quadratic finely, and take the box of every sample.
    const box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
    const add = (x: number, y: number) => {
      box.x1 = Math.min(box.x1, x);
      box.y1 = Math.min(box.y1, y);
      box.x2 = Math.max(box.x2, x);
      box.y2 = Math.max(box.y2, y);
    };
    let at = [0, 0];
    for (const [, type, args = ""] of d.matchAll(/([MLQZ])([^MLQZ]*)/g)) {
      const n = args.trim().split(" ").filter(Boolean).map(Number);
      if (type === "Q") {
        const [cx = 0, cy = 0, x = 0, y = 0] = n;
        for (let step = 0; step <= 200; step += 1) {
          const t = step / 200;
          add(
            (1 - t) ** 2 * (at[0] ?? 0) + 2 * (1 - t) * t * cx + t * t * x,
            (1 - t) ** 2 * (at[1] ?? 0) + 2 * (1 - t) * t * cy + t * t * y,
          );
        }
        at = [x, y];
      } else if (type !== "Z") {
        at = [n[0] ?? 0, n[1] ?? 0];
        add(at[0] ?? 0, at[1] ?? 0);
      }
    }
    // Path data is rounded to 0.01, so allow that much.
    for (const key of ["x1", "y1", "x2", "y2"] as const) expect(ink[key]).toBeCloseTo(box[key], 1);
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

  it("names the right character even after a ligature (fi)", () => {
    expect(() => layoutText("fi é", bold)).toThrow('No glyph for "é"');
    expect(() => layoutText("fié", bold)).toThrow('No glyph for "é"');
  });

  it.each(["\u00a0", "\t", "\u2009", "\u3000"])(
    "refuses whitespace other than a space: %j",
    (space) => {
      expect(() => layoutText(`a${space}b`, bold)).toThrow("No glyph for");
    },
  );

  it("writes no zero-length segments", () => {
    const { d } = layoutText("packs", bold);
    const commands = [...d.matchAll(/([MLQCZ])([^MLQCZ]*)/g)];
    let current = "";
    for (const [, type, args = ""] of commands) {
      const point = args.trim().split(" ").slice(-2).join(" ");
      if (type === "L") expect(point).not.toBe(current);
      if (type !== "Z") current = point;
    }
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

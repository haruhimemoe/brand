/**
 * @file tests/svg.test.ts
 * @desc The drawings: wordmark colors per background and its crop, the parent brand's stacked
 *       wordmark (".moe" right-aligned under "haruhime"), icons the same letter size across
 *       products and inside their canvas, the link preview's size and label.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { describe, expect, it } from "vitest";
import {
  escapeXml,
  iconSvg,
  layoutText,
  ogSvg,
  PRODUCTS,
  type Product,
  palette,
  wordmarkSvg,
} from "../src/index.js";

const products = Object.values(PRODUCTS) as Product[];

// Every x,y pair in the path data and circles of an SVG.
const inkPoints = (svg: string): [number, number][] => {
  const points: [number, number][] = [];
  for (const [, d = ""] of svg.matchAll(/ d="([^"]+)"/g)) {
    const values = [...d.matchAll(/-?[\d.]+/g)].map(Number);
    for (let index = 0; index + 1 < values.length; index += 2) {
      points.push([values[index] ?? 0, values[index + 1] ?? 0]);
    }
  }
  for (const [, cx, cy, r] of svg.matchAll(/cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.-]+)"/g)) {
    points.push([Number(cx) - Number(r), Number(cy) - Number(r)]);
    points.push([Number(cx) + Number(r), Number(cy) + Number(r)]);
  }
  return points;
};

describe("wordmarkSvg", () => {
  it("is white text with an h1 dot for dark backgrounds, dark text for light ones", () => {
    const colors = palette(PRODUCTS.pools.hue);
    const dark = wordmarkSvg(PRODUCTS.pools);
    const light = wordmarkSvg(PRODUCTS.pools, { background: "light" });
    expect(dark).toContain(`<path fill="${colors.c1}"`);
    expect(dark).toContain(`fill="${colors.h1}"/>`);
    // h1 is too pale on white (sheets' green is 1.3:1); the deeper h2 carries the dot there.
    expect(light).toContain(`<path fill="${colors.b6}"`);
    expect(light).toContain(`fill="${colors.h2}"/>`);
  });

  it("is labelled and cropped to its ink with a margin", () => {
    const svg = wordmarkSvg(PRODUCTS.sheets);
    expect(svg).toContain('role="img" aria-label="sheets"');
    const [x, y, width, height] = (/viewBox="([^"]+)"/.exec(svg)?.[1] ?? "").split(" ").map(Number);
    for (const [px, py] of inkPoints(svg)) {
      expect(px).toBeGreaterThanOrEqual((x ?? 0) + 39);
      expect(px).toBeLessThanOrEqual((x ?? 0) + (width ?? 0) - 39);
      expect(py).toBeGreaterThanOrEqual((y ?? 0) + 39);
      expect(py).toBeLessThanOrEqual((y ?? 0) + (height ?? 0) - 39);
    }
  });

  it("puts the dot after the last letter, on the baseline", () => {
    const svg = wordmarkSvg(PRODUCTS.packs);
    const [, cx, cy, r] = /cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/.exec(svg) ?? [];
    expect(Number(r)).toBe(75);
    expect(Number(cy) + Number(r)).toBe(1000);
    const letters = inkPoints(svg.replace(/<circle[^>]+>/, "")).map(([px]) => px);
    expect(Number(cx) - Number(r)).toBeGreaterThan(Math.max(...letters));
  });
});

// The filled paths of an SVG, in order: [fill, points].
const paths = (svg: string) =>
  [...svg.matchAll(/<path fill="([^"]+)" d="([^"]+)"/g)].map(
    ([, fill, d]) => [fill, inkPoints(` d="${d}"`)] as const,
  );
const extent = (points: readonly [number, number][]) => ({
  x1: Math.min(...points.map(([px]) => px)),
  y1: Math.min(...points.map(([, py]) => py)),
  x2: Math.max(...points.map(([px]) => px)),
  y2: Math.max(...points.map(([, py]) => py)),
});

describe("wordmarkSvg with a suffix (stacked)", () => {
  const product = PRODUCTS.haruhime;
  const colors = palette(product.hue);

  it.each([
    ["dark", {}, colors.c1, colors.h1],
    ["light", { background: "light" as const }, colors.b6, colors.h2],
  ])(
    "%s: name, then the suffix's dot in the highlight, then its letters",
    (_, options, text, dot) => {
      const svg = wordmarkSvg(product, options);
      expect(paths(svg).map(([fill]) => fill)).toEqual([text, dot, text]);
      // The suffix's dot is its own glyph, so the name gets no round dot of its own.
      expect(svg).not.toContain("<circle");
    },
  );

  it("is labelled with the whole name", () => {
    expect(wordmarkSvg(product)).toContain('role="img" aria-label="haruhime.moe"');
  });

  it("puts the suffix on a second line, right-aligned to the name, at half size", () => {
    const [name, dot, letters] = paths(wordmarkSvg(product)).map(([, points]) => extent(points));
    if (!name || !dot || !letters) throw new Error("expected three paths");
    // Below the name, with a gap.
    expect(dot.y1).toBeGreaterThan(name.y2);
    expect(letters.y1).toBeGreaterThan(name.y2);
    // Ends where the name ends (control points may sit a hair outside the ink).
    expect(Math.abs(letters.x2 - name.x2)).toBeLessThan(8);
    // The dot, then the letters, on one baseline.
    expect(dot.x2).toBeLessThan(letters.x1);
    expect(dot.y2).toBeCloseTo(letters.y2, -1);
    // The same glyphs as ".moe" at half the name's size.
    const full = layoutText(".moe", { weight: 800, size: 1000 }).ink;
    expect((letters.x2 - dot.x1) / (full.x2 - full.x1)).toBeCloseTo(0.5, 2);
  });

  it("is cropped to both lines' ink with the same 40-unit margin", () => {
    const svg = wordmarkSvg(product);
    const [x = 0, y = 0, width = 0, height = 0] = (/viewBox="([^"]+)"/.exec(svg)?.[1] ?? "")
      .split(" ")
      .map(Number);
    const box = extent(inkPoints(svg));
    expect(box.x1).toBeGreaterThanOrEqual(x + 39);
    expect(box.y1).toBeGreaterThanOrEqual(y + 39);
    expect(box.x2).toBeLessThanOrEqual(x + width - 39);
    expect(box.y2).toBeLessThanOrEqual(y + height - 39);
    // Tight: the ink reaches the margin on every side.
    expect(box.x1).toBeLessThan(x + 41);
    expect(box.y1).toBeLessThan(y + 41);
    expect(box.x2).toBeGreaterThan(x + width - 41);
    expect(box.y2).toBeGreaterThan(y + height - 41);
  });
});

describe("iconSvg", () => {
  it("draws a one-letter mark with the dot, like the two-letter ones", () => {
    const svg = iconSvg(PRODUCTS.haruhime);
    const colors = palette(PRODUCTS.haruhime.hue);
    const [letter] = paths(svg);
    expect(letter?.[0]).toBe(colors.c1);
    // "h" is one outline.
    expect([
      ...(/<path fill="[^"]+" d="([^"]+)"/.exec(svg)?.[1] ?? "").matchAll(/M/g),
    ]).toHaveLength(1);
    expect(svg).toMatch(new RegExp(`<circle [^>]+fill="${colors.h1}"/>`));
    expect(svg).toContain('aria-label="haruhime.moe"');
  });

  it.each(products.map((product) => [product.name, product] as const))(
    "%s: keeps its ink inside the 64×64 canvas with a margin, centered horizontally",
    (_, product) => {
      const xs = inkPoints(iconSvg(product)).map(([px]) => px);
      const ys = inkPoints(iconSvg(product)).map(([, py]) => py);
      expect(Math.min(...xs)).toBeGreaterThan(6);
      expect(Math.max(...xs)).toBeLessThan(58);
      expect(Math.min(...ys)).toBeGreaterThan(6);
      expect(Math.max(...ys)).toBeLessThan(58);
      // Control points can sit just outside the ink, so allow a little slack.
      expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(32, 0);
      expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(32, 0);
    },
  );

  it("draws every product's letters at the same size (same dot radius)", () => {
    const radii = products.map((product) => /r="([\d.]+)"/.exec(iconSvg(product))?.[1]);
    expect(new Set(radii).size).toBe(1);
  });

  it("has rounded corners unless square is asked for", () => {
    expect(iconSvg(PRODUCTS.pools)).toContain('rx="14"');
    expect(iconSvg(PRODUCTS.pools, { shape: "square" })).not.toContain("rx=");
  });
});

describe("ogSvg", () => {
  it("is 1200×630, labelled with the tagline, on the darkest background", () => {
    const svg = ogSvg(PRODUCTS.pools);
    expect(svg).toContain('width="1200" height="630"');
    expect(svg).toContain('aria-label="pools: osu! mappools for tournament hosts"');
    expect(svg).toContain(`fill="${palette(200).b6}"`);
  });

  it("draws the title like the wordmark (no extra tracking)", () => {
    const title = ogSvg(PRODUCTS.packs).match(/<path fill="[^"]+" d="([^"]+)"/)?.[1] ?? "";
    const letters = [...title.matchAll(/M/g)].length;
    const wordmark = wordmarkSvg(PRODUCTS.packs).match(/ d="([^"]+)"/)?.[1] ?? "";
    expect(letters).toBe([...wordmark.matchAll(/M/g)].length);
    // Same shapes at 150/1000 scale: the dot's gap from the text scales with it.
    const dotX = (svg: string) => Number(/<circle cx="([\d.]+)"/.exec(svg)?.[1]);
    const wordmarkGap = dotX(wordmarkSvg(PRODUCTS.packs)) * 0.15 + 96;
    expect(dotX(ogSvg(PRODUCTS.packs))).toBeCloseTo(wordmarkGap, 0);
  });

  it("stacks the parent brand's wordmark over its tagline", () => {
    const svg = ogSvg(PRODUCTS.haruhime);
    const colors = palette(PRODUCTS.haruhime.hue);
    expect(svg).toContain('aria-label="haruhime.moe: osu! tools for tournament hosts"');
    const [name, dot, letters, tagline] = paths(svg).map(([fill, points]) => ({
      fill,
      ...extent(points),
    }));
    if (!name || !dot || !letters || !tagline) throw new Error("expected four paths");
    expect([name.fill, dot.fill, letters.fill, tagline.fill]).toEqual([
      colors.c1,
      colors.h1,
      colors.c1,
      colors.c3,
    ]);
    expect(Math.abs(letters.x2 - name.x2)).toBeLessThan(2);
    expect(letters.y1).toBeGreaterThan(name.y2);
    expect(tagline.y1).toBeGreaterThan(letters.y2);
    // Left-aligned on the same pen x; the glyphs' side bearings differ by a few pixels.
    expect(Math.abs(name.x1 - tagline.x1)).toBeLessThan(10);
  });

  it("keeps everything inside the image", () => {
    for (const product of products) {
      for (const [px, py] of inkPoints(ogSvg(product))) {
        expect(px).toBeGreaterThanOrEqual(0);
        expect(px).toBeLessThanOrEqual(1200);
        expect(py).toBeGreaterThanOrEqual(0);
        expect(py).toBeLessThanOrEqual(630);
      }
    }
  });
});

describe("snapshots", () => {
  // Any visual change shows up here as a diff to review (and a dependency bump can't drift).
  it.each(products.map((product) => [product.name, product] as const))(
    "%s",
    async (name, product) => {
      await expect(wordmarkSvg(product)).toMatchFileSnapshot(`__snapshots__/${name}-wordmark.svg`);
      await expect(wordmarkSvg(product, { background: "light" })).toMatchFileSnapshot(
        `__snapshots__/${name}-wordmark-dark.svg`,
      );
      await expect(iconSvg(product)).toMatchFileSnapshot(`__snapshots__/${name}-icon.svg`);
      await expect(ogSvg(product)).toMatchFileSnapshot(`__snapshots__/${name}-og.svg`);
    },
  );
});

describe("escapeXml", () => {
  it("escapes markup characters", () => {
    expect(escapeXml(`a&b<c>"d'`)).toBe("a&#38;b&#60;c&#62;&#34;d&#39;");
  });
});

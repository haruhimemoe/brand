/**
 * @file tests/svg.test.ts
 * @desc The drawings: wordmark colors per background and its crop, icons the same letter size
 *       across products and inside their canvas, the link preview's size and label.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { describe, expect, it } from "vitest";
import {
  escapeXml,
  iconSvg,
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
    expect(light).toContain(`<path fill="${colors.b6}"`);
    for (const svg of [dark, light]) expect(svg).toContain(`fill="${colors.h1}"/>`);
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

describe("iconSvg", () => {
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

describe("escapeXml", () => {
  it("escapes markup characters", () => {
    expect(escapeXml(`a&b<c>"d'`)).toBe("a&#38;b&#60;c&#62;&#34;d&#39;");
  });
});

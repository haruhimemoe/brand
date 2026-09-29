/**
 * @file tests/card.test.ts
 * @desc Per-page link previews: asciiText folding, fitLines wrapping and clamping, and ogCardSvg
 *       keeping every line inside the image's padding and below the wordmark for short, long,
 *       unbreakable and non-ASCII titles, on every product. ogCard renders a 1200×630 PNG.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { describe, expect, it } from "vitest";
import {
  asciiText,
  fitLines,
  layoutText,
  OG_CARD,
  ogCard,
  ogCardSvg,
  PRODUCTS,
  type Product,
  palette,
} from "../src/index.js";

const products = Object.values(PRODUCTS) as Product[];

// Every x,y pair in an SVG's path data, per path (the first is the wordmark's name).
const paths = (svg: string): [number, number][][] =>
  [...svg.matchAll(/ d="([^"]+)"/g)].map(([, d = ""]) => {
    const values = [...d.matchAll(/-?[\d.]+/g)].map(Number);
    const points: [number, number][] = [];
    for (let index = 0; index + 1 < values.length; index += 2) {
      points.push([values[index] ?? 0, values[index + 1] ?? 0]);
    }
    return points;
  });

const LONG =
  "The Very Long Name Of A Community Tournament With Many Words That Goes On And On Forever Qualifiers";
const CASES = {
  short: { title: "Userpage" },
  pack: { eyebrow: "Mappool pack", title: "osu! World Cup 2025", subtitle: "13 maps · 5.2-6.4★" },
  long: { eyebrow: "Tournament mappool", title: LONG, subtitle: `${LONG} ${LONG}` },
  unbroken: { title: "A".repeat(200), subtitle: "x".repeat(300) },
  japanese: { title: "日本語 テンプレート", eyebrow: "Template" },
};

describe("asciiText", () => {
  it("folds accents and typographic punctuation, drops the rest, collapses space", () => {
    expect(asciiText("Café “Nitro+” – 5.2★ × 2…")).toBe('Cafe "Nitro+" - 5.2* x 2...');
    expect(asciiText("  日本語  cup\t ")).toBe("cup");
    expect(asciiText("日本語")).toBe("");
  });
});

describe("fitLines", () => {
  const options = { weight: 800, size: 88, maxWidth: 1040, maxLines: 2 } as const;

  it("keeps short text on one line", () => {
    expect(fitLines("osu! World Cup", options)).toEqual({
      lines: ["osu! World Cup"],
      clamped: false,
    });
  });

  it("wraps at spaces, each line within the width, and clamps the last with ...", () => {
    const fit = fitLines(LONG, options);
    expect(fit.clamped).toBe(true);
    expect(fit.lines).toHaveLength(2);
    expect(fit.lines[1]?.endsWith("...")).toBe(true);
    for (const line of fit.lines) {
      expect(layoutText(line, { weight: 800, size: 88 }).end).toBeLessThanOrEqual(1040);
    }
  });

  it("breaks a word wider than a line", () => {
    const fit = fitLines("W".repeat(40), { ...options, maxLines: 5 });
    expect(fit.lines.length).toBeGreaterThan(1);
    expect(fit.lines.join("")).toBe("W".repeat(40));
  });
});

describe("ogCardSvg", () => {
  it.each(
    products.flatMap((product) =>
      Object.entries(CASES).map(([name, card]) => [product.name, name, product, card] as const),
    ),
  )(
    "%s %s: keeps every line inside the padding and below the wordmark",
    (_product, _case, product, card) => {
      const [mark = [], ...rest] = paths(ogCardSvg(product, card));
      const markBottom = Math.max(...mark.map(([, y]) => y));
      // Control points can sit a hair outside the ink, so allow a little slack.
      for (const points of rest) {
        for (const [x, y] of points) {
          expect(x).toBeGreaterThanOrEqual(OG_CARD.padding - 8);
          expect(x).toBeLessThanOrEqual(OG_CARD.width - OG_CARD.padding + 8);
          expect(y).toBeLessThanOrEqual(OG_CARD.height - OG_CARD.padding + 4);
        }
      }
      // The text below the wordmark starts under it (the suffix's small line counts as mark).
      const textTop = Math.min(
        ...rest
          .slice(product.suffix ? 2 : 0)
          .flat()
          .map(([, y]) => y),
      );
      expect(textTop).toBeGreaterThan(markBottom);
    },
  );

  it("is labelled with the original text and colored from the palette", () => {
    const svg = ogCardSvg(PRODUCTS.packs, CASES.pack);
    const colors = palette(PRODUCTS.packs.hue);
    expect(svg).toContain('width="1200" height="630"');
    expect(svg).toContain("Mappool pack: osu! World Cup 2025: 13 maps · 5.2-6.4★ - packs");
    expect(svg).toContain(`fill="${colors.b6}"`);
    expect(svg).toContain(`<path fill="${colors.h1}"`);
    expect(svg).toContain(`<path fill="${colors.c3}"`);
    expect(svg).not.toContain("<text");
  });

  it("falls back to the tagline when no title text is drawable", () => {
    const withTagline = ogCardSvg(PRODUCTS.bb, { title: PRODUCTS.bb.tagline });
    expect(ogCardSvg(PRODUCTS.bb, { title: "日本語" }).replace(/aria-label="[^"]*"/, "")).toBe(
      withTagline.replace(/aria-label="[^"]*"/, ""),
    );
  });

  it("is deterministic", () => {
    expect(ogCardSvg(PRODUCTS.pools, CASES.long)).toBe(ogCardSvg(PRODUCTS.pools, CASES.long));
  });
});

describe("ogCard", () => {
  it("renders a 1200×630 PNG", () => {
    const png = ogCard(PRODUCTS.pools, CASES.pack);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect([...png.slice(1, 4)].map((byte) => String.fromCharCode(byte)).join("")).toBe("PNG");
    expect(view.getUint32(16)).toBe(1200);
    expect(view.getUint32(20)).toBe(630);
  });
});

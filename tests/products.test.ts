/**
 * @file tests/products.test.ts
 * @desc The product table: keys match names, marks are one or two letters and unique, hues are
 *       valid, and every string can be drawn with the bundled fonts. The parent brand, haruhime.moe,
 *       has a suffix and shares packs' pink; the tools each have their own hue.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { describe, expect, it } from "vitest";
import { isProductKey, layoutText, PRODUCTS, type Product } from "../src/index.js";

const entries = Object.entries(PRODUCTS);
const bold = { weight: 800 as const, size: 10 };

describe("PRODUCTS", () => {
  it.each(entries)("%s is well-formed and drawable", (key, product) => {
    const { suffix } = product as Product;
    expect(product.name).toBe(key);
    expect(product.mark).toMatch(/^[a-z]{1,2}$/);
    expect(product.hue).toBeGreaterThanOrEqual(0);
    expect(product.hue).toBeLessThan(360);
    expect(product.url).toBe(
      suffix === undefined ? `https://${key}.haruhime.moe` : `https://${key}${suffix}`,
    );
    expect(() => layoutText(product.tagline, { weight: 400, size: 10 })).not.toThrow();
    if (suffix !== undefined) expect(() => layoutText(suffix, bold)).not.toThrow();
  });

  it("has the parent brand, haruhime.moe, stacked over its suffix", () => {
    expect(PRODUCTS.haruhime).toEqual({
      name: "haruhime",
      mark: "h",
      suffix: ".moe",
      hue: 333,
      tagline: "osu! tools for tournament hosts",
      url: "https://haruhime.moe",
    });
  });

  it("gives every product its own mark, and every tool its own hue", () => {
    const tools = entries.filter(([, product]) => (product as Product).suffix === undefined);
    expect(new Set(entries.map(([, product]) => product.mark)).size).toBe(entries.length);
    expect(new Set(tools.map(([, product]) => product.hue)).size).toBe(tools.length);
  });

  it("recognizes product keys only", () => {
    expect(isProductKey("pools")).toBe(true);
    expect(isProductKey("haruhime")).toBe(true);
    expect(isProductKey("toString")).toBe(false);
  });
});

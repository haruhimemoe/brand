/**
 * @file tests/products.test.ts
 * @desc The product table: keys match names, marks are two letters and unique, hues are valid,
 *       and every string can be drawn with the bundled fonts.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { describe, expect, it } from "vitest";
import { isProductKey, layoutText, PRODUCTS } from "../src/index.js";

const entries = Object.entries(PRODUCTS);

describe("PRODUCTS", () => {
  it.each(entries)("%s is well-formed and drawable", (key, product) => {
    expect(product.name).toBe(key);
    expect(product.mark).toMatch(/^[a-z]{2}$/);
    expect(product.hue).toBeGreaterThanOrEqual(0);
    expect(product.hue).toBeLessThan(360);
    expect(product.url).toBe(`https://${key}.haruhime.moe`);
    expect(() => layoutText(product.tagline, { weight: 400, size: 10 })).not.toThrow();
  });

  it("gives every product its own mark and hue", () => {
    expect(new Set(entries.map(([, product]) => product.mark)).size).toBe(entries.length);
    expect(new Set(entries.map(([, product]) => product.hue)).size).toBe(entries.length);
  });

  it("recognizes product keys only", () => {
    expect(isProductKey("pools")).toBe(true);
    expect(isProductKey("toString")).toBe(false);
  });
});

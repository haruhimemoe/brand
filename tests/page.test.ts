/**
 * @file tests/page.test.ts
 * @desc Brand page data: brandPageData builds a complete BrandPageData per product, with the
 *       family link present on every tool and absent on the parent brand, and BRAND_CONTACT is
 *       the one address every page shows. Also guards that src/page.ts, src/products.ts and
 *       src/palette.ts stay browser-safe: no opentype.js, no node: builtins, no font, SVG or PNG
 *       module.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BRAND_CONTACT, brandPageData } from "../src/page.js";

describe("brandPageData", () => {
  it("builds pools", () => {
    const data = brandPageData("pools");
    expect(data.name).toBe("pools");
    expect(data.contact).toBe("haruhime@haruhime.moe");
    expect(data.familyHref).toBe("https://haruhime.moe/brand");
    expect(data.assets.map((a) => a.href)).toEqual([
      "/brand/pools-icon.svg",
      "/brand/pools-wordmark.svg",
      "/brand/pools-wordmark-on-light.svg",
      "/brand/pools-banner.svg",
      "/brand/pools-banner-on-light.svg",
      "/brand/pools-banner.png",
      "/brand/pools-palette.json",
    ]);
    expect(Object.keys(data.palette)).toContain("h1");
  });

  it("has no family link on the parent", () => {
    expect(brandPageData("haruhime").familyHref).toBeNull();
    expect(brandPageData("haruhime").name).toBe("haruhime.moe");
  });

  it("exports the contact", () => expect(BRAND_CONTACT).toBe("haruhime@haruhime.moe"));
});

describe("browser safety", () => {
  it("keeps src/page.ts, src/products.ts and src/palette.ts free of build-time imports", () => {
    const banned = ["opentype", "node:", "./fonts.js", "./svg.js", "./png.js"];
    for (const file of ["src/page.ts", "src/products.ts", "src/palette.ts"]) {
      const source = readFileSync(file, "utf8");
      for (const needle of banned) expect(source).not.toContain(needle);
    }
  });
});

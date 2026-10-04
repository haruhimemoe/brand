/**
 * @file src/page.ts
 * @desc Brand page data: everything an app's `/brand` page needs to render one product's
 *       assets, writing guidance and dos/don'ts, built from `PRODUCTS` and `palette`. Imports
 *       only `./products.js` and `./palette.js`, so it's safe for the browser-safe
 *       `@haruhimemoe/brand/products` entry (no fonts, no file system, no PNG renderer).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { palette } from "./palette.js";
import { fullName, isProductKey, PRODUCTS, type Product, type ProductKey } from "./products.js";

// Re-exported so @haruhimemoe/brand/products is a complete, browser-safe entry on its own: the
// table, its helpers and their types, plus the brand-page data this module adds.
export { fullName, isProductKey, PRODUCTS, type Product, type ProductKey };

/** The one address a brand page shows for licensing or usage questions. */
export const BRAND_CONTACT = "haruhime@haruhime.moe";

/** A `/brand` page's own link, shown on every tool's page so visitors can reach the family. */
const FAMILY_HREF = "https://haruhime.moe/brand";

export type BrandAsset = {
  /** What the link is labeled on the page. */
  label: string;
  /** Where the file lives once an app has run `haruhime-brand`, under `public/`. */
  href: string;
  /** True for the asset drawn for a dark background; false for its on-light counterpart. */
  dark: boolean;
};

export type BrandPageData = {
  /** The name as its wordmark reads, suffix included ("pools", "haruhime.moe"). */
  name: string;
  /** The one or two letters on the icon. */
  mark: string;
  /** The line under the wordmark in link previews and README banners. */
  tagline: string;
  /** The product's site. */
  url: string;
  /** How to write the name in running text. */
  writing: string;
  /** What a brand page tells people to do with the files. */
  dos: readonly string[];
  /** What a brand page tells people not to do with the logo. */
  donts: readonly string[];
  /** Every token as `"#rrggbb"`, from `palette(product.hue)`. */
  palette: Record<string, string>;
  /** The product's brand-page files, under `/brand/`, in the order they're shown. */
  assets: BrandAsset[];
  /** The contact address, same as `BRAND_CONTACT`. */
  contact: string;
  /** The parent brand page's link, or null on the parent's own page. */
  familyHref: string | null;
};

/**
 * @function brandAssets
 * @param name {string} the product's file-name segment (`product.name`, not its full name)
 * @returns {BrandAsset[]} the seven brand-page files `haruhime-brand` writes under `/brand/`
 */
const brandAssets = (name: string): BrandAsset[] => [
  { label: "Icon", href: `/brand/${name}-icon.svg`, dark: true },
  { label: "Wordmark", href: `/brand/${name}-wordmark.svg`, dark: true },
  { label: "Wordmark, on light", href: `/brand/${name}-wordmark-on-light.svg`, dark: false },
  { label: "Banner", href: `/brand/${name}-banner.svg`, dark: true },
  { label: "Banner, on light", href: `/brand/${name}-banner-on-light.svg`, dark: false },
  { label: "Banner (PNG)", href: `/brand/${name}-banner.png`, dark: true },
  { label: "Palette (JSON)", href: `/brand/${name}-palette.json`, dark: true },
];

/**
 * @function brandPageData
 * @param key {ProductKey} a key of `PRODUCTS`
 * @returns {BrandPageData} the product's name, writing, dos/don'ts, palette, assets and contact,
 *          with `familyHref` set to the parent brand page's link, or null for haruhime itself
 */
export const brandPageData = (key: ProductKey): BrandPageData => {
  const product = PRODUCTS[key];
  return {
    name: fullName(product),
    mark: product.mark,
    tagline: product.tagline,
    url: product.url,
    writing: product.writing,
    dos: product.dos,
    donts: product.donts,
    palette: palette(product.hue),
    assets: brandAssets(product.name),
    contact: BRAND_CONTACT,
    familyHref: key === "haruhime" ? null : FAMILY_HREF,
  };
};

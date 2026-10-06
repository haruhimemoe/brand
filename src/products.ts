/**
 * @file src/products.ts
 * @desc The haruhime.moe brands: the parent site and its tools, each a name, a monogram, a hue, a
 *       tagline, and the writing and dos/don'ts shown on its brand page. Adding one here is all
 *       it takes to generate its brand files.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Tue Oct 6, 2026
 */

export type Product = {
  /** Lowercase; the wordmark and the file names. */
  name: string;
  /** One or two lowercase letters; the icon shows them followed by the dot. */
  mark: string;
  /**
   * Printable ASCII drawn half size on a second line under the name, right-aligned to it, its
   * first character in the highlight color (".moe" for the parent site). Without one (or with
   * ""), the wordmark is the name and a round dot.
   */
  suffix?: string;
  /** 0 to 359; the palette's hue. */
  hue: number;
  /** One line under the wordmark in link previews and README banners. */
  tagline: string;
  /** The product's site (shown by `list`). */
  url: string;
  /** How to write the name in running text, for the brand page. */
  writing: string;
  /** At least two things a brand page tells people to do with the files. */
  dos: readonly string[];
  /** At least two things a brand page tells people not to do with the logo. */
  donts: readonly string[];
};

/** Shared across every product: a brand page always says to use the files as given. */
const DOS: readonly string[] = [
  "Use the files as they are, from this page.",
  "Keep space around the icon about the width of its dot.",
  "Use the on-light files on light backgrounds.",
];

/** Shared across every product: a brand page always warns against these. */
const DONTS: readonly string[] = [
  "Don't recolor, stretch, rotate or outline the logo.",
  "Don't capitalize the name.",
  "Don't use the logo to suggest an official osu! or ppy product.",
];

export const PRODUCTS = {
  haruhime: {
    name: "haruhime",
    mark: "h",
    suffix: ".moe",
    hue: 333,
    tagline: "osu! tools for players, mappers and hosts",
    url: "https://haruhime.moe",
    writing: "haruhime.moe, all lowercase, with the .moe. Just haruhime is fine in running text.",
    dos: DOS,
    donts: DONTS,
  },
  packs: {
    name: "packs",
    mark: "pk",
    hue: 30,
    tagline: "osu! beatmap packs for tournament hosts",
    url: "https://packs.haruhime.moe",
    writing: "packs, all lowercase. packs.haruhime.moe when you mean the site.",
    dos: DOS,
    donts: DONTS,
  },
  pools: {
    name: "pools",
    mark: "pl",
    hue: 200,
    tagline: "osu! mappools for tournament hosts",
    url: "https://pools.haruhime.moe",
    writing: "pools, all lowercase. pools.haruhime.moe when you mean the site.",
    dos: DOS,
    donts: DONTS,
  },
  bb: {
    name: "bb",
    mark: "bb",
    hue: 265,
    tagline: "osu! BBCode editor and templates",
    url: "https://bb.haruhime.moe",
    writing: "bb, all lowercase, never BB. bb.haruhime.moe when you mean the site.",
    dos: DOS,
    donts: DONTS,
  },
  sheets: {
    name: "sheets",
    mark: "sh",
    hue: 150,
    tagline: "osu! tournament sheets",
    url: "https://sheets.haruhime.moe",
    writing: "sheets, all lowercase. sheets.haruhime.moe when you mean the site.",
    dos: DOS,
    donts: DONTS,
  },
} as const satisfies Record<string, Product>;

export type ProductKey = keyof typeof PRODUCTS;

/**
 * @function fullName
 * @param product {Product} the brand
 * @returns {string} the name as its wordmark reads, suffix included ("haruhime.moe"), for labels
 */
export const fullName = (product: Product): string => `${product.name}${product.suffix ?? ""}`;

/**
 * @function isProductKey
 * @param value {string} anything, e.g. a CLI argument
 * @returns {boolean} true when it names a product in PRODUCTS
 */
export const isProductKey = (value: string): value is ProductKey => Object.hasOwn(PRODUCTS, value);

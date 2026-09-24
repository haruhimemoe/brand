/**
 * @file src/products.ts
 * @desc The haruhime.moe brands: the parent site and its tools, each a name, a monogram, a hue and
 *       a tagline. Adding one here is all it takes to generate its brand files.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

export type Product = {
  /** Lowercase; the wordmark and the file names. */
  name: string;
  /** One or two lowercase letters; the icon shows them followed by the dot. */
  mark: string;
  /**
   * Printable ASCII drawn half size on a second line under the name, right-aligned to it, its
   * first character in the highlight color (".moe" for the parent site). Without one, the
   * wordmark is the name and a round dot.
   */
  suffix?: string;
  /** 0 to 359; the palette's hue. */
  hue: number;
  /** One line under the wordmark in link previews. */
  tagline: string;
  url: string;
};

export const PRODUCTS = {
  haruhime: {
    name: "haruhime",
    mark: "h",
    suffix: ".moe",
    hue: 333,
    tagline: "osu! tools for tournament hosts",
    url: "https://haruhime.moe",
  },
  packs: {
    name: "packs",
    mark: "pk",
    hue: 333,
    tagline: "osu! beatmap packs for tournament hosts",
    url: "https://packs.haruhime.moe",
  },
  pools: {
    name: "pools",
    mark: "pl",
    hue: 200,
    tagline: "osu! mappools for tournament hosts",
    url: "https://pools.haruhime.moe",
  },
  sheets: {
    name: "sheets",
    mark: "sh",
    hue: 150,
    tagline: "osu! tournament sheets",
    url: "https://sheets.haruhime.moe",
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

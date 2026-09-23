/**
 * @file src/opentype.d.ts
 * @desc The slice of opentype.js 2.0 this package uses. The package ships no types, and
 *       @types/opentype.js describes 1.x. Glyph commands are in font units with y pointing up.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

declare module "opentype.js" {
  export type PathCommand =
    | { type: "M" | "L"; x: number; y: number }
    | { type: "Q"; x1: number; y1: number; x: number; y: number }
    | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
    | { type: "Z" };

  export interface Glyph {
    index: number;
    advanceWidth?: number;
    path: { commands: PathCommand[] };
  }

  export interface Font {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    hasChar(char: string): boolean;
    stringToGlyphs(text: string): Glyph[];
    getKerningValue(left: Glyph, right: Glyph): number;
  }

  export function parse(buffer: ArrayBuffer): Font;

  const opentype: { parse: typeof parse };
  export default opentype;
}

/**
 * @file src/png.ts
 * @desc SVG to PNG with resvg. The drawings are outlined, so no fonts are loaded and the output
 *       is the same on every machine. resvg ships a platform-specific native binary, so it's
 *       loaded lazily (createRequire, not a top-level import): importing this package for
 *       `palette` or `PRODUCTS` alone never touches it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { createRequire } from "node:module";
import type { Resvg as ResvgClass } from "@resvg/resvg-js";

type ResvgModule = { Resvg: typeof ResvgClass };

let resvgModule: ResvgModule | undefined;

const loadResvg = (): ResvgModule => {
  resvgModule ??= createRequire(import.meta.url)("@resvg/resvg-js") as ResvgModule;
  return resvgModule;
};

/**
 * @function svgToPng
 * @param svg {string} an SVG document
 * @param width {number} output width in pixels; the height follows the aspect ratio
 * @returns {Uint8Array} PNG bytes
 */
export const svgToPng = (svg: string, width: number): Uint8Array => {
  const { Resvg } = loadResvg();
  const renderer = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  });
  return new Uint8Array(renderer.render().asPng());
};

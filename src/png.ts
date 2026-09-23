/**
 * @file src/png.ts
 * @desc SVG to PNG with resvg. The drawings are outlined, so no fonts are loaded and the output
 *       is the same on every machine.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { Resvg } from "@resvg/resvg-js";

/**
 * @function svgToPng
 * @param svg {string} an SVG document
 * @param width {number} output width in pixels; the height follows the aspect ratio
 * @returns {Uint8Array} PNG bytes
 */
export const svgToPng = (svg: string, width: number): Uint8Array => {
  const renderer = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  });
  return new Uint8Array(renderer.render().asPng());
};

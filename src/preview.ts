/**
 * @file src/preview.ts
 * @desc One self-contained HTML page showing every product's wordmarks, icons, link preview,
 *       README banners and palette side by side, for choosing hues and checking a change before
 *       committing files.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { palette } from "./palette.js";
import { svgToPng } from "./png.js";
import type { Product } from "./products.js";
import { bannerSvg, escapeXml, iconSvg, ogSvg, wordmarkSvg } from "./svg.js";

const dataUri = (mime: string, bytes: Uint8Array | string): string =>
  `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;

const section = (product: Product): string => {
  const colors = palette(product.hue);
  const swatches = Object.entries(colors)
    .map(
      ([token, hex]) =>
        `<figure><div style="background:${hex}"></div><figcaption>${token} ${hex}</figcaption></figure>`,
    )
    .join("");
  const svg = (source: string, alt: string, className: string) =>
    `<img class="${className}" alt="${escapeXml(alt)}" src="${dataUri("image/svg+xml", source)}">`;
  return `<section>
  <h2>${escapeXml(product.name)} <small>hue ${product.hue} · ${escapeXml(product.mark)}.</small></h2>
  <div class="row">
    <div class="tile dark" style="background:${colors.b6}">${svg(wordmarkSvg(product), `${product.name} wordmark`, "wordmark")}</div>
    <div class="tile light">${svg(wordmarkSvg(product, { background: "light" }), `${product.name} wordmark on light`, "wordmark")}</div>
    ${svg(iconSvg(product), `${product.name} icon`, "icon")}
    <img class="icon" alt="${escapeXml(product.name)} apple icon" src="${dataUri("image/png", svgToPng(iconSvg(product, { shape: "square" }), 180))}">
  </div>
  <img class="og" alt="${escapeXml(product.name)} link preview" src="${dataUri("image/png", svgToPng(ogSvg(product), 1200))}">
  <div class="banners">
    ${svg(bannerSvg(product), `${product.name} banner`, "banner")}
    ${svg(bannerSvg(product, { background: "light" }), `${product.name} banner on light`, "banner")}
  </div>
  <div class="swatches">${swatches}</div>
</section>`;
};

/**
 * @function previewHtml
 * @param products {Product[]} the tools to show
 * @returns {string} a standalone HTML page (images inlined)
 */
export const previewHtml = (products: readonly Product[]): string => `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>haruhime brand preview</title>
<style>
  body { margin: 0; padding: 32px; background: #111; color: #eee; font: 14px system-ui, sans-serif; }
  section { margin-bottom: 48px; }
  h2 small { color: #999; font-weight: 400; }
  .row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
  .tile { padding: 16px 24px; border-radius: 12px; }
  .light { background: #fff; }
  .wordmark { height: 64px; display: block; }
  .icon { width: 64px; height: 64px; }
  .og { width: 600px; max-width: 100%; border-radius: 8px; display: block; }
  .banners { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 16px; }
  .banner { width: 640px; max-width: 100%; display: block; }
  .swatches { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
  figure { margin: 0; font-size: 11px; color: #aaa; }
  figure div { width: 72px; height: 32px; border-radius: 6px; }
</style>
${products.map(section).join("\n")}
</html>
`;

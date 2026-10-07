# Changelog

All notable changes to `@haruhimemoe/brand` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While on 0.x, a change to how anything looks is a minor version; apps rerun `haruhime-brand` to pick it up.

## [Unreleased]

## [0.9.0] - 2026-10-07

### Added

- harumin, the osu! Discord bot: mark `hm`, hue 350, at harumin.haruhime.moe.

## [0.8.0] - 2026-10-06

### Changed

- packs gets its own hue, 30 (orange), instead of sharing haruhime's 333.

## [0.7.0] - 2026-10-04

### Added

- `brandPageData(key)` and `BRAND_CONTACT`, plus the browser-safe `@haruhimemoe/brand/products` entry (`src/page.ts`, which also re-exports `PRODUCTS`, `fullName`, `isProductKey` and their types): everything a `/brand` page needs for one product, its name, writing guidance, dos and don'ts, palette, its seven `public/brand/` files in display order, the shared contact address and a link back to the family page.
- `Product` gains `writing`, `dos` and `donts`: how to write the name in running text, and at least two dos and don'ts a brand page shows alongside the files, filled in for every product.

### Fixed

- README, Page cards: the `outputFileTracingIncludes` key is a glob, so the example uses `/p/*/og.png`; `/p/[slug]/og.png` matched nothing and left the fonts out.

## [0.6.0] - 2026-09-28

### Added

- Page cards: `ogCardSvg(product, { title, subtitle?, eyebrow? })` and `ogCard` (the same as PNG), a 1200×630 link preview per page in the `ogSvg` look, with the title wrapped and shrunk to fit (88, 76 or 64px, at most 3 lines, then "...") and every line inside an 80px padding. `OG_CARD` holds the size. `ogCard` can run per request in a Node.js route; the README shows the Next.js config.
- `asciiText` folds user text to what the bundled fonts can draw (accents dropped, typographic punctuation straightened, the rest left out), and `fitLines` wraps and clamps text to a width.

## [0.5.0] - 2026-09-28

### Added

- The `bb` product (`bb.`, hue 265, violet) for bb.haruhime.moe, the osu! BBCode editor: `haruhime-brand bb` writes its files.

### Changed

- haruhime's tagline is now "osu! tools for players, mappers and hosts" (it was "osu! tools for tournament hosts"), since the tools now reach past tournaments. Its link preview and banner change; rerun `haruhime-brand haruhime` to pick it up.

## [0.4.0] - 2026-09-28

### Added

- `@haruhimemoe/brand/palette`: `palette`, `TOKENS`, `hslToHex` and the `Palette` and `Token` types as their own entry, which imports nothing (no fonts, file system or PNG renderer), so browsers and edge runtimes can use it. Apps that copied `hslToHex` for a brand page can import it from here.

### Fixed

- `haruhime-brand <product>` and `metadataConflicts` treat a `favicon.ico` in the app directory (create-next-app ships one with the Next.js logo) as a conflict. Before, Next.js went on serving it next to the generated `icon.svg`.
- `haruhime-brand constructor` (or `toString`, or any other name `Object` has) exits 1 with "Unknown product" instead of crashing with a `TypeError`.
- `hslToHex` resolves colors the way browsers do for any input: a hue outside 0 to 360 is read as the same angle (`-75` gave `#ff00ff`; it's now `#bf00ff`, like `285`), saturation and lightness are clamped to 0 to 100 (`hslToHex(0, 0, 150)` gave `#17f17f17f`), and a non-finite argument throws a `RangeError` instead of returning `#NaNNaNNaN`. Palettes are unchanged.
- A `Product` with an empty `suffix` (`""`) draws like one without: the name and a round dot. Before, it took the stacked layout, lost the dot and wrote empty paths.
- The preview page labels the parent brand "haruhime.moe", like the drawings' own labels and alt text.
- `--public` or `--app` pointing at a folder whose name starts with two dots (`..cache`) is no longer refused as outside `--root`.

### Security

- The CLI checks where each write really lands, symlinks followed, and stops when a symlinked `public`, app directory or file would take it outside `--root` (or is dangling), unless `--force`. Before, it wrote through the symlink.

## [0.3.0] - 2026-09-23

### Added

- `bannerSvg(product, { background })`: a 1280×320 README banner with rounded corners, the wordmark (stacked, for haruhime) centered over the tagline. Dark is b6 with a c3 tagline; light is white with a b2 tagline.
- `haruhime-brand <product>` also writes `public/brand/<name>-banner.svg`, `<name>-banner-on-light.svg` and `<name>-banner.png` (1280×320), and the preview page shows each product's banners.

## [0.2.0] - 2026-09-23

### Added

- The parent brand, haruhime (`h.`, hue 333, https://haruhime.moe): `haruhime-brand haruhime` writes its files like any tool's.
- An optional `suffix` on `Product` for a stacked wordmark: the suffix sits on a second line at half size, right-aligned to the name, its first character in the highlight color. haruhime's wordmark and link preview read "haruhime" over ".moe", and its labels and alt text say "haruhime.moe". The tools' drawings are unchanged.

## [0.1.0] - 2026-09-23

### Added

- Products packs (`pk.`, hue 333), pools (`pl.`, hue 200) and sheets (`sh.`, hue 150).
- `palette(hue)`: backgrounds, text colors and highlights from one hue.
- `wordmarkSvg`, `iconSvg` and `ogSvg`, outlined in Nunito so they need no fonts, and `svgToPng`, which loads the native renderer only when called.
- The `haruhime-brand` CLI: writes an app's wordmarks, icons, link preview and palette into `public/` and the Next.js app directory, lists products, and writes a preview page. It refuses to write outside `--root` or next to existing icon or preview code unless `--force`.

[unreleased]: https://github.com/haruhimemoe/brand/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/haruhimemoe/brand/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/haruhimemoe/brand/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/haruhimemoe/brand/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/haruhimemoe/brand/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/haruhimemoe/brand/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/haruhimemoe/brand/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/haruhimemoe/brand/compare/e4fcfcca308d858295fb6b51d19d339727950e0f...v0.3.0
[0.2.0]: https://github.com/haruhimemoe/brand/compare/d520f6b22e54d860451b02a7da2926949f40737d...e4fcfcca308d858295fb6b51d19d339727950e0f
[0.1.0]: https://github.com/haruhimemoe/brand/tree/d520f6b22e54d860451b02a7da2926949f40737d

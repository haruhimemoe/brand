# Changelog

All notable changes to `@haruhimemoe/brand` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While on 0.x, a change to how anything looks is a minor version; apps rerun `haruhime-brand` to pick it up.

## [Unreleased]

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

[unreleased]: https://github.com/haruhimemoe/brand/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/haruhimemoe/brand/compare/e4fcfcca308d858295fb6b51d19d339727950e0f...v0.3.0
[0.2.0]: https://github.com/haruhimemoe/brand/compare/d520f6b22e54d860451b02a7da2926949f40737d...e4fcfcca308d858295fb6b51d19d339727950e0f
[0.1.0]: https://github.com/haruhimemoe/brand/tree/d520f6b22e54d860451b02a7da2926949f40737d

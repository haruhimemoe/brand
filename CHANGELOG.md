# Changelog

All notable changes to `@haruhimemoe/brand` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While on 0.x, a change to how anything looks is a minor version; apps rerun `haruhime-brand` to pick it up.

## [Unreleased]

### Added

- The parent brand, haruhime (`h.`, hue 333, https://haruhime.moe): `haruhime-brand haruhime` writes its files like any tool's.
- An optional `suffix` on `Product` for a stacked wordmark: the suffix sits on a second line at half size, right-aligned to the name, its first character in the highlight color. haruhime's wordmark and link preview read "haruhime" over ".moe", and its labels and alt text say "haruhime.moe". The tools' drawings are unchanged.

## [0.1.0] - 2026-09-23

### Added

- Products packs (`pk.`, hue 333), pools (`pl.`, hue 200) and sheets (`sh.`, hue 150).
- `palette(hue)`: backgrounds, text colors and highlights from one hue.
- `wordmarkSvg`, `iconSvg` and `ogSvg`, outlined in Nunito so they need no fonts, and `svgToPng`, which loads the native renderer only when called.
- The `haruhime-brand` CLI: writes an app's wordmarks, icons, link preview and palette into `public/` and the Next.js app directory, lists products, and writes a preview page. It refuses to write outside `--root` or next to existing icon or preview code unless `--force`.

[unreleased]: https://github.com/haruhimemoe/brand/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/haruhimemoe/brand/releases/tag/v0.1.0

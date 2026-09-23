# Changelog

All notable changes to `@haruhimemoe/brand`. A change to how anything looks is a minor version while we're on 0.x; apps rerun `haruhime-brand` to pick it up.

## 0.1.0 (unreleased)

- First release: products packs (`pk.`, hue 333), pools (`pl.`, 200) and sheets (`sh.`, 150).
- The README lists every export. `svgToPng` (and the CLI's PNG output) loads `@resvg/resvg-js` lazily, so importing the package for `palette` or `PRODUCTS` alone never needs the native binary.
- The `haruhime-brand` CLI: write an app's brand files, list products, write a preview page. It finds `src/app` or `app` (an explicit `--app` must exist too), refuses to write outside `--root`, refuses to add files next to existing icon or preview code unless `--force`, and says what it replaced. `--version` and `help` are also commands; a command rejects options it doesn't use.

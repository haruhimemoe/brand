# AGENTS.md

`@haruhimemoe/brand`: the haruhime.moe tools' brand files, generated. One table of products (`src/products.ts`) in, SVGs and PNGs out, through the `haruhime-brand` CLI or the functions exported from `src/index.ts`. Two more entries are browser-safe: `@haruhimemoe/brand/palette` is `src/palette.ts` alone, and `@haruhimemoe/brand/products` is `src/page.ts`, which re-exports `PRODUCTS` and its helpers alongside the brand-page data it builds. `tsc` compiles `src/` to `dist/` one file at a time (no bundler).

## Layout

- `src/products.ts`: `PRODUCTS` (the parent site haruhime, and the tools packs, pools, bb and sheets), the `Product` type (name, mark, hue, tagline, url, and the brand-page `writing`, `dos` and `donts`), `isProductKey`, and `fullName` (name plus suffix, for labels).
- `src/page.ts`: `BRAND_CONTACT`, `BrandPageData`, `BrandAsset` and `brandPageData(key)`, built from `PRODUCTS` and `palette`. Imports only `./products.js` and `./palette.js`, so it's the `@haruhimemoe/brand/products` entry (the exports map points at `dist/page.d.ts`/`dist/page.js` directly), which also re-exports `PRODUCTS`, `fullName`, `isProductKey` and their types.
- `src/palette.ts`: `TOKENS`, `palette(hue)` and `hslToHex`. Also the `@haruhimemoe/brand/palette` entry (the exports map points at `dist/palette.js` directly), so it imports nothing.
- `src/fonts.ts`: loads `fonts/nunito-400.ttf` and `fonts/nunito-800.ttf` once per weight, by a path relative to the module, so it works from `src/` and `dist/`.
- `src/text.ts`: `layoutText` (glyphs to SVG path data with kerning, and the exact ink box), and the internal `num` (coordinate formatting) and `union` (two ink boxes combined).
- `src/svg.ts`: `wordmarkSvg`, `iconSvg`, `ogSvg`, `bannerSvg` and `escapeXml`. The layout constants (dot, suffix, icon, link preview and banner sizes) live here.
- `src/fit.ts`: `asciiText` (user text folded to printable ASCII) and `fitLines` (word wrap and clamp by measured advance).
- `src/card.ts`: `ogCardSvg`, `ogCard` and `OG_CARD`, the per-page link previews. They reuse `drawWordmark`, `svgDocument` and `wordmarkColors`, which `src/svg.ts` exports for it (not from `src/index.ts`).
- `src/png.ts`: `svgToPng`, which loads `@resvg/resvg-js` on first call.
- `src/generate.ts`: `brandFiles` (the 11 files, in a fixed order), `metadataConflicts` and `writeBrandFiles`.
- `src/preview.ts`: `previewHtml`, the one-page preview.
- `src/cli.ts`: the `haruhime-brand` bin. `run(args, io)` does the work and returns an exit code, so tests call it directly.
- `src/opentype.d.ts`: types for the slice of opentype.js 2.0 in use (it ships none).
- `src/index.ts`: the public API. Export only what apps should use.
- `fonts/`: Nunito 400 and 800, subset to printable ASCII, and `OFL.txt`.
- `tests/<module>.test.ts`: Vitest (`card.test.ts` covers `fit.ts` too, and checks each card's ink stays in its padding). `tests/__snapshots__/` holds every product's SVGs (wordmark on both backgrounds, icon, link preview, both banners).
- `scripts/smoke.mjs`: imports the built `dist/` (and `@haruhimemoe/brand/palette` and `@haruhimemoe/brand/products` by name) and runs the bin into a temp folder (`bun run test:dist`).

## Rules

- **Generated, never hand-drawn.** Every wordmark and icon comes from the bundled Nunito glyphs through `layoutText`. Don't commit a hand-edited SVG to an app; change the generator and rerun the CLI.
- **Outlined text only.** Output SVGs contain paths, never `<text>`, so they render the same everywhere and PNG rendering needs no fonts. `svgToPng` keeps `loadSystemFonts: false`.
- **Draw glyphs through `layoutText`.** opentype.js 2.0's `getPath` returns glyphs upside down; `layoutText` does the y flip itself, and `tests/text.test.ts` guards it.
- **Deterministic output.** Same product, same bytes. Don't add dates, random ids or system fonts.
- **Build-time, except cards, the palette and brand-page data.** Apps commit what the CLI writes. The one thing that may run per request is a page card (`ogCard`) in a Node.js server route, with the package external to the bundle and its fonts traced (README, Page cards); never in a browser or on an edge runtime. The exceptions are `@haruhimemoe/brand/palette` (`src/palette.ts`, import-free) and `@haruhimemoe/brand/products` (`src/page.ts`, which imports only `./products.js` and `./palette.js`): both must stay runtime-safe (no Node APIs, no fonts, no `opentype.js`), which `tests/palette.test.ts`, `tests/page.test.ts` and `scripts/smoke.mjs` check. Anything they need goes in those files.
- **resvg stays lazy.** Only `svgToPng` loads `@resvg/resvg-js`, through `createRequire` on its first call. Never value-import it at the top of a module. A type-only `import type` (as in `src/png.ts`) is fine, since TypeScript erases it. `tests/png.test.ts` checks that importing the package doesn't load it.
- **Public types stay self-contained.** `dist/*.d.ts` may only import relative paths (opentype.js ships no types); `scripts/smoke.mjs` walks them to check.
- **Product names are file names.** `brandFiles` rejects a `name` outside `/^[a-z][a-z0-9-]*$/`, so a name can't escape a directory. Keep that check.
- **The CLI stays inside `--root`.** `--app` and `--public` must resolve inside it, and no write may leave it through a symlink (the real path is checked before writing). It refuses to write next to other Next.js icon or link-preview files, or over hand-made ones on a product's first run, unless `--force`.
- **Fonts are OFL.** Keep `fonts/OFL.txt` next to them. The bundled subset is printable ASCII; a product string outside it must fail loudly.
- **The file list is public.** Adding, removing or reordering a file in `brandFiles` changes what apps commit: update the table in README.md and the tests together. Adding or removing one also changes the count (11), so update it everywhere: README.md (the `brandFiles` row), the `src/generate.ts` line under Layout above, llms.txt (the summary and the Files it writes link), the two asserts in `scripts/smoke.mjs` and `tests/cli.test.ts`.
- A visual change (hue, size, spacing) is a minor version: apps rerun the CLI to pick it up. Check it with `bun run preview` and look at the page, then accept the snapshot diffs in `tests/__snapshots__/` with `bun run test -u`. Never accept a snapshot diff you haven't looked at.
- **Docs match the code.** A change to an export, option, output file, default or error updates README.md in the same commit, and llms.txt if a README heading it links to changes. Anything a user would notice gets a line under `## [Unreleased]` in CHANGELOG.md. Never edit a released entry.
- **Exact pins.** Every dependency version in `package.json` is exact.
- Don't bump the version, tag or publish unless a maintainer asks. Releases are cut by the maintainers, and published only through `.github/workflows/release.yml` (a hand-published version has no provenance). A release commit moves `## [Unreleased]` to the new version with its date and compare link, and bumps `package.json`.
- Code style: Biome (2 spaces, double quotes, 100 columns). Every source file starts with the `@file / @desc / @author / @created / @modified` header. Exported functions get JSDoc with `@function`, `@param`, `@returns`. Imports in `src/` use `.js` extensions.

## Before calling a change done

```sh
bun run check && bun run typecheck && bun run test && bun run test:dist
```

CI also runs `bun run test:coverage`, which fails below 90% coverage of `src/`.

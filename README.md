# @haruhimemoe/brand

The brand kit for the haruhime.moe osu! tools (packs, pools, sheets), generated from one table:

| Product | Mark | Hue |
| --- | --- | --- |
| packs | `pk.` | 333 (pink) |
| pools | `pl.` | 200 (blue) |
| sheets | `sh.` | 150 (green) |

- **Palette from one hue:** six backgrounds, four text colors and two highlights, the same recipe as packs.haruhime.moe. An app sets `--hue` and its CSS does the rest.
- **Wordmark:** the name in Nunito ExtraBold plus a dot in the highlight color (the deeper `h2` on light backgrounds, where `h1` is too pale), outlined to SVG paths.
- **Icon:** the two-letter mark plus the dot. Every product uses the same letter size, so the icons match as a family.
- **Link preview:** a 1200×630 image with the wordmark over the tagline.

All text is outlined, so the SVGs need no fonts, and the PNGs come out the same on every machine. Apps commit the generated files, and nothing renders per request.

## Use

```sh
bun add -d @haruhimemoe/brand
bunx haruhime-brand pools          # writes into ./public and ./src/app
bunx haruhime-brand preview        # writes preview/index.html showing every product
bunx haruhime-brand list
```

`haruhime-brand <product>` writes these (paths shown for an app with `src/app`; it uses `app/` when that's what the app has):

| File | For |
| --- | --- |
| `public/brand/<name>-wordmark.svg` | dark backgrounds (white text) |
| `public/brand/<name>-wordmark-dark.svg` | light backgrounds (dark text) |
| `public/brand/<name>-icon.svg` | brand page, schema.org `logo` |
| `public/brand/<name>-palette.json` | `{ hue, colors }` for a brand page |
| `src/app/icon.svg` | favicon (Next.js serves it by name) |
| `src/app/apple-icon.png` | 180×180, square corners (iOS rounds them) |
| `src/app/opengraph-image.png` + `.alt.txt` | the link preview and its alt text |

Options: `--root <dir>` (the app, default `.`), `--public <dir>` (default `public`), `--app <dir>` (default: `src/app`, else `app`; it stops if neither exists), `--dry-run` (print the paths, marking ones that exist), `--force` (see below).

Rerun it after upgrading this package and commit the changes. It says which files it `wrote` and which it `replaced`.

### Moving an app over

If the app directory already makes an icon or link preview another way (`apple-icon.tsx`, `opengraph-image.tsx`, `icon.png`, `twitter-image.jpg`, …), Next.js would serve both, so the CLI stops and lists them. Delete them, since the generated files replace them, then run it again. `--force` writes anyway.

`haruhime-brand preview` writes `preview/` where you run it. Run it from this repo, or add `preview/` to the app's `.gitignore`.

## API

```ts
import { iconSvg, ogSvg, palette, PRODUCTS, wordmarkSvg } from "@haruhimemoe/brand";

palette(PRODUCTS.pools.hue).h1; // "#66ccff"
wordmarkSvg(PRODUCTS.pools, { background: "light" }); // an SVG string
```

| Export | What it is |
| --- | --- |
| `PRODUCTS`, `isProductKey` | The product table. |
| `palette(hue)`, `TOKENS`, `hslToHex` | Colors: `b1`–`b6` backgrounds (light to dark), `c1`–`c4` text, `h1`–`h2` highlights. |
| `wordmarkSvg`, `iconSvg`, `ogSvg` | The drawings as SVG strings. |
| `svgToPng(svg, width)` | PNG bytes, via resvg. |
| `brandFiles`, `writeBrandFiles` | What the CLI writes, as data, and the writer. |
| `metadataConflicts` | Icon and preview files already in an app directory that the brand files wouldn't replace. |
| `escapeXml` | Escapes text for SVG or HTML. |
| `previewHtml(products)` | The preview page. |
| `layoutText` | Nunito text as SVG path data with kerning, plus its exact ink box. |

`layoutText` draws with the bundled fonts, which are subset to printable ASCII. Any other character, including tabs and non-breaking spaces, throws rather than drawing a blank box.

## Adding a product

Add an entry to `PRODUCTS` in `src/products.ts` with a name, a two-letter mark, a hue and a tagline. Run `bun run preview` to see it next to the others. Review and accept the new snapshots in `tests/__snapshots__/` (`bun run test -u`), then release a minor version.

## License

MIT. Nunito (in `fonts/`) is under the SIL Open Font License 1.1; see [LICENSE](LICENSE) and [fonts/OFL.txt](fonts/OFL.txt).

## Develop

```sh
bun install
bun run check && bun run typecheck && bun run test && bun run test:dist
bun run preview   # then open preview/index.html
```

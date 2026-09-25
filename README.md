<p align="center"><a href="https://github.com/haruhimemoe/brand"><picture><source media="(prefers-color-scheme: light)" srcset="https://www.haruhime.moe/brand/repos/brand-banner-on-light.svg"><img alt="@haruhimemoe/brand" src="https://www.haruhime.moe/brand/repos/brand-banner.svg" width="640"></picture></a></p>

# @haruhimemoe/brand

The brand kit for haruhime.moe and its osu! tools (packs, pools, sheets), generated from one table:

| Product | Mark | Hue |
| --- | --- | --- |
| haruhime (the parent site, haruhime.moe) | `h.` | 333 (pink) |
| packs | `pk.` | 333 (pink) |
| pools | `pl.` | 200 (blue) |
| sheets | `sh.` | 150 (green) |

- **Palette from one hue:** six backgrounds, four text colors and two highlights, as hex values ([`palette`](#palette), `TOKENS` and each product's `<name>-palette.json`). This package ships no CSS. The same HSL recipe is in [@haruhimemoe/ui](https://github.com/haruhimemoe/ui)'s `theme.css`, which haruhime.moe, packs.haruhime.moe and pools.haruhime.moe import: there, an app sets `--hue` and the CSS does the rest.
- **Wordmark:** the name in Nunito ExtraBold plus a dot in the highlight color (the deeper `h2` on light backgrounds, where `h1` is too pale), outlined to SVG paths.
- **Stacked wordmark:** a product with a `suffix` (only haruhime, with `.moe`) drops the round dot. The suffix goes on a second line at half size, right-aligned to the end of the name, with its own dot in the highlight color and its letters in the text color.
- **Icon:** the one- or two-letter mark plus the dot. Every product uses the same letter size, so the icons match as a family.
- **Link preview:** a 1200×630 image with the wordmark (stacked, for haruhime) over the tagline.
- **README banner:** a 1280×320 image with rounded corners for GitHub READMEs: the wordmark (stacked, for haruhime) centered over the tagline. One for dark pages, one for light.

All text is outlined, so the SVGs need no fonts, and the PNGs come out the same on every machine. Apps commit the generated files, and nothing renders per request.

## Install

```sh
bun add -d @haruhimemoe/brand
```

With npm: `npm install --save-dev @haruhimemoe/brand`. It needs Node 22.12 or later (see [Compatibility](#compatibility)).

## CLI

```sh
bunx haruhime-brand pools             # writes pools' files into ./public and ./src/app
bunx haruhime-brand pools --dry-run   # prints the paths instead
bunx haruhime-brand list
bunx haruhime-brand preview           # writes preview/index.html showing every product
```

With npm, run it as `npx haruhime-brand`.

| Command | What it does |
| --- | --- |
| `haruhime-brand <product>` | Writes the product's brand files into a Next.js app. `<product>` is `haruhime`, `packs`, `pools` or `sheets`. |
| `haruhime-brand list` | Prints one line per product: its key, mark, hue and URL, separated by tabs. |
| `haruhime-brand preview [--out <dir>]` | Writes `<dir>/index.html` (default `preview/index.html`, relative to where you run it): one page with every product's wordmarks, icons, link preview, banners and palette. |
| `haruhime-brand help` (or `--help`, `-h`) | Prints the usage. |
| `haruhime-brand --version` | Prints `haruhime-brand <version>`. |

`list` prints:

```text
haruhime	h.	hue 333	https://haruhime.moe
packs	pk.	hue 333	https://packs.haruhime.moe
pools	pl.	hue 200	https://pools.haruhime.moe
sheets	sh.	hue 150	https://sheets.haruhime.moe
```

`preview` writes into the folder you run it from (`preview/` by default). Add `preview/` to your app's `.gitignore`, or pass `--out` with a folder outside the app.

### Files it writes

`haruhime-brand <product>` writes these, in this order (paths shown for an app with `src/app`; it uses `app/` when that's what the app has):

| File | For |
| --- | --- |
| `public/brand/<name>-wordmark.svg` | dark backgrounds (white text) |
| `public/brand/<name>-wordmark-on-light.svg` | light backgrounds (dark text) |
| `public/brand/<name>-icon.svg` | brand page, schema.org `logo` |
| `public/brand/<name>-banner.svg` | README banner, dark background (1280×320) |
| `public/brand/<name>-banner-on-light.svg` | README banner, white background |
| `public/brand/<name>-banner.png` | the dark banner as a 1280×320 PNG, for places that don't show SVG |
| `public/brand/<name>-palette.json` | `{ hue, colors }` for a brand page |
| `src/app/icon.svg` | favicon (Next.js serves it by name) |
| `src/app/apple-icon.png` | 180×180, square corners (iOS rounds them) |
| `src/app/opengraph-image.png` + `.alt.txt` | the 1200×630 link preview and its alt text |

The alt text is the full name and the tagline, like `pools: osu! mappools for tournament hosts` or `haruhime.moe: osu! tools for tournament hosts`. The palette file looks like `{ "hue": 200, "colors": { "b1": "#5c6970", ... } }`, with every token from [`palette`](#palette).

For each file it prints `wrote <path>`, or `replaced <path>` when the file was already there, with absolute paths. Rerun it after upgrading this package and commit the changes.

### Options

`haruhime-brand <product>` takes:

| Option | Default | Meaning |
| --- | --- | --- |
| `--root <dir>` | `.` | The app's root folder, resolved from where you run the command. The other paths resolve against it. |
| `--public <dir>` | `public` | The app's static folder. It must resolve inside `--root`. |
| `--app <dir>` | `src/app` if it exists, else `app` | The Next.js app directory. It must exist and resolve inside `--root`. With no `--app` and neither folder there, the command stops. |
| `--dry-run` | off | Prints the absolute path of every file it would write, with ` (exists)` after the ones already there, and writes nothing. |
| `--force` | off | Writes even when the app directory has icon or link-preview files in the way (see [Moving an app over](#moving-an-app-over)). |

`preview` takes only `--out`. `list` and `help` take no options. Any other option is an error.

`--help` (or `-h`) and `--version` work with any command, or none. They're checked as soon as the options parse, so `list --help` prints the usage and `nope --version` prints the version, both exiting 0, even though the command alone would fail. With both, `--help` wins. An option that doesn't parse (unknown, missing its value, or a flag given one) still fails first: `pools --bogus --help` exits 1.

### README banner

Next.js serves `public/` from the site root, so once an app has deployed its brand files, its banners have stable URLs: haruhime.moe's are `https://www.haruhime.moe/brand/haruhime-banner.svg` and `https://www.haruhime.moe/brand/haruhime-banner-on-light.svg`. Use the address the site answers on directly, with no redirect (for haruhime.moe that's `www.haruhime.moe`): GitHub loads README images through a proxy that may not follow one. To show the banner that matches the reader's GitHub theme, linked to the site, put this at the top of a README (a repo's, or an organization's `profile/README.md` in its `.github` repo):

```html
<a href="https://www.haruhime.moe">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://www.haruhime.moe/brand/haruhime-banner-on-light.svg">
    <img alt="haruhime.moe: osu! tools for tournament hosts" src="https://www.haruhime.moe/brand/haruhime-banner.svg" width="100%">
  </picture>
</a>
```

Without the link, clicking the banner opens the image instead of the site. Swap `haruhime` for the product and its site. The banner scales to the README's width, usually 640 to 830 pixels on GitHub, and the wordmark stays readable there.

### Moving an app over

If the app directory already makes an icon or link preview another way (`apple-icon.tsx`, `opengraph-image.tsx`, `icon.png`, `twitter-image.jpg`, …), Next.js would serve both, so the CLI stops and lists them. Delete them, since the generated files replace them, then run it again. `--force` writes anyway.

The first time a product is written into an app, a hand-made `icon.svg`, `apple-icon.png`, `opengraph-image.png` or its `.alt.txt` already sitting in the app directory is also treated as a conflict (it hasn't been through this CLI before, so it isn't safe to overwrite silently) and needs `--force` too. Once the product's `public/brand/<name>-palette.json` exists, later reruns replace those same files without `--force`, as before.

The check runs before `--dry-run` prints anything, so a dry run stops on the same conflicts.

## API

```ts
import { writeFileSync } from "node:fs";
import {
  bannerSvg,
  iconSvg,
  ogSvg,
  palette,
  PRODUCTS,
  svgToPng,
  wordmarkSvg,
} from "@haruhimemoe/brand";

const pools = PRODUCTS.pools;
console.log(palette(pools.hue).h1); // "#66ccff"

writeFileSync("pools-wordmark-on-light.svg", wordmarkSvg(pools, { background: "light" }));
writeFileSync("pools-apple-icon.png", svgToPng(iconSvg(pools, { shape: "square" }), 180));
writeFileSync("pools-og.png", svgToPng(ogSvg(pools), 1200));
writeFileSync("haruhime-banner.svg", bannerSvg(PRODUCTS.haruhime)); // the dark README banner
```

The drawing functions take any `Product`, not only the ones in `PRODUCTS`:

```ts
import { type Product, wordmarkSvg } from "@haruhimemoe/brand";

const demo: Product = {
  name: "demo",
  mark: "dm",
  hue: 30,
  tagline: "a demo tool",
  url: "https://example.com",
};
const svg = wordmarkSvg(demo);
```

What the CLI does, from code:

```ts
import { brandFiles, metadataConflicts, PRODUCTS, writeBrandFiles } from "@haruhimemoe/brand";

const root = process.cwd();
const files = brandFiles(PRODUCTS.sheets, { appDir: "app" });
const conflicts = metadataConflicts(root, "app", files);
if (conflicts.length > 0) throw new Error(`Delete these first: ${conflicts.join(", ")}`);
for (const written of writeBrandFiles(files, root)) console.log(written);
```

### Products

| Export | Signature | What it is |
| --- | --- | --- |
| `PRODUCTS` | `{ haruhime, packs, pools, sheets }`, each a `Product` | The table above, keyed by name. |
| `isProductKey` | `(value: string) => value is ProductKey` | True when `value` names a product in `PRODUCTS`. |

A `Product` is `{ name, mark, hue, tagline, url }`, plus an optional `suffix`:

- `name`: lowercase, matching `/^[a-z][a-z0-9-]*$/`. It's drawn as the wordmark and used in file names.
- `mark`: the one or two lowercase letters on the icon.
- `hue`: an integer 0 to 359, the palette's hue.
- `tagline`: the line under the wordmark in the link preview and banner.
- `url`: the product's site.
- `suffix`: drawn half size on a second line under the name (haruhime's `.moe`), its first character in the highlight color. Without one, the wordmark is the name and a round dot. Labels and alt text use the name plus the suffix (`haruhime.moe`).

### Palette

| Export | Signature | What it is |
| --- | --- | --- |
| `palette` | `(hue: number) => Palette` | Every token as `"#rrggbb"`: `b1` to `b6` backgrounds (light to dark), `c1` to `c4` text colors, `h1` and `h2` highlights. |
| `TOKENS` | `{ readonly b1: readonly [10, 40]; readonly b2: readonly [10, 30]; … }` (a `const` object, a literal tuple per token) | The recipe: each token's saturation and lightness in percent. `b1` to `b6` are `[10, 40]`, `[10, 30]`, `[10, 25]`, `[10, 20]`, `[10, 15]` and `[10, 10]`; `c1` to `c4` are `[40, 100]` (white), `[40, 90]`, `[40, 80]` and `[40, 70]`; `h1` is `[100, 70]` and `h2` is `[50, 45]`. |
| `hslToHex` | `(h: number, s: number, l: number) => string` | `"#rrggbb"` for a hue in degrees and a saturation and lightness 0 to 100, rounded the way browsers resolve `hsl()`. |

### Drawings

Each drawing is a complete SVG document as a string, with `role="img"` and an `aria-label`: the full name for the wordmark and icon (`pools`, `haruhime.moe`), and the full name and tagline for the link preview and banner.

| Export | Signature | What it is |
| --- | --- | --- |
| `wordmarkSvg` | `(product: Product, options?: WordmarkOptions) => string` | The wordmark (both lines, with a suffix), cropped to its ink with a 40-unit margin at a 1000-unit font size. It has a `viewBox` and no `width` or `height`, so it scales to its box. `background: "dark"` (default) draws white (`c1`) text and an `h1` dot; `"light"` draws `b6` text and an `h2` dot. |
| `iconSvg` | `(product: Product, options?: IconOptions) => string` | The mark and dot in `c1` and `h1` on a `b6` square, in a 64×64 `viewBox` (no `width` or `height`). `shape: "rounded"` (default) rounds the corners; `"square"` is for platforms that round it themselves, like the Apple icon. |
| `ogSvg` | `(product: Product) => string` | The 1200×630 link preview on `b6`: the wordmark over the tagline (in `c3`), left-aligned and centered vertically. |
| `bannerSvg` | `(product: Product, options?: BannerOptions) => string` | The 1280×320 README banner with rounded corners: the wordmark over the tagline, centered. `background: "dark"` (default) is `b6` with a `c3` tagline; `"light"` is white with a `b2` tagline. |
| `svgToPng` | `(svg: string, width: number) => Uint8Array` | PNG bytes, `width` pixels wide, the height following the SVG's aspect ratio. It loads no system fonts, and loads `@resvg/resvg-js` on its first call. |
| `escapeXml` | `(value: string) => string` | Escapes `&`, `<`, `>`, `"` and `'` as numeric character references, for SVG or HTML. |

### App files

| Export | Signature | What it is |
| --- | --- | --- |
| `brandFiles` | `(product: Product, options?: BrandFileOptions) => BrandFile[]` | The 11 files the CLI writes, in the order of [Files it writes](#files-it-writes), with paths relative to the app's root. `options` is `{ publicDir?, appDir? }`, default `"public"` and `"src/app"` (it doesn't look for `app/`; the CLI does). A `BrandFile` is `{ path: string; contents: string \| Uint8Array }`: a string for SVG, JSON and text, bytes for PNG. |
| `metadataConflicts` | `(root: string, appDir: string, files: readonly BrandFile[]) => string[]` | The files in `appDir` that writing `files` shouldn't silently touch, as `appDir/<file>`, sorted. That's every Next.js metadata file there (`icon`, `apple-icon`, `opengraph-image` or `twitter-image`, optionally numbered, as `.ico`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.js`, `.jsx`, `.ts` or `.tsx`) that `files` doesn't replace by name, plus, while the product's `<name>-palette.json` doesn't exist yet, the ones it would overwrite. Empty when `appDir` doesn't exist. |
| `writeBrandFiles` | `(files: readonly BrandFile[], root: string) => string[]` | Writes each file under `root`, creating folders and overwriting what's there, and returns the absolute paths. It doesn't check for conflicts. |
| `previewHtml` | `(products: readonly Product[]) => string` | The preview page as one HTML document, with its images inlined. |

`brandFiles` and `previewHtml` render PNGs, so they load `@resvg/resvg-js` like `svgToPng`.

### Text

| Export | Signature | What it is |
| --- | --- | --- |
| `layoutText` | `(text: string, options: TextOptions) => TextRun` | Nunito text as SVG path data with the font's kerning, plus its exact ink box. |

`TextOptions` is `{ weight, size, x?, baseline?, tracking? }`: `weight` is `400` or `800` (the two bundled weights), `size` the font size in SVG units, `x` the left edge of the first glyph's advance box (default 0), `baseline` the baseline's y, pointing down (default 0), and `tracking` extra space between letters in em (default 0).

A `TextRun` is `{ d, end, ink, line }`: `d` is the path data for every glyph, `end` the pen's x after the last one, `ink` the drawn glyphs' exact `Box` (`{ x1, y1, x2, y2 }`), and `line` the font's line box at this size (`{ top, bottom }`).

`layoutText` draws with the bundled fonts, which are subset to printable ASCII. Any other character, including tabs and non-breaking spaces, throws rather than drawing a blank box.

### Types

`Product`, `ProductKey`, `Palette`, `Token`, `WordmarkOptions`, `IconOptions`, `BannerOptions`, `BrandFile`, `BrandFileOptions`, `TextOptions`, `TextRun`, `Box` and `Weight` are exported as types.

## Errors

- `palette(hue)` throws `RangeError` if `hue` isn't an integer 0 to 359. Every drawing function, `brandFiles` and `previewHtml` call it, so a bad `product.hue` throws there too.
- `brandFiles(product, ...)` throws `RangeError` if `product.name` doesn't match `/^[a-z][a-z0-9-]*$/`.
- `layoutText` (and so `wordmarkSvg`, `iconSvg`, `ogSvg`, `bannerSvg`) throws `Error` if the text has a character outside printable ASCII, or any whitespace besides a plain space (the bundled fonts don't have glyphs for them). That covers a product's `name`, `mark`, `suffix` and `tagline`.
- `svgToPng` (and so `brandFiles`, `previewHtml`, and the CLI's product and `preview` commands) fails if `@resvg/resvg-js` has no native binary for the platform. See [Compatibility](#compatibility).
- The CLI exits 0 when it's done, and for `--help` or `--version` with any command (see [Options](#options)). It exits 1, with a message on stderr, for:
  - no command, or more than one (it prints the usage);
  - an option it doesn't know, `--root`, `--public`, `--app` or `--out` without a value, or `--dry-run`, `--force`, `--help` or `--version` given one (`--force=1`);
  - an option the command doesn't take, like `preview --force` or `pools --out x`;
  - an unknown product;
  - `--app` or `--public` resolving outside `--root`;
  - no app directory: neither `src/app` nor `app` under `--root`, or an `--app` that doesn't exist;
  - icon or link-preview files in the way, without `--force` (see [Moving an app over](#moving-an-app-over)).
- Anything else that goes wrong on disk, like a folder the CLI can't write to, or an `--app`, `--public` or `--out` path that is a file, throws. The CLI exits 1 and Node prints the error (`EACCES`, `ENOTDIR`, `EEXIST`) with a stack trace, not a one-line message. Files written before a failed write stay.

## Compatibility

Node 22.12 or later. The package is ES modules with TypeScript types.

`svgToPng` (and so the CLI's PNG output) needs `@resvg/resvg-js`'s native binary; 2.6.2 ships prebuilt binaries for macOS (x64, arm64), Windows (x64, ia32, arm64), Linux glibc and musl (x64, arm64), Linux armv7 (gnueabihf) and Android (arm64, arm-eabi). It's loaded lazily, so importing the package for `palette`, `PRODUCTS` or `layoutText` alone never touches it, even on a platform or an `--omit=optional` install without it.

The CLI writes Next.js App Router metadata files (`icon.svg`, `apple-icon.png`, `opengraph-image.png`), so it's for Next.js apps. The API works in any Node program.

This is a build-time tool: run it in Node, at build or from a script. Never import it into a browser bundle or an edge runtime.

## License

MIT. Nunito (in `fonts/`) is under the SIL Open Font License 1.1; see [LICENSE](LICENSE) and [fonts/OFL.txt](fonts/OFL.txt).

---

See [CHANGELOG.md](CHANGELOG.md) for release history and [CONTRIBUTING.md](CONTRIBUTING.md) to contribute. Report security issues as [SECURITY.md](SECURITY.md) describes.

# AGENTS.md

`@haruhimemoe/brand`: the haruhime.moe tools' brand files, generated. One table of products (`src/products.ts`) in, SVGs and PNGs out.

## Rules

- **Generated, never hand-drawn.** Every wordmark and icon comes from the bundled Nunito glyphs through `layoutText`. Don't commit a hand-edited SVG to an app; change the generator and rerun the CLI.
- **Outlined text only.** Output SVGs contain paths, never `<text>`, so they render the same everywhere and PNG rendering needs no fonts.
- **Draw glyphs through `layoutText`.** opentype.js 2.0's `getPath` returns glyphs upside down; `layoutText` does the y flip itself, and `tests/text.test.ts` guards it.
- **Deterministic output.** Same product, same bytes. Don't add dates, random ids or system fonts.
- **Build-time only.** Apps install this as a dev dependency and commit what it writes; nothing here should run per request.
- **Fonts are OFL.** Keep `fonts/OFL.txt` next to them. The bundled subset is printable ASCII; a product string outside it must fail loudly.
- A visual change (hue, size, spacing) is a minor version: apps rerun the CLI to pick it up. Check it with `bun run preview` and look at the page, then accept the snapshot diffs in `tests/__snapshots__/` with `bun run test -u`. Never accept a snapshot diff you haven't looked at.
- Code style: Biome (2 spaces, double quotes, 100 columns). Every file starts with the `@file / @desc / @author / @created / @modified` header. Exported functions get JSDoc with `@function`, `@param`, `@returns`. Imports in `src/` use `.js` extensions.

## Before calling a change done

```sh
bun run check && bun run typecheck && bun run test && bun run test:dist
```

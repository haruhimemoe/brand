# Contributing

## Setup

You need [Bun](https://bun.sh) (the version in `package.json`'s `packageManager`, 1.4.2) and Node 22.12 or later. `.nvmrc` has 24, the version CI's check, typecheck and test job uses. CI also builds and smoke-tests `dist/` on Node 22.12 and 24 on Linux, and on Node 24 on macOS.

```sh
bun install
```

## Making a change

1. Read [AGENTS.md](./AGENTS.md).
2. Branch from `main` (`feat/<topic>`, `fix/<topic>`).
3. Write a failing test in `tests/`, make it pass, keep commits small and Conventional.
4. For a visual change, run `bun run preview` and attach a screenshot of `preview/index.html` to the PR. A change to hue, size or spacing is a minor version bump; accept the new snapshots in `tests/__snapshots__/` with `bun run test -u` only after looking at the diffs.
5. If the change touches an export, a CLI option, an output file or an error, update README.md to match.
6. Run the checks below.
7. Add a line to `CHANGELOG.md` under `## [Unreleased]`, in the right [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) section (Added, Changed, Deprecated, Removed, Fixed, Security).

## Checks

```sh
bun run check && bun run typecheck && bun run test && bun run test:dist
```

`check` is Biome (`check:fix` to auto-fix). `test:dist` builds and runs `scripts/smoke.mjs` against the built `dist/`, so it catches issues plain `test` (source-only, via vitest) can't. CI runs the tests as `bun run test:coverage`, which fails below 90% coverage of `src/`.

## Adding a product

Add an entry to `PRODUCTS` in `src/products.ts` with a `name`, `mark`, `hue`, `tagline` and `url`. An optional `suffix` (like haruhime's `.moe`) stacks under the name in the wordmark instead of the round dot. `tests/products.test.ts` checks every entry:

- `name` equals the entry's key and is lowercase (`/^[a-z][a-z0-9-]*$/`, since it becomes file names).
- `mark` is one or two lowercase letters (`/^[a-z]{1,2}$/`) and no other product uses it.
- `hue` is 0 to 359. A tool (a product with no `suffix`) needs a hue no other tool uses.
- `url` is exactly `https://<key>.haruhime.moe`, or `https://<key><suffix>` for a product with a `suffix`.
- `tagline` and `suffix` are printable ASCII, so the bundled fonts can draw them.

A bad name or a hue that isn't an integer 0 to 359 also throws a `RangeError` when drawing. Run `bun run preview` to see it next to the others, then follow step 4 above for the snapshots.

Then update everything that names the products:

- `tests/cli.test.ts`: the `list` output, the unknown-product message and the names the preview test checks.
- README.md: the product list in the first line, the product table, the `<product>` list in the CLI table, the `list` output block and the `PRODUCTS` row under Products.
- AGENTS.md: the `src/products.ts` line under Layout.
- llms.txt: the product list in the summary.

## Releases

Releases are cut by the maintainers.

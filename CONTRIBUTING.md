# Contributing

## Setup

```sh
bun install
```

## Making a change

1. Read [AGENTS.md](./AGENTS.md).
2. Branch from `main` (`feat/<topic>`, `fix/<topic>`).
3. Write a failing test in `tests/`, make it pass, keep commits small and Conventional.
4. For a visual change, run `bun run preview` and attach a screenshot of `preview/index.html` to the PR. A change to hue, size or spacing is a minor version bump; accept the new snapshots in `tests/__snapshots__/` with `bun run test -u` only after looking at the diffs.
5. Run the checks below.
6. Add a line to `CHANGELOG.md` under `## [Unreleased]`, in the right [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) section (Added, Changed, Deprecated, Removed, Fixed, Security).

## Checks

```sh
bun run check && bun run typecheck && bun run test && bun run test:dist
```

`check` is Biome (`check:fix` to auto-fix). `test:dist` builds and runs `scripts/smoke.mjs` against the built `dist/`, so it catches issues plain `test` (source-only, via vitest) can't.

## Adding a product

Add an entry to `PRODUCTS` in `src/products.ts` with a name, a one- or two-letter mark, a hue, a tagline and a `url`. An optional `suffix` (like haruhime's `.moe`) stacks under the name in the wordmark instead of the round dot. The name is lowercase (`/^[a-z][a-z0-9-]*$/`, since it becomes file names) and the hue an integer 0 to 359; both throw a `RangeError` otherwise. Run `bun run preview` to see it next to the others, then follow step 4 above for the snapshots.

## Releases

Releases are cut by the maintainers.

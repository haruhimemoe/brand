## Summary

<!-- What changed and why. Link the issue if there is one. -->

## Checklist (AGENTS.md, "Before calling a change done")

- [ ] `bun run check && bun run typecheck && bun run test && bun run test:dist`
- [ ] `bun run test:coverage` stays at or above 90%
- [ ] `README.md` matches every export, option, output file and error I changed (and `llms.txt` if a heading it links to moved)
- [ ] A line under `## [Unreleased]` in `CHANGELOG.md` for anything users will notice
- [ ] Visual change: I looked at `bun run preview` and every snapshot diff in `tests/__snapshots__/` before accepting it

## Preview

<!-- Visual changes only: a screenshot of the preview page, before and after. -->

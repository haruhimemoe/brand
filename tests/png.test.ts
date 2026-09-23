/**
 * @file tests/png.test.ts
 * @desc svgToPng loads @resvg/resvg-js lazily: importing the package, even for svgToPng itself,
 *       must not touch the native module until a PNG is actually rendered. Consumers who only
 *       want palette() or PRODUCTS never need the native binary (see AGENTS.md, S3).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { palette, svgToPng } from "../src/index.js";

describe("svgToPng", () => {
  it("does not load @resvg/resvg-js until it's called", () => {
    const require = createRequire(import.meta.url);
    const resvgEntry = require.resolve("@resvg/resvg-js");
    expect(require.cache[resvgEntry]).toBeUndefined();
    expect(palette(200).h1).toBe("#66ccff");
    expect(require.cache[resvgEntry]).toBeUndefined();
    svgToPng('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>', 4);
    expect(require.cache[resvgEntry]).toBeDefined();
  });
});

/**
 * @file tests/generate.test.ts
 * @desc The files an app commits: paths and order, custom folders, PNG sizes, deterministic
 *       output, and writing them to disk.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  brandFiles,
  metadataConflicts,
  PRODUCTS,
  palette,
  svgToPng,
  writeBrandFiles,
} from "../src/index.js";

// Width and height from a PNG's IHDR chunk.
const pngSize = (bytes: Uint8Array) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
};
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe("brandFiles", () => {
  it("lists the brand page files and the Next.js app files", () => {
    expect(brandFiles(PRODUCTS.pools).map((file) => file.path)).toEqual([
      "public/brand/pools-wordmark.svg",
      "public/brand/pools-wordmark-on-light.svg",
      "public/brand/pools-icon.svg",
      "public/brand/pools-palette.json",
      "src/app/icon.svg",
      "src/app/apple-icon.png",
      "src/app/opengraph-image.png",
      "src/app/opengraph-image.alt.txt",
    ]);
  });

  it("uses the folders it's given", () => {
    const paths = brandFiles(PRODUCTS.sheets, { publicDir: "static", appDir: "app" }).map(
      (file) => file.path,
    );
    expect(paths[0]).toBe("static/brand/sheets-wordmark.svg");
    expect(paths.at(-1)).toBe("app/opengraph-image.alt.txt");
  });

  it("renders a 180×180 apple icon and a 1200×630 link preview", () => {
    const files = brandFiles(PRODUCTS.packs);
    const png = (name: string) => files.find((file) => file.path.endsWith(name))?.contents;
    const apple = png("apple-icon.png") as Uint8Array;
    const og = png("opengraph-image.png") as Uint8Array;
    expect([...apple.slice(0, 8)]).toEqual(PNG_SIGNATURE);
    expect(pngSize(apple)).toEqual({ width: 180, height: 180 });
    expect(pngSize(og)).toEqual({ width: 1200, height: 630 });
  });

  it("writes the palette and alt text", () => {
    const files = brandFiles(PRODUCTS.pools);
    const text = (name: string) =>
      String(files.find((file) => file.path.endsWith(name))?.contents ?? "");
    expect(JSON.parse(text("palette.json"))).toEqual({ hue: 200, colors: palette(200) });
    expect(text("alt.txt")).toBe("pools: osu! mappools for tournament hosts");
  });

  it("names the parent brand with its suffix in the alt text, as its link preview shows it", () => {
    const alt = brandFiles(PRODUCTS.haruhime).find((file) =>
      file.path.endsWith("opengraph-image.alt.txt"),
    );
    expect(alt?.contents).toBe("haruhime.moe: osu! tools for tournament hosts");
  });

  it("is deterministic", () => {
    const first = brandFiles(PRODUCTS.sheets);
    const second = brandFiles(PRODUCTS.sheets);
    expect(second).toEqual(first);
  });

  it.each(["Pools", "pools/x", "../pools", "1pools", ""])(
    "rejects a product name that isn't lowercase (%j)",
    (name) => {
      expect(() => brandFiles({ ...PRODUCTS.pools, name })).toThrow(RangeError);
    },
  );
});

describe("metadataConflicts", () => {
  let root = "";
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  const app = () => {
    root = mkdtempSync(path.join(tmpdir(), "brand-conflicts-"));
    mkdirSync(path.join(root, "src/app"), { recursive: true });
    return path.join(root, "src/app");
  };

  it("flags code that already makes an icon or preview another way", () => {
    const dir = app();
    writeFileSync(path.join(dir, "apple-icon.tsx"), "");
    expect(metadataConflicts(root, "src/app", brandFiles(PRODUCTS.pools))).toEqual([
      path.join("src", "app", "apple-icon.tsx"),
    ]);
  });

  it("flags a hand-made same-name file on a first run (no palette.json yet)", () => {
    const dir = app();
    writeFileSync(path.join(dir, "icon.svg"), "<svg>mine</svg>");
    expect(metadataConflicts(root, "src/app", brandFiles(PRODUCTS.pools))).toEqual([
      path.join("src", "app", "icon.svg"),
    ]);
  });

  it("doesn't flag a same-name file once the product has run before (palette.json exists)", () => {
    const dir = app();
    mkdirSync(path.join(root, "public/brand"), { recursive: true });
    writeFileSync(path.join(root, "public/brand/pools-palette.json"), "{}");
    writeFileSync(path.join(dir, "icon.svg"), "<svg>mine</svg>");
    expect(metadataConflicts(root, "src/app", brandFiles(PRODUCTS.pools))).toEqual([]);
  });

  it("has nothing to flag when the app directory doesn't exist", () => {
    root = mkdtempSync(path.join(tmpdir(), "brand-conflicts-"));
    expect(metadataConflicts(root, "src/app", brandFiles(PRODUCTS.pools))).toEqual([]);
  });
});

describe("svgToPng", () => {
  it("scales to the width asked for", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 5"><rect width="10" height="5"/></svg>';
    expect(pngSize(svgToPng(svg, 40))).toEqual({ width: 40, height: 20 });
  });
});

describe("writeBrandFiles", () => {
  let root = "";
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("creates folders and writes every file", () => {
    root = mkdtempSync(path.join(tmpdir(), "brand-"));
    const files = brandFiles(PRODUCTS.pools);
    const written = writeBrandFiles(files, root);
    expect(written).toEqual(files.map((file) => path.join(root, file.path)));
    expect(readFileSync(path.join(root, "src/app/icon.svg"), "utf8")).toBe(files[4]?.contents);
  });
});

/**
 * @file vitest.config.ts
 * @desc Vitest config: every test under tests/, v8 coverage with a 90% floor on src/ (the CLI entry is tested as a process).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
});

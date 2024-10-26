import * as path from "path";
import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "..", "..", "src"),
    },
  },
});

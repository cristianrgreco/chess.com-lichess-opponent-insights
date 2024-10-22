import * as path from "path";
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    globals: true,
    testTimeout: 60000,
    globalSetup: "./setup.js",
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "..", "..", "src")
    }
  }
})
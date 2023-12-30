import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60000,
    globalSetup: "./src/test/setup.js",
  },
});
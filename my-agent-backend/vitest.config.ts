import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals:         true,
    environment:     'node',
    globalSetup:     './src/__tests__/setup.ts',
    testTimeout:     20_000,
    hookTimeout:     20_000,
    fileParallelism: false,
    include:         ['src/__tests__/**/*.test.ts'],
    env: {
      NODE_ENV: 'development',
    },
  },
});

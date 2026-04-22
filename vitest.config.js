import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/gnomeSetup.js'],
    exclude: [
      '**/node_modules/**',
      '**/.stryker-tmp/**',
      '**/dist/**',
      '**/build/**'
    ]
  }
});


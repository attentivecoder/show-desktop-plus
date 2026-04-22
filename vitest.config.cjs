const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
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
    },

  
});


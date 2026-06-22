import js from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';

export default [
  // 1) Base Ignores (Relative to backend root)
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '**/*.md',
      '**/*.yml',
      '**/*.yaml',
      '**/*.json',
      '**/Dockerfile',
    ],
  },

  // 2) Global Parser Settings (Node runtime)
  {
    languageOptions: {
      ecmaVersion: 'latest',
      // Switch to 'commonjs' if your API strictly uses require(), 
      // or keep 'module' if you are using ES imports ("type": "module" in package.json)
      sourceType: 'module', 
    },
  },

  // 3) Backend Application Files (Node runtime) — excluding test files
  {
    files: ['**/*.js', '**/*.ts'],
    ignores: ['**/*.test.js', '**/*.test.ts', 'tests/**'],
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off', // Frequently allowed in backend systems for logging
      'no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_' 
      }],
    },
  },

  // 4) Backend Test Files (Jest context)
  {
    files: ['**/*.test.js', '**/*.test.ts', 'tests/**'],
    languageOptions: {
      globals: {
        process: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        console: 'readonly',
      },
    },
    plugins: { jest: jestPlugin },
    settings: {
      jest: { version: 30 },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...jestPlugin.configs.recommended.rules,
    },
  },
];
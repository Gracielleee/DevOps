import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest';
import globals from 'globals';

export default [
  // 1) Base Ignores (Relative to frontend root)
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'coverage/**',
      'e2e/**',
      '**/*.md',
      '**/*.yml',
      '**/*.yaml',
      '**/*.css',
      '**/*.scss',
      '**/*.sass',
      '**/*.html',
      '**/*.json',
      '**/Dockerfile',
    ],
  },

  // 2) Global Parser Settings
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // 3) Tooling config files (CommonJS)
  {
    files: ['*.config.js', 'jest.config.js', 'playwright.config.js', 'next.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  // 4) Frontend Application Files (React, ES Modules) — excluding test files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: [
      '**/*.test.*',
      '**/__tests__/**',
      '**/*.spec.*',
      '*.config.js',
      'jest.config.js',
      'playwright.config.js',
      'next.config.js',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        process: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-console': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  // 5) Frontend Test Files (Jest + React Testing Library context)
  {
    files: [
      '**/*.test.*',
      '**/__tests__/**',
      '**/*.spec.*',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        global: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      jest: jestPlugin,
      react: reactPlugin,
    },
    settings: {
      jest: { version: 29 },
      react: { version: 'detect' },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...jestPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
    },
  },
];

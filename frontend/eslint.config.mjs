import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest';

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

  // 3) Frontend Application Files (React, ES Modules) — excluding test files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: [
      '**/*.test.*', 
      '**/__tests__/**', 
      '**/*.spec.*',
    ],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
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
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_' 
      }],
      'no-console': 'warn',
      'react/react-in-jsx-scope': 'off',
    },
  },

  // 4) Frontend Test Files (Jest + React Testing Library context)
  {
    files: [
      '**/*.test.*', 
      '**/__tests__/**', 
      '**/*.spec.*'
    ],
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
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      jest: jestPlugin,
      react: reactPlugin,
    },
    settings: {
      jest: { version: 30 },
      react: { version: 'detect' },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...jestPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      'no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_' 
      }],
      'react/react-in-jsx-scope': 'off',
    },
  },
];
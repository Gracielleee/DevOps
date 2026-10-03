import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest';

export default [
  // 0) Base Ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.md',
      '**/*.yml',
      '**/*.yaml',
      '**/*.css',
      '**/*.scss',
      '**/*.sass',
      '**/*.html',
      '**/*.json',
      '**/Dockerfile',
      '**/.github/**/*.yml',
    ],
  },

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

  // 2) Backend (Node/CommonJS) — excluding test files
  {
    files: ['**/backend/**/*.js', '**/backend/**/*.ts'],
    ignores: ['**/backend/**/*.test.js', '**/backend/**/*.test.ts', '**/backend/tests/**'],
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
      'no-console': 'off',
      'no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_' 
      }],
    },
  },

  // 3) Backend tests with Jest
  {
    files: ['**/backend/**/*.test.js', '**/backend/**/*.test.ts', '**/backend/tests/**'],
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

  // 4) Frontend (React, ES Modules) — excluding test files
  {
    files: ['**/frontend/**/*.js', '**/frontend/**/*.jsx', '**/frontend/**/*.ts', '**/frontend/**/*.tsx'],
    ignores: [
      '**/frontend/**/*.test.*', 
      '**/frontend/__tests__/**', 
      '**/frontend/**/*.spec.*', 
      '**/frontend/e2e/**'
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

  // 5) Frontend tests with Jest
  {
    files: [
      '**/frontend/**/*.test.*', 
      '**/frontend/__tests__/**', 
      '**/frontend/**/*.spec.*'
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
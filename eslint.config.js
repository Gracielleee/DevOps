import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest';

export default [
  // 1) Base ignore (you can still keep your ignores array if you want)
  //    but the .eslintignore file is the primary way to exclude unwanted files.
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
      // You can list more here if you prefer the flat config approach
    ],
  },

  // 2) Backend (Node/CommonJS)
  {
    // Lint only JS/TS files in backend (excluding .test files)
    files: ['backend/**/*.{js,ts}', '!backend/**/*.test.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
    },
  },

  // 3) Backend tests with Jest
  {
    // Only .test.js or .test.ts in backend
    files: ['backend/**/*.test.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
      },
    },
    plugins: { jest: jestPlugin },
    rules: {
      ...js.configs.recommended.rules,
      ...jestPlugin.configs.recommended.rules,
    },
  },

  // 4) Frontend (React, ES Modules)
  {
    // Only JS/TS/JSX/TSX in frontend
    files: ['frontend/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'react/react-in-jsx-scope': 'off', // For React 18+
    },
  },
];


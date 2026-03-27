import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

export default defineConfig([
  // Next.js + TypeScript base configs (flat, safe with ESLint 9)
  ...nextVitals,
  ...nextTs,

  // Prettier last to disable conflicting formatting rules
  prettier,

  // Your custom rules and plugins
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    plugins: {
      'unused-imports': unusedImports,
      import: importPlugin,
    },

    rules: {
      // remove unused imports automatically
      'unused-imports/no-unused-imports': 'error',

      // optional: warn on unused vars but ignore ones prefixed with _
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // import ordering
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],

      'import/no-duplicates': 'error',

      // general code quality
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      eqeqeq: 'error',
      curly: ['error', 'all'],
      'no-nested-ternary': 'error',
    },
  },

  // Ignore generated and config files
  globalIgnores([
    'node_modules/**',
    '.next/**',
    'build/**',
    'dist/**',
    '*.config.*',
  ]),
]);

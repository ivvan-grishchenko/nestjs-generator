// @ts-check

import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  perfectionist.configs['recommended-alphabetical'],
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.mjs',
            'vitest.config.ts',
            'vitest.config.e2e.ts',
            'scripts/patch-suites-doubles-vitest.mjs',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            memberTypes: [
              'signature',
              'public-instance-field',
              'protected-instance-field',
              'private-instance-field',
              'public-static-field',
              'protected-static-field',
              'private-static-field',
              'public-abstract-field',
              'protected-abstract-field',
              'field',
              'public-constructor',
              'protected-constructor',
              'private-constructor',
              'constructor',
              'public-instance-get',
              'protected-instance-get',
              'private-instance-get',
              'public-static-get',
              'protected-static-get',
              'private-static-get',
              'public-abstract-get',
              'protected-abstract-get',
              'get',
              'public-instance-set',
              'protected-instance-set',
              'private-instance-set',
              'public-static-set',
              'protected-static-set',
              'private-static-set',
              'public-abstract-set',
              'protected-abstract-set',
              'set',
              'public-instance-method',
              'protected-instance-method',
              'private-instance-method',
              'public-static-method',
              'protected-static-method',
              'private-static-method',
              'public-abstract-method',
              'protected-abstract-method',
              'method',
            ],

            order: 'alphabetically',
          },
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/unbound-method': 'off',
      'class-methods-use-this': 'off',
      'key-spacing': [
        'error',
        {
          afterColon: true,
        },
      ],
      'lines-between-class-members': 'off',
      'no-debugger': 'error',
      'no-multi-spaces': 'error',
      'no-restricted-syntax': ['off', 'ForOfStatement'],
      'no-return-await': 'off',
      'no-var': 'error',
      'object-curly-spacing': ['error', 'always'],

      'prettier/prettier': 'error',

      quotes: ['error', 'single'],

      semi: ['error', 'always'],
    },
  },
);

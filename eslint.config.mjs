// @ts-check
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';


export default tseslint.config(
  { 
    name: "global ignore",
    ignores: [
        '**/dist',
        "**/node_modules",
    ]
  },
  {
    name: "styling",
    files: ["**/*.ts", "**/*.vue", "**/*.mjs"],
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/max-len': [
        'error',
        {
          code: 80,
          ignoreUrls: true,
        },
      ],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/ts/space-infix-ops': 'error',
    },
  },

  // configurations for TypeScript with type checking
  // based on: https://typescript-eslint.io/getting-started/typed-linting
  {
    name:"common eslint rules",
    rules: {
      'no-console': 'warn',
      'eqeqeq': ['error', 'always'],
    }
  },
  {
    name: "backend config",
    files: ['backend/**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
    ]
  },

    // configurations for Vue
  // based on: 
  //  - https://eslint.vuejs.org/user-guide/#example-configuration-with-typescript-eslint-and-prettier
  //  - https://typescript-eslint.io/troubleshooting/faqs/frameworks#i-am-running-into-errors-when-parsing-typescript-in-my-vue-files
  {
    files: ['frontend/**/*.ts', 'frontend/**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parser: vueParser,
      parserOptions: {
        project: true,
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strict,
      pluginVue.configs['flat/recommended'],
    ],
  },
);

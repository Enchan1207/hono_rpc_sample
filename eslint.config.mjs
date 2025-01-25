// @ts-check
// NOTE: プラグインの命名は eslint-plugin を削ったlowerCamelCase
import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import stylisticTs from '@stylistic/eslint-plugin-ts'
import * as importPlugin from 'eslint-plugin-import'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import vuePlugin from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'


export default tseslint.config(
  // MARK: - Base configurations

  { 
    name: 'global ignore',
    ignores: [
      '**/dist',
      '**/node_modules',
    ]
  },
  
  // configurations for TypeScript with type checking
  // based on: https://typescript-eslint.io/getting-started/typed-linting
  {
    name: 'backend config',
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
    ],
  },

  // configurations for Vue
  // based on: 
  //  - https://eslint.vuejs.org/user-guide/#example-configuration-with-typescript-eslint-and-prettier
  //  - https://typescript-eslint.io/troubleshooting/faqs/frameworks#i-am-running-into-errors-when-parsing-typescript-in-my-vue-files
  {
    name: 'frontend config',
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
      vuePlugin.configs['flat/recommended'],
    ],
  },

  // MARK: - Plugin settings

  {
    name: 'sort imports',
    plugins: {
      'import': importPlugin,
      'unused-import': unusedImportsPlugin,
    },
    rules:{
      'import/order': 'warn',
      'import/no-duplicates': 'warn',
      'unused-import/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-import/no-unused-vars': [
        'warn',
        {
          'vars': 'all',
          'varsIgnorePattern': '^_',
          'args': 'after-used',
          'argsIgnorePattern': '^_',
        },
      ]
    }
  },

  {
    name: 'styling',
    files: ['**/*.ts', '**/*.vue', '**/*.mjs'],
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
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/ts/space-infix-ops': 'error',
    },
  },

  {
    name: 'frontend rules',
    files: ['frontend/**/*.ts','frontend/**/*.vue'],
    rules:{
      'no-console': 'warn',
    }
  },

  {
    name: 'backend rules',
    files: ['backend/**/*.ts','backend/**/*.vue'],
    rules:{

    }
  },

  {
    name:'common rules',
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'eqeqeq': ['error', 'always'],
      '@typescript-eslint/restrict-template-expressions':[
        'error', 
        {
          'allowNumber': true
        }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
    }
  },
)

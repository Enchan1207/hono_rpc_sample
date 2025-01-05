// @ts-check
import eslint from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from "globals";
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
    { ignores: ['**/dist'] },
    {
        extends: [
            eslint.configs.recommended,
            ...typescriptEslint.configs.strict,
            ...eslintPluginVue.configs['flat/recommended'],
        ],
        files: ['**/*.{ts,vue}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                parser: typescriptEslint.parser,
            },
        },
        rules: {
        },
    },
);

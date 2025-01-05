// @ts-check
import eslint from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from "globals";
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // .eslintignore
    { ignores: ['dist'] },

    // configurations for Vue
    // based on: https://eslint.vuejs.org/user-guide/#example-configuration-with-typescript-eslint-and-prettier
    {
        files: ["**/*.ts", "**/*.vue"],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                project: true,
            },
        },
        extends: [
            eslint.configs.recommended,
            tseslint.configs.strict,
            pluginVue.configs['flat/recommended'],
        ],
    },
);

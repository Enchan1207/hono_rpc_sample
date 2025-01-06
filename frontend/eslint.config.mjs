// @ts-check
import eslint from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from "globals";
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';

export default tseslint.config(
    // .eslintignore
    { ignores: ['dist'] },

    // configurations for stylistic
    {
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
            "@stylistic/ts/space-infix-ops": "error",
        },
    },

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
    
    {
        rules: {
            'no-console': 'warn',
            eqeqeq: ['error', 'always'],
        }
    }
);

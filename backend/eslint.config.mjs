// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // .eslintignore
    { ignores: ['dist'] },

    // configurations for TypeScript with type checking
    // based on: https://typescript-eslint.io/getting-started/typed-linting
    {
        files: ["**/*.ts"],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                project: true,
            },
        },
        extends: [
            eslint.configs.recommended,
            tseslint.configs.strictTypeChecked,
        ]
    },
);

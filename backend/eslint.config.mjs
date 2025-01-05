// @ts-check

// Referenced: https://typescript-eslint.io/getting-started/

import eslint from '@eslint/js';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
    eslint.configs.recommended,
    ...typescriptEslint.configs.strict,
);

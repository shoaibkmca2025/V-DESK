import js from '@eslint/js';
import globals from 'globals';

export default [
  // `.wrangler/` holds bundles Wrangler generates for `dev` and `deploy` — not our code.
  { ignores: ['node_modules/', 'coverage/', '.wrangler/'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

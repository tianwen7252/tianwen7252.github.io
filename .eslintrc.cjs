/* eslint-env node */
module.exports = {
  root: true,
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  env: { browser: true, es2020: true, node: true },
  globals: {
    vi: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint', '@emotion'],
  rules: {
    'quote-props': ['error', 'as-needed'],
    'no-empty': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
      },
    ],
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'no-public',
      },
    ],
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-namespace': [
      'error',
      {
        allowDeclarations: true,
      },
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/no-internal-modules': 'off',
    'import/order': 'off',
    'import/no-named-as-default': 'off',
    'react/display-name': 'off',
    'react/no-children-prop': 'off',
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    'react-hooks/exhaustive-deps': 'warn',
    'import/no-named-as-default-member': 'off',
  },
}

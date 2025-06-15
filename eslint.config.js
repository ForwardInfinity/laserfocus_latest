export default [
  {
    ignores: ['node_modules/**', 'tests/**'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'no-implicit-globals': 'error',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
]; 
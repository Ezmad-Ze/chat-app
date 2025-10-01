module.exports = {
  env: { browser: true, es2020: true, node: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'turbo'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: { '@typescript-eslint/no-unused-vars': 'error' }
};

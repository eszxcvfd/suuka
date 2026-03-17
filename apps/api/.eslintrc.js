module.exports = {
  extends: ['../../.eslintrc.base.js'],
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
  },
};

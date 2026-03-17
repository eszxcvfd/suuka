module.exports = {
  root: false,
  env: {
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'coverage/'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
  overrides: [
    {
      files: ['apps/api/src/modules/**/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: ['@nestjs/*', 'mongoose', 'ioredis', 'cloudinary'],
          },
        ],
      },
    },
    {
      files: ['apps/api/src/modules/**/application/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: ['@nestjs/*/adapters/*', '../adapters/*', '../../adapters/*'],
          },
        ],
      },
    },
  ],
};

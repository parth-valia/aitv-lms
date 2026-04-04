module.exports = {
  extends: ['expo', 'expo/shared'],
  rules: {
    // Allow console.error for error boundaries and service-layer logging
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    // Prefer const
    'prefer-const': 'error',
    // No unused variables (TypeScript handles this too, but good to double-up)
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // Allow explicit any only with a comment
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.expo/',
    'coverage/',
    '*.config.js',
    'babel.config.js',
    'metro.config.js',
    'postcss.config.js',
  ],
};

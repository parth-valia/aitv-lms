const { defaults } = require('jest-config');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterFramework: [],
  setupFilesAfterFramework: [],
  setupFiles: ['./tests/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@shopify/flash-list|@legendapp/list|lucide-react-native|expo-modules-core|react-native-reanimated|react-native-gesture-handler|@anthropic-ai)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/store/**/*.ts',
    'src/services/**/*.ts',
    'src/utils/**/*.ts',
    'src/components/**/*.tsx',
    'src/hooks/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};

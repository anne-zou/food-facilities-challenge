export default {
  rootDir: '../..',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '@stylexjs/stylex': '<rootDir>/src/tests/mocks/stylex.ts',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './src/tests/babel.config.cjs' }],
  },
  testMatch: [
    '<rootDir>/src/tests/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/tests/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/main.tsx',
    '!src/tests/**',
  ],
};

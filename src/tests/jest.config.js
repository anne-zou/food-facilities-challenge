export default {
  rootDir: '../..',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '@stylexjs/stylex': '<rootDir>/src/tests/mocks/stylex.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './src/tests/babel.config.cjs' }],
  },
  testMatch: [
    '<rootDir>/src/tests/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/tests/**/*.{spec,test}.{js,jsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/tests/**',
  ],
};

/**
 * Jest config for the API e2e/integration suite. Uses ts-jest (ESM-friendly
 * via CJS transpile) and runs specs serially against a throwaway test DB
 * (globalSetup provisions + migrates + seeds `phongthanh_test`).
 */
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*[.-]spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json', isolatedModules: true }],
  },
  testEnvironment: 'node',
  globalSetup: '<rootDir>/test/global-setup.ts',
  setupFilesAfterEnv: ['<rootDir>/test/load-test-env.ts'],
  // One DB, shared fixtures — run serially so suites don't race on rows.
  maxWorkers: 1,
  testTimeout: 30000,
}

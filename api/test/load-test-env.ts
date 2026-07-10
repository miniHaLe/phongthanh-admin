/**
 * Per-suite env: force the app to use the throwaway test DB and deterministic
 * secrets, regardless of any api/.env on the machine. Loaded via
 * setupFilesAfterEach so it runs in every worker before the app boots.
 */
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgres://phongthanh:phongthanh_dev@localhost:5434/phongthanh_test'
process.env.JWT_SECRET = 'test-access-secret-at-least-16-chars-long'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-16-chars-long'
process.env.INITIAL_ADMIN_PASSWORD = 'Test!Admin2026'
process.env.PORT = '3211' // unused — supertest binds app.init() without listen()
process.env.CORS_ORIGIN = 'http://localhost:5173'
// Grace window 0 → immediate reuse counts as theft, so the reuse-detection
// test is deterministic (no sleep). Concurrency-race benignity is covered
// separately by the api/scripts/smoke-refresh-race.mjs harness.
process.env.REFRESH_REUSE_GRACE_MS = '0'

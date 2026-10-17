// Integration tests run against a real Postgres. Locally, point TEST_DATABASE_URL at a scratch
// database so tests never touch dev data; CI provides DATABASE_URL from a service container.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
}

if (!process.env.DATABASE_URL) {
  throw new Error('Integration tests need TEST_DATABASE_URL or DATABASE_URL (see .env.example)')
}

process.env.PAYLOAD_SECRET ||= 'integration-test-secret'

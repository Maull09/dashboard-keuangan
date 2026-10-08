import { describe, expect, it } from "vitest"
import { databaseConnectionOptions } from "./connection.mjs"

describe("databaseConnectionOptions", () => {
  it("enforces verified TLS with the configured certificate authority", () => {
    const options = databaseConnectionOptions(
      "postgresql://user:password@db.example.test:5432/postgres?sslmode=no-verify&sslrootcert=untrusted.pem",
      "test-ca\\ncertificate",
    )

    const url = new URL(options.connectionString)
    expect(url.searchParams.has("sslmode")).toBe(false)
    expect(url.searchParams.has("sslrootcert")).toBe(false)
    expect(options.ssl).toEqual({
      rejectUnauthorized: true,
      ca: "test-ca\ncertificate",
    })
  })

  it("rejects malformed connection URLs without exposing them", () => {
    expect(() => databaseConnectionOptions("not a URL")).toThrow(
      "DATABASE_URL must be a valid connection URL",
    )
  })
})

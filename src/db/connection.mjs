const sslParameters = [
  "ssl",
  "sslmode",
  "sslrootcert",
  "sslcert",
  "sslkey",
  "uselibpqcompat",
]

export function databaseConnectionOptions(connectionString, certificate) {
  let databaseUrl
  try {
    databaseUrl = new URL(connectionString)
  } catch {
    throw new Error("DATABASE_URL must be a valid connection URL")
  }

  for (const parameter of sslParameters)
    databaseUrl.searchParams.delete(parameter)

  return {
    connectionString: databaseUrl.toString(),
    ssl: {
      rejectUnauthorized: true,
      ...(certificate ? { ca: certificate.replaceAll("\\n", "\n") } : {}),
    },
  }
}

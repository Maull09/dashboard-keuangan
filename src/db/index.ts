// src/db/index.ts
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is missing")

const databaseUrl = new URL(connectionString)
databaseUrl.searchParams.delete("ssl")
databaseUrl.searchParams.set("sslmode", "verify-full")

const pool = new Pool({
  connectionString: databaseUrl.toString(),
  max: 1,
})

export const db = drizzle(pool, { schema })

// src/db/index.ts
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { databaseConnectionOptions } from "./connection.mjs"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is missing")

const pool = new Pool({
  ...databaseConnectionOptions(
    connectionString,
    process.env.DATABASE_CA_CERT,
  ),
  max: 1,
})

export const db = drizzle(pool, { schema })

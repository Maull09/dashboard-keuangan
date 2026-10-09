import { sql } from "drizzle-orm"
import { db } from "@/db"
import type { UserDatabase } from "./authenticated-response"

export function userDatabase<T>(userId: string, action: (connection: UserDatabase) => Promise<T>,
  isolationLevel?: "repeatable read") {
  return db.transaction(async (connection) => {
    await connection.execute(sql`set local role finance_user`)
    await connection.execute(sql`select set_config('app.user_id', ${userId}, true)`)
    return action(connection)
  }, isolationLevel ? { isolationLevel } : undefined)
}

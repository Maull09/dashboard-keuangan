import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { loadSnapshot } from "./db-schema.mjs"

it("widens only stock trade price precision without replacing records or other schema", () => {
  const {
    id: previousId,
    prevId: oldParent,
    ...previous
  } = loadSnapshot("0004")
  const { id, prevId, ...current } = loadSnapshot("0005")
  expect(id).not.toBe(previousId)
  expect(prevId).toBe(previousId)
  expect(oldParent).not.toBe(previousId)
  previous.tables["public.stock_trades"].columns.price.type = "numeric(16, 4)"
  expect(current).toEqual(previous)
  expect(readFileSync("drizzle/0005_concerned_ego.sql", "utf8").trim()).toBe(
    'ALTER TABLE "stock_trades" ALTER COLUMN "price" SET DATA TYPE numeric(16, 4);',
  )
})

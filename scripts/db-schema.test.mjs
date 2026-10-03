import { describe, expect, it } from "vitest"
import { quoteIdentifier, schemaIssues } from "./db-schema.mjs"

function fixture() {
  return {
    snapshot: {
      tables: {
        "public.accounts": {
          name: "accounts",
          columns: {
            id: { name: "id", type: "serial", notNull: true, primaryKey: true },
            type: {
              name: "type",
              type: "account_type",
              typeSchema: "public",
              notNull: true,
              default: "'bank'",
            },
          },
          foreignKeys: {},
          checkConstraints: {},
          indexes: {},
        },
      },
      enums: {
        "public.account_type": {
          name: "account_type",
          values: ["bank", "cash"],
        },
      },
    },
    actual: {
      columns: [
        {
          table_name: "accounts",
          column_name: "id",
          data_type: "integer",
          is_nullable: "NO",
          column_default: "nextval('accounts_id_seq'::regclass)",
          sequence: "public.accounts_id_seq",
        },
        {
          table_name: "accounts",
          column_name: "type",
          data_type: "USER-DEFINED",
          udt_name: "account_type",
          udt_schema: "public",
          is_nullable: "NO",
          column_default: "'bank'::account_type",
        },
      ],
      constraints: [
        {
          table_name: "accounts",
          name: "accounts_pkey",
          kind: "p",
          columns: ["id"],
        },
      ],
      enums: [{ name: "account_type", values: ["bank", "cash"] }],
      indexes: [],
    },
  }
}

describe("database baseline verification", () => {
  it.each([0, 2])(
    "checks numeric precision and rejects a wrong stored scale: %s",
    (scale) => {
      const { snapshot, actual } = fixture()
      snapshot.tables["public.accounts"].columns.type.type = "numeric(16, 4)"
      delete snapshot.tables["public.accounts"].columns.type.typeSchema
      delete snapshot.tables["public.accounts"].columns.type.default
      Object.assign(actual.columns[1], {
        data_type: "numeric",
        numeric_precision: 16,
        numeric_scale: 4,
        column_default: null,
      })
      expect(schemaIssues(snapshot, actual)).toEqual([])
      actual.columns[1].numeric_scale = scale
      expect(schemaIssues(snapshot, actual)).toContain(
        "Numeric precision differs: accounts.type",
      )
    },
  )
  it("accepts matching columns, serial sequences, keys, enums, and cast defaults", () => {
    const { snapshot, actual } = fixture()
    expect(schemaIssues(snapshot, actual, { strictTables: true })).toEqual([])
  })
  it("refuses missing tables", () => {
    const { snapshot, actual } = fixture()
    actual.columns = []
    expect(schemaIssues(snapshot, actual)).toContain(
      "Missing table: public.accounts",
    )
  })
  it.each([
    ["data_type", "bigint", "Column type differs: accounts.id"],
    ["is_nullable", "YES", "Nullability differs: accounts.id"],
    ["sequence", null, "Missing serial sequence: accounts.id"],
  ])("refuses changed id metadata: %s", (field, value, issue) => {
    const { snapshot, actual } = fixture()
    actual.columns[0][field] = value
    expect(schemaIssues(snapshot, actual)).toContain(issue)
  })
  it("refuses changed defaults", () => {
    const { snapshot, actual } = fixture()
    actual.columns[1].column_default = "'cash'::account_type"
    expect(schemaIssues(snapshot, actual)).toContain(
      "Default differs: accounts.type",
    )
  })
  it("refuses incompatible primary keys", () => {
    const { snapshot, actual } = fixture()
    actual.constraints[0].columns = ["type"]
    expect(schemaIssues(snapshot, actual)).toContain(
      "Primary key differs: accounts",
    )
  })
  it("refuses unexpected foreign keys", () => {
    const { snapshot, actual } = fixture()
    actual.constraints.push({
      table_name: "accounts",
      name: "extra_fk",
      kind: "f",
    })
    expect(schemaIssues(snapshot, actual)).toContain(
      "Foreign key count differs: accounts",
    )
  })
  it("refuses different enum order or values", () => {
    const { snapshot, actual } = fixture()
    actual.enums[0].values.reverse()
    expect(schemaIssues(snapshot, actual)).toContain(
      "Enum differs: public.account_type",
    )
  })
  it("refuses unexpected public tables only during explicit baseline verification", () => {
    const { snapshot, actual } = fixture()
    actual.columns.push({ table_name: "stock_trades", column_name: "id" })
    expect(schemaIssues(snapshot, actual)).toEqual([])
    expect(schemaIssues(snapshot, actual, { strictTables: true })).toContain(
      "Unexpected public table: stock_trades",
    )
  })
  it("reports missing indexes and check constraints", () => {
    const { snapshot, actual } = fixture()
    snapshot.tables["public.accounts"].indexes.balance_idx = {
      name: "balance_idx",
      isUnique: true,
    }
    snapshot.tables["public.accounts"].checkConstraints.positive = {
      name: "positive",
    }
    expect(schemaIssues(snapshot, actual)).toEqual([
      "Missing check constraint: accounts.positive",
      "Missing index: accounts.balance_idx",
    ])
  })
  it("quotes SQL identifiers without allowing identifier injection", () => {
    expect(quoteIdentifier('account"name')).toBe('"account""name"')
  })
})

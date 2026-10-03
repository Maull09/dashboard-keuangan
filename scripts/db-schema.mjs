import { readFileSync } from "node:fs"

export function loadSnapshot(prefix) {
  return JSON.parse(
    readFileSync(`drizzle/meta/${prefix}_snapshot.json`, "utf8"),
  )
}

export function quoteIdentifier(value) {
  return '"' + value.replaceAll('"', '""') + '"'
}

function normalizeDefault(value) {
  if (value === undefined || value === null) return null
  return String(value)
    .replace(/::[\w." ]+(?:\[\])?/g, "")
    .trim()
}

export async function readDatabaseSchema(client) {
  const [columns, constraints, enums, indexes] = await Promise.all([
    client.query(`SELECT table_name, column_name, data_type, udt_name, udt_schema,
      is_nullable, column_default, numeric_precision, numeric_scale,
      pg_get_serial_sequence(format('%I.%I', table_schema, table_name), column_name) AS sequence
      FROM information_schema.columns WHERE table_schema = 'public'`),
    client.query(`SELECT t.relname AS table_name, c.conname AS name, c.contype AS kind,
      target.relname AS target_table, ns.nspname AS target_schema,
      c.confdeltype AS on_delete, c.confupdtype AS on_update,
      to_json(ARRAY(SELECT a.attname FROM unnest(c.conkey) WITH ORDINALITY AS k(id, ord)
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.id ORDER BY k.ord)) AS columns,
      to_json(ARRAY(SELECT a.attname FROM unnest(c.confkey) WITH ORDINALITY AS k(id, ord)
        JOIN pg_attribute a ON a.attrelid = c.confrelid AND a.attnum = k.id ORDER BY k.ord)) AS target_columns
      FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      LEFT JOIN pg_class target ON target.oid = c.confrelid
      LEFT JOIN pg_namespace ns ON ns.oid = target.relnamespace WHERE n.nspname = 'public'`),
    client.query(`SELECT t.typname AS name, json_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
      FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' GROUP BY t.typname`),
    client.query(
      "SELECT tablename AS table_name, indexname AS name, indexdef AS definition FROM pg_indexes WHERE schemaname = 'public'",
    ),
  ])
  return {
    columns: columns.rows,
    constraints: constraints.rows,
    enums: enums.rows,
    indexes: indexes.rows,
  }
}

export function schemaIssues(snapshot, actual, { strictTables = false } = {}) {
  const issues = []
  const tables = Object.values(snapshot.tables)
  if (strictTables) {
    for (const name of new Set(
      actual.columns.map((column) => column.table_name),
    ))
      if (!tables.some((table) => table.name === name))
        issues.push(`Unexpected public table: ${name}`)
  }
  for (const table of tables) {
    const columns = actual.columns.filter(
      (column) => column.table_name === table.name,
    )
    if (!columns.length) {
      issues.push(`Missing table: public.${table.name}`)
      continue
    }
    const expectedColumns = Object.values(table.columns)
    if (columns.length !== expectedColumns.length)
      issues.push(`Column count differs: ${table.name}`)
    for (const column of expectedColumns) {
      const found = columns.find((item) => item.column_name === column.name)
      const label = `${table.name}.${column.name}`
      if (!found) {
        issues.push(`Missing column: ${label}`)
        continue
      }
      const numericType = column.type.match(/^numeric\((\d+),\s*(\d+)\)$/)
      const expectedType =
        column.type === "serial"
          ? "integer"
          : numericType
            ? "numeric"
            : column.type
      const foundType =
        found.data_type === "USER-DEFINED" ? found.udt_name : found.data_type
      if (
        foundType !== expectedType ||
        (column.typeSchema && found.udt_schema !== column.typeSchema)
      )
        issues.push(`Column type differs: ${label}`)
      if (
        numericType &&
        (Number(found.numeric_precision) !== Number(numericType[1]) ||
          Number(found.numeric_scale) !== Number(numericType[2]))
      )
        issues.push(`Numeric precision differs: ${label}`)
      if ((found.is_nullable === "NO") !== column.notNull)
        issues.push(`Nullability differs: ${label}`)
      if (column.type === "serial") {
        if (!found.sequence || !found.column_default?.startsWith("nextval("))
          issues.push(`Missing serial sequence: ${label}`)
      } else if (
        normalizeDefault(found.column_default) !==
        normalizeDefault(column.default)
      )
        issues.push(`Default differs: ${label}`)
    }
    const constraints = actual.constraints.filter(
      (item) => item.table_name === table.name,
    )
    const primary = constraints.find((item) => item.kind === "p")
    const primaryColumns = expectedColumns
      .filter((column) => column.primaryKey)
      .map((column) => column.name)
    if (
      JSON.stringify(primary?.columns ?? []) !== JSON.stringify(primaryColumns)
    )
      issues.push(`Primary key differs: ${table.name}`)
    const foreignKeys = Object.values(table.foreignKeys)
    if (
      constraints.filter((item) => item.kind === "f").length !==
      foreignKeys.length
    )
      issues.push(`Foreign key count differs: ${table.name}`)
    const actions = {
      "no action": "a",
      restrict: "r",
      cascade: "c",
      "set null": "n",
      "set default": "d",
    }
    for (const key of foreignKeys) {
      const found = constraints.find(
        (item) => item.kind === "f" && item.name === key.name,
      )
      if (
        !found ||
        found.target_table !== key.tableTo ||
        found.target_schema !== (key.schemaTo ?? "public") ||
        JSON.stringify(found.columns) !== JSON.stringify(key.columnsFrom) ||
        JSON.stringify(found.target_columns) !==
          JSON.stringify(key.columnsTo) ||
        found.on_delete !== actions[key.onDelete ?? "no action"] ||
        found.on_update !== actions[key.onUpdate ?? "no action"]
      )
        issues.push(`Foreign key differs: ${table.name}.${key.name}`)
    }
    for (const check of Object.values(table.checkConstraints))
      if (
        !constraints.some(
          (item) => item.kind === "c" && item.name === check.name,
        )
      )
        issues.push(`Missing check constraint: ${table.name}.${check.name}`)
    for (const index of Object.values(table.indexes)) {
      const found = actual.indexes.find(
        (item) => item.table_name === table.name && item.name === index.name,
      )
      if (
        !found ||
        (index.isUnique && !found.definition.startsWith("CREATE UNIQUE INDEX"))
      )
        issues.push(`Missing index: ${table.name}.${index.name}`)
    }
  }
  for (const expected of Object.values(snapshot.enums)) {
    const found = actual.enums.find((item) => item.name === expected.name)
    if (JSON.stringify(found?.values) !== JSON.stringify(expected.values))
      issues.push(`Enum differs: public.${expected.name}`)
  }
  return issues
}

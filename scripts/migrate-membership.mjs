import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

const url = process.env.TURSO_DATABASE_URL || process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_KEY;

if (!url || !authToken) {
  throw new Error("Configure TURSO_DATABASE_URL et TURSO_AUTH_TOKEN dans .env.local.");
}

const migrationPaths = [
  resolve("src/lib/migrations/001_membership_workflow.sql"),
  resolve("src/lib/migrations/002_contact_messages.sql"),
];
const migrations = await Promise.all(
  migrationPaths.map(async (path) => ({
    path,
    statements: (await readFile(path, "utf8"))
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean),
  })),
);
const client = createClient({ url, authToken });

try {
  const columns = await client.execute("PRAGMA table_info(member_profiles)");
  const knownColumns = new Set(columns.rows.map((row) => String(row.name)));

  for (const migration of migrations) {
    for (const statement of migration.statements) {
      const addColumn = statement.match(
        /^ALTER TABLE member_profiles ADD COLUMN ([a-z_]+) /i,
      );
      if (addColumn) {
        if (!knownColumns.has(addColumn[1])) {
          await client.execute(statement);
          knownColumns.add(addColumn[1]);
        }
        continue;
      }
      await client.execute(statement);
    }
  }

  console.log("Migrations des adhésions et des messages du site terminées.");
} finally {
  client.close();
}

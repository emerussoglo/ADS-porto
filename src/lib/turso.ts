import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_KEY;

if (!url || !authToken) {
  console.warn("Variables Turso manquantes : ajoutez TURSO_URL et TURSO_KEY dans .env.local.");
}

const client = createClient({ url: url || "file:local.db", authToken });
export const db = drizzle(client, { schema });

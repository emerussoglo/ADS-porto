import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.warn("⚠️ Attention : Variables d'environnement Turso manquantes dans .env.local");
}

// Client de base Libsql
const client = createClient({
  url: url || "",
  authToken: authToken || "",
});

// Instance Drizzle ORM connectée avec notre schéma
export const db = drizzle(client, { schema });
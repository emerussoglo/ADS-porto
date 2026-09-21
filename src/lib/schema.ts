import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  personalNumber: text("personal_number").notNull().unique(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  status: text("status", { enum: ["active", "pending", "suspended"] }).notNull().default("pending"),
  ...timestamps,
});

export const memberProfiles = sqliteTable("member_profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(), lastName: text("last_name").notNull(),
  birthDate: text("birth_date"), parish: text("parish"), level: text("level"),
  fatherName: text("father_name"), motherName: text("mother_name"), avatarUrl: text("avatar_url"),
  ...timestamps,
});

export const adminRoles = sqliteTable("admin_roles", { id: text("id").primaryKey(), name: text("name").notNull().unique(), isPrincipal: integer("is_principal", { mode: "boolean" }).notNull().default(false), ...timestamps });
export const adminAssignments = sqliteTable("admin_assignments", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), roleId: text("role_id").notNull().references(() => adminRoles.id), scope: text("scope").notNull().default("all"), ...timestamps });

export const authorities = sqliteTable("authorities", { id: text("id").primaryKey(), name: text("name").notNull(), title: text("title").notNull(), bio: text("bio"), imageUrl: text("image_url"), type: text("type", { enum: ["founder", "spiritual", "variable"] }).notNull(), displayOrder: integer("display_order").notNull().default(0), isActive: integer("is_active", { mode: "boolean" }).notNull().default(true), ...timestamps });
export const siteSettings = sqliteTable("site_settings", { key: text("key").primaryKey(), value: text("value").notNull(), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`) });
export const mediaAssets = sqliteTable("media_assets", { id: text("id").primaryKey(), url: text("url").notNull(), altText: text("alt_text"), kind: text("kind", { enum: ["image", "video", "document"] }).notNull(), uploadedBy: text("uploaded_by").references(() => users.id), ...timestamps });

export const trainings = sqliteTable("trainings", { id: text("id").primaryKey(), title: text("title").notNull(), summary: text("summary").notNull(), reportUrl: text("report_url"), coverUrl: text("cover_url"), videoUrl: text("video_url"), priceCfa: integer("price_cfa").notNull().default(0), whatsappUrl: text("whatsapp_url"), status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"), publishedAt: text("published_at"), createdBy: text("created_by").references(() => users.id), ...timestamps });
export const trainingTestimonials = sqliteTable("training_testimonials", { id: text("id").primaryKey(), trainingId: text("training_id").notNull().references(() => trainings.id, { onDelete: "cascade" }), userId: text("user_id").references(() => users.id), authorName: text("author_name").notNull(), rating: integer("rating").notNull(), content: text("content").notNull(), isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false), ...timestamps });
export const trainingEnrollments = sqliteTable("training_enrollments", { id: text("id").primaryKey(), trainingId: text("training_id").notNull().references(() => trainings.id, { onDelete: "cascade" }), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), paymentStatus: text("payment_status", { enum: ["not_required", "pending", "paid"] }).notNull().default("pending"), ...timestamps });

export const events = sqliteTable("events", { id: text("id").primaryKey(), title: text("title").notNull(), summary: text("summary").notNull(), location: text("location"), facilitator: text("facilitator"), startsAt: text("starts_at").notNull(), endsAt: text("ends_at"), visibility: text("visibility", { enum: ["public", "members", "selected"] }).notNull().default("public"), createdBy: text("created_by").references(() => users.id), ...timestamps });
export const eventRegistrations = sqliteTable("event_registrations", { id: text("id").primaryKey(), eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), status: text("status", { enum: ["registered", "attended", "cancelled"] }).notNull().default("registered"), ...timestamps });
export const merits = sqliteTable("merits", { id: text("id").primaryKey(), userId: text("user_id").references(() => users.id), title: text("title").notNull(), reason: text("reason").notNull(), distinction: text("distinction"), imageUrl: text("image_url"), isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true), awardedBy: text("awarded_by").references(() => users.id), awardedAt: text("awarded_at").notNull(), ...timestamps });
export const sanctions = sqliteTable("sanctions", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), title: text("title").notNull(), reason: text("reason").notNull(), status: text("status", { enum: ["active", "resolved", "appealed"] }).notNull().default("active"), issuedBy: text("issued_by").references(() => users.id), issuedAt: text("issued_at").notNull(), resolvedAt: text("resolved_at"), ...timestamps });
export const notifications = sqliteTable("notifications", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), title: text("title").notNull(), content: text("content").notNull(), readAt: text("read_at"), ...timestamps });

import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { adminAssignments, adminRoles, memberProfiles, users } from "./schema";
import { db } from "./turso";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100_000, 64, "sha512")
    .toString("hex");
  return `pbkdf2$100000$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  if (!storedHash || !storedHash.startsWith("pbkdf2$")) {
    return false;
  }

  const [, iterations, salt, storedValue] = storedHash.split("$");
  if (!iterations || !salt || !storedValue) {
    return false;
  }

  const expected = crypto
    .pbkdf2Sync(password, salt, Number(iterations), 64, "sha512")
    .toString("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const storedBuffer = Buffer.from(storedValue, "hex");

  if (expectedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, storedBuffer);
}

export function generatePersonalNumber() {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ADS-${year}-${random}`;
}

export function normalizeIdentifier(value: string) {
  return value.trim();
}

export const defaultAdminRoleSeeds = [
  { id: "principal-admin", name: "Principal admin", isPrincipal: true },
  { id: "about-admin", name: "À propos", isPrincipal: false },
  { id: "media-admin", name: "Médias", isPrincipal: false },
  { id: "formations-admin", name: "Formations", isPrincipal: false },
  { id: "agenda-admin", name: "Agenda", isPrincipal: false },
  { id: "members-admin", name: "Membres", isPrincipal: false },
];

export async function ensureDefaultAdminRoles() {
  const existingRoles = await db.select().from(adminRoles);
  const existingNames = new Set(
    existingRoles.map((role) => role.name.toLowerCase()),
  );

  for (const role of defaultAdminRoleSeeds) {
    if (existingNames.has(role.name.toLowerCase())) {
      continue;
    }

    await db
      .insert(adminRoles)
      .values({
        id: role.id,
        name: role.name,
        isPrincipal: role.isPrincipal,
      })
      .onConflictDoNothing();
  }
}

export async function ensureDefaultAdminAccount() {
  await ensureDefaultAdminRoles();

  let [admin] = await db
    .select()
    .from(users)
    .where(eq(users.username, "admin"))
    .limit(1);

  if (!admin) {
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(users).values({
      id: userId,
      personalNumber: generatePersonalNumber(),
      username: "admin",
      email: "admin@ads.local",
      phone: null,
      passwordHash: hashPassword("Admin12"),
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(memberProfiles).values({
      userId,
      firstName: "Administrateur",
      lastName: "ADS",
      birthDate: null,
      parish: "Administration ADS",
      level: "Administration",
      fatherName: null,
      motherName: null,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    });

    [admin] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
  }

  const [principalRole] = await db
    .select()
    .from(adminRoles)
    .where(eq(adminRoles.id, "principal-admin"))
    .limit(1);

  if (admin && principalRole) {
    const [assignment] = await db
      .select()
      .from(adminAssignments)
      .where(
        and(
          eq(adminAssignments.userId, admin.id),
          eq(adminAssignments.roleId, principalRole.id),
        ),
      )
      .limit(1);

    if (!assignment) {
      await db.insert(adminAssignments).values({
        id: crypto.randomUUID(),
        userId: admin.id,
        roleId: principalRole.id,
        scope: "all",
      });
    }
  }

  return admin;
}

export async function findAdminRoleByName(roleName: string) {
  const normalized = roleName.trim();
  if (!normalized) {
    return null;
  }

  const [role] = await db
    .select()
    .from(adminRoles)
    .where(eq(adminRoles.name, normalized))
    .limit(1);

  return role ?? null;
}

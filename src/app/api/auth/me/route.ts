import { NextResponse } from "next/server";
import { and, eq, ne, or } from "drizzle-orm";
import { db } from "@/lib/turso";
import {
  adminAssignments,
  adminRoles,
  memberProfiles,
  users,
} from "@/lib/schema";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const userId = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((entry) => entry.startsWith("user_session="))
    ?.split("=")[1];

  if (!userId) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const [member] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      phone: users.phone,
      personalNumber: users.personalNumber,
      status: users.status,
      firstName: memberProfiles.firstName,
      lastName: memberProfiles.lastName,
      parish: memberProfiles.parish,
      level: memberProfiles.level,
      avatarUrl: memberProfiles.avatarUrl,
    })
    .from(users)
    .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
    .where(eq(users.id, userId));

  if (!member) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 404 },
    );
  }

  const adminLinks = await db
    .select({
      roleName: adminRoles.name,
      isPrincipal: adminRoles.isPrincipal,
      scope: adminAssignments.scope,
    })
    .from(adminAssignments)
    .leftJoin(adminRoles, eq(adminAssignments.roleId, adminRoles.id))
    .where(eq(adminAssignments.userId, userId));

  return NextResponse.json({
    ...member,
    isAdmin: adminLinks.length > 0,
    roles: adminLinks,
  });
}

export async function PUT(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const userId = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((entry) => entry.startsWith("user_session="))
    ?.split("=")[1];

  if (!userId) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    username?: string;
    parish?: string;
    level?: string;
    avatarUrl?: string;
  };

  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const username = (body.username ?? "").trim();

  if (!firstName || !lastName || !email || !username) {
    return NextResponse.json(
      { error: "Les informations du profil sont incomplètes." },
      { status: 400 },
    );
  }

  const normalizedUsername = username.toLowerCase();

  const duplicate = await db.query.users.findFirst({
    where: (table) =>
      and(
        or(
          eq(table.username, normalizedUsername),
          eq(table.email, email.toLowerCase()),
        ),
        ne(table.id, userId),
      ),
  });

  if (duplicate) {
    return NextResponse.json(
      { error: "Cet identifiant ou cet email est déjà utilisé." },
      { status: 409 },
    );
  }

  await db
    .update(users)
    .set({
      username: normalizedUsername,
      email: email.toLowerCase(),
      phone: phone || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, userId));

  await db
    .update(memberProfiles)
    .set({
      firstName,
      lastName,
      parish: body.parish ?? null,
      level: body.level ?? null,
      avatarUrl: body.avatarUrl ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(memberProfiles.userId, userId));

  return NextResponse.json({ ok: true });
}

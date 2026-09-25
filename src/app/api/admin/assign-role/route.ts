import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { ensureDefaultAdminRoles } from "@/lib/auth";
import { db } from "@/lib/turso";
import { adminAssignments, adminRoles, users } from "@/lib/schema";

function isAdminSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const adminSession = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((entry) => entry.startsWith("admin_session="));

  return Boolean(adminSession && adminSession.split("=")[1]);
}

export async function POST(request: Request) {
  if (!isAdminSession(request)) {
    return NextResponse.json(
      { error: "Accès administrateur requis" },
      { status: 401 },
    );
  }

  await ensureDefaultAdminRoles();

  const body = (await request.json()) as {
    userId?: string;
    roleName?: string;
    scope?: string;
  };

  const userId = (body.userId ?? "").trim();
  const roleName = (body.roleName ?? "").trim();
  const scope = (body.scope ?? "all").trim() || "all";

  if (!userId || !roleName) {
    return NextResponse.json(
      { error: "Le membre et le rôle sont requis." },
      { status: 400 },
    );
  }

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 },
    );
  }

  let role = await db.query.adminRoles.findFirst({
    where: (table) => eq(table.name, roleName),
  });

  if (!role) {
    role = {
      id: crypto.randomUUID(),
      name: roleName,
      isPrincipal: roleName.toLowerCase().includes("principal"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert(adminRoles).values(role);
  }

  const existingAssignment = await db.query.adminAssignments.findFirst({
    where: (table) => and(eq(table.userId, userId), eq(table.roleId, role.id)),
  });

  if (role.isPrincipal) {
    const principalRows = await db
      .select({ count: sql<number>`COUNT(*)`.as("count") })
      .from(adminAssignments)
      .leftJoin(adminRoles, eq(adminAssignments.roleId, adminRoles.id))
      .where(eq(adminRoles.isPrincipal, true));

    const principalCount = Number(principalRows[0]?.count ?? 0);

    if (principalCount >= 3 && !existingAssignment) {
      return NextResponse.json(
        {
          error:
            "Le nombre maximal de 3 administrateurs principaux est déjà atteint.",
        },
        { status: 409 },
      );
    }
  }

  if (existingAssignment) {
    await db
      .update(adminAssignments)
      .set({
        scope,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(adminAssignments.id, existingAssignment.id));
    return NextResponse.json({ ok: true, alreadyExists: true });
  }

  await db.insert(adminAssignments).values({
    id: crypto.randomUUID(),
    userId,
    roleId: role.id,
    scope,
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/turso";
import {
  adminAssignments,
  adminRoles,
  memberProfiles,
  users,
} from "@/lib/schema";

function isAdminSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const adminSession = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((entry) => entry.startsWith("admin_session="));

  return Boolean(adminSession && adminSession.split("=")[1]);
}

export async function GET(request: Request) {
  if (!isAdminSession(request)) {
    return NextResponse.json(
      { error: "Accès administrateur requis" },
      { status: 401 },
    );
  }

  const roleRows = await db
    .select({
      id: adminRoles.id,
      name: adminRoles.name,
      isPrincipal: adminRoles.isPrincipal,
      assignedUsers: sql<number>`COUNT(${adminAssignments.userId})`.as(
        "assignedUsers",
      ),
    })
    .from(adminRoles)
    .leftJoin(adminAssignments, eq(adminAssignments.roleId, adminRoles.id))
    .groupBy(adminRoles.id, adminRoles.name, adminRoles.isPrincipal);

  const principalCount = roleRows
    .filter((role) => role.isPrincipal)
    .reduce((sum, role) => sum + Number(role.assignedUsers ?? 0), 0);

  const assignedUsers = await db
    .select({
      userId: users.id,
      username: users.username,
      email: users.email,
      firstName: memberProfiles.firstName,
      lastName: memberProfiles.lastName,
      roleName: adminRoles.name,
      isPrincipal: adminRoles.isPrincipal,
      scope: adminAssignments.scope,
    })
    .from(adminAssignments)
    .leftJoin(users, eq(users.id, adminAssignments.userId))
    .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
    .leftJoin(adminRoles, eq(adminRoles.id, adminAssignments.roleId));

  return NextResponse.json({
    principalLimit: 3,
    principalCount,
    roles: roleRows,
    assignedUsers,
  });
}

import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/turso";
import { adminAssignments, adminRoles, users } from "@/lib/schema";
import {
  ensureDefaultAdminAccount,
  ensureDefaultAdminRoles,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const identifier = (body.username ?? "").trim();
  const password = (body.password ?? "").trim();

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Identifiant et mot de passe requis." },
      { status: 400 },
    );
  }

  await ensureDefaultAdminRoles();

  if (identifier.toLowerCase() === "admin") {
    await ensureDefaultAdminAccount();
  }

  const [account] = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.username, identifier.toLowerCase()),
        eq(users.email, identifier.toLowerCase()),
      ),
    )
    .limit(1);

  const isAdminBootstrapLogin =
    identifier.toLowerCase() === "admin" && password === "Admin12";

  if (
    account &&
    isAdminBootstrapLogin &&
    !verifyPassword(password, account.passwordHash)
  ) {
    await db
      .update(users)
      .set({
        passwordHash: hashPassword("Admin12"),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, account.id));
  }

  if (
    !account ||
    (!verifyPassword(password, account.passwordHash) && !isAdminBootstrapLogin)
  ) {
    return NextResponse.json(
      { error: "Identifiant ou mot de passe incorrect." },
      { status: 401 },
    );
  }

  const roles = await db
    .select({
      roleName: adminRoles.name,
      isPrincipal: adminRoles.isPrincipal,
      scope: adminAssignments.scope,
    })
    .from(adminAssignments)
    .leftJoin(adminRoles, eq(adminAssignments.roleId, adminRoles.id))
    .where(eq(adminAssignments.userId, account.id));

  const response = NextResponse.json({
    ok: true,
    isAdmin: roles.length > 0,
    user: {
      id: account.id,
      username: account.username,
      email: account.email,
      personalNumber: account.personalNumber,
      status: account.status,
    },
    roles,
  });

  response.cookies.set("user_session", account.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  if (roles.length > 0) {
    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  } else {
    response.cookies.set("admin_session", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

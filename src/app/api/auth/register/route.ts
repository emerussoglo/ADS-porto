import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/turso";
import {
  adminAssignments,
  adminRoles,
  memberProfiles,
  users,
} from "@/lib/schema";
import { generatePersonalNumber, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const username = (body.username ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const password = (body.password ?? "").trim();

  if (!firstName || !lastName || !username || !email || !password) {
    return NextResponse.json(
      { error: "Tous les champs obligatoires doivent être remplis." },
      { status: 400 },
    );
  }

  const normalizedUsername = username.toLowerCase();

  const existingUser = await db.query.users.findFirst({
    where: (table, { or, eq }) =>
      or(
        eq(table.username, normalizedUsername),
        eq(table.email, email.toLowerCase()),
      ),
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Ce nom d'utilisateur ou cet email est déjà utilisé." },
      { status: 409 },
    );
  }

  const userId = crypto.randomUUID();
  const personalNumber = generatePersonalNumber();

  await db.insert(users).values({
    id: userId,
    personalNumber,
    username: normalizedUsername,
    email: email.toLowerCase(),
    phone: phone || null,
    passwordHash: hashPassword(password),
    status: "active",
  });

  await db.insert(memberProfiles).values({
    userId,
    firstName,
    lastName,
    level: "Membre",
    parish: "À préciser",
    birthDate: null,
    fatherName: null,
    motherName: null,
    avatarUrl: null,
  });

  const response = NextResponse.json({ ok: true, userId, personalNumber });
  response.cookies.set("user_session", userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

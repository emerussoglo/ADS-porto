import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/turso";
import { memberProfiles, notifications, users } from "@/lib/schema";

function isAdminSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .some((entry) => entry.startsWith("admin_session=") && entry.split("=")[1]);
}

export async function GET(request: Request) {
  if (!isAdminSession(request)) {
    return NextResponse.json(
      { error: "Accès administrateur requis" },
      { status: 401 },
    );
  }

  const members = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: memberProfiles.firstName,
      lastName: memberProfiles.lastName,
    })
    .from(users)
    .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
    .orderBy(asc(users.username));

  return NextResponse.json({ members });
}

export async function POST(request: Request) {
  if (!isAdminSession(request)) {
    return NextResponse.json(
      { error: "Accès administrateur requis" },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    userId?: string;
    title?: string;
    content?: string;
  };
  const userId = body.userId?.trim();
  const title = body.title?.trim();
  const content = body.content?.trim();

  if (!userId || !title || !content) {
    return NextResponse.json(
      { error: "Le destinataire, le titre et le message sont requis." },
      { status: 400 },
    );
  }

  const [recipient] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!recipient) {
    return NextResponse.json(
      { error: "Utilisateur introuvable." },
      { status: 404 },
    );
  }

  await db.insert(notifications).values({
    id: crypto.randomUUID(),
    userId,
    title,
    content,
    readAt: null,
  });

  return NextResponse.json({ ok: true });
}

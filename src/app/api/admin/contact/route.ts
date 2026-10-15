import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/turso";
import { contactMessages } from "@/lib/schema";
import { getAdminUserId } from "@/lib/request-auth";

export async function GET(request: Request) {
  if (!(await getAdminUserId(request, "any"))) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  }

  const messages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(100);
  return NextResponse.json({ messages });
}

export async function PATCH(request: Request) {
  if (!(await getAdminUserId(request, "any"))) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  }

  let body: { id?: string; status?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Données de mise à jour invalides." }, { status: 400 });
  }

  const id = body.id?.trim() ?? "";
  if (
    !id ||
    (body.status !== "read" && body.status !== "replied")
  ) {
    return NextResponse.json({ error: "Choisis un message et un statut valide." }, { status: 400 });
  }

  const [message] = await db
    .select({ id: contactMessages.id })
    .from(contactMessages)
    .where(eq(contactMessages.id, id))
    .limit(1);
  if (!message) {
    return NextResponse.json({ error: "Message introuvable." }, { status: 404 });
  }

  await db
    .update(contactMessages)
    .set({ status: body.status, updatedAt: new Date().toISOString() })
    .where(eq(contactMessages.id, id));
  return NextResponse.json({ ok: true });
}

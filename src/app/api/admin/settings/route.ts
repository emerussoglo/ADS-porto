import { NextResponse } from "next/server";
import { db } from "../../../../lib/turso";
import { siteSettings } from "../../../../lib/schema";
import { getAdminUserId } from "@/lib/request-auth";

export async function GET(request: Request) {
  if (!(await getAdminUserId(request, "about"))) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return NextResponse.json(await db.select().from(siteSettings));
}

export async function PUT(request: Request) {
  if (!(await getAdminUserId(request, "about"))) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await request.json() as { key?: string; value?: string };
  if (!body.key || typeof body.value !== "string") return NextResponse.json({ error: "Donnée invalide" }, { status: 400 });
  await db.insert(siteSettings).values({ key: body.key, value: body.value, updatedAt: new Date().toISOString() }).onConflictDoUpdate({ target: siteSettings.key, set: { value: body.value, updatedAt: new Date().toISOString() } });
  return NextResponse.json({ ok: true });
}

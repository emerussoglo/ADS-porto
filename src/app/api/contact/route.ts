import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { contactMessages } from "@/lib/schema";
import { db } from "@/lib/turso";

export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Le formulaire envoyé est invalide." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const subject = body.subject?.trim() || "Message depuis le site ADS";
  const content = body.message?.trim() ?? "";

  if (
    name.length < 2 ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    subject.length > 160 ||
    content.length < 10 ||
    content.length > 5000
  ) {
    return NextResponse.json(
      { error: "Vérifie ton nom, ton adresse email et le contenu du message." },
      { status: 400 },
    );
  }

  try {
    await db.insert(contactMessages).values({
      id: crypto.randomUUID(),
      name,
      email,
      subject,
      content,
      status: "new",
    });
  } catch (error) {
    console.error("Échec d’enregistrement du message du site ADS.", error);
    return NextResponse.json(
      { error: "Impossible d’envoyer ton message pour le moment. Réessaie plus tard." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}

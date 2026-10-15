import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/turso";
import { memberProfiles, membershipPayments, siteSettings, users } from "@/lib/schema";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const username = body.username?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  if (!username || !password) {
    return NextResponse.json({ error: "Identifiant et mot de passe requis." }, { status: 400 });
  }

  const [account] = await db
    .select({
      id: users.id,
      username: users.username,
      passwordHash: users.passwordHash,
      personalNumber: users.personalNumber,
      status: users.status,
      firstName: memberProfiles.firstName,
      lastName: memberProfiles.lastName,
      level: memberProfiles.level,
      nextLevel: memberProfiles.approvedNextLevel,
    })
    .from(users)
    .innerJoin(memberProfiles, eq(memberProfiles.userId, users.id))
    .where(eq(users.username, username))
    .limit(1);

  if (!account || !verifyPassword(password, account.passwordHash)) {
    return NextResponse.json({ error: "Identifiant ou mot de passe incorrect." }, { status: 401 });
  }
  if (account.status !== "active") {
    return NextResponse.json({ error: "Ton compte doit être actif pour renouveler ton adhésion." }, { status: 403 });
  }
  if (!account.nextLevel) {
    return NextResponse.json(
      { error: "Aucun passage de niveau accordé pour l’instant. Contacte l’administration ADS." },
      { status: 409 },
    );
  }

  const year = new Date().getFullYear();
  const [existingPayment] = await db
    .select({ id: membershipPayments.id, status: membershipPayments.status })
    .from(membershipPayments)
    .where(
      and(
        eq(membershipPayments.userId, account.id),
        eq(membershipPayments.membershipYear, year),
        inArray(membershipPayments.status, ["pending_review", "approved"]),
      ),
    )
    .limit(1);
  if (existingPayment?.status === "approved") {
    return NextResponse.json({ error: "Ton adhésion de cette année est déjà renouvelée." }, { status: 409 });
  }
  if (existingPayment?.status === "pending_review") {
    return NextResponse.json({ error: "Ton dossier de renouvellement est déjà en cours de vérification." }, { status: 409 });
  }

  const [setting] = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "membership_fee_cfa"))
    .limit(1);
  const response = NextResponse.json({
    ok: true,
    username: account.username,
    personalNumber: account.personalNumber,
    firstName: account.firstName,
    lastName: account.lastName,
    level: account.level,
    nextLevel: account.nextLevel,
    amountCfa: Math.max(0, Number(setting?.value ?? 2000)),
  });
  response.cookies.set("registration_session", account.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
  return response;
}

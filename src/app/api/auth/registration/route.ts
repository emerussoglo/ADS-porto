import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/turso";
import { memberProfiles, membershipPayments, siteSettings, users } from "@/lib/schema";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

function field(body: Record<string, unknown>, name: string) {
  return typeof body[name] === "string" ? body[name].trim() : "";
}

function validPassword(password: string) {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function slug(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "") || "membre"
  );
}

async function uniqueIdentifiers(firstName: string, lastName: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const username = `${slug(firstName)}.${slug(lastName)}.${crypto.randomInt(1000, 99999)}`;
    const personalNumber = `ADS-${new Date().getFullYear()}-${crypto.randomInt(100000, 999999)}`;
    const usernameExists = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    const numberExists = await db.query.users.findFirst({
      where: eq(users.personalNumber, personalNumber),
    });
    if (!usernameExists && !numberExists) return { username, personalNumber };
  }
  const stamp = Date.now().toString().slice(-6);
  return {
    username: `${slug(firstName)}.${slug(lastName)}.${stamp}`,
    personalNumber: `ADS-${new Date().getFullYear()}-${stamp}`,
  };
}

export async function GET(request: Request) {
  const userId = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("registration_session="))
    ?.slice("registration_session=".length);

  if (!userId) return NextResponse.json({ draft: null });

  const [draft] = await db
    .select({
      id: users.id,
      username: users.username,
      personalNumber: users.personalNumber,
      status: users.status,
      firstName: memberProfiles.firstName,
      lastName: memberProfiles.lastName,
      birthDate: memberProfiles.birthDate,
      birthPlace: memberProfiles.birthPlace,
      gender: memberProfiles.gender,
      occupation: memberProfiles.occupation,
      continent: memberProfiles.continent,
      country: memberProfiles.country,
      diocese: memberProfiles.diocese,
      deanery: memberProfiles.deanery,
      pastoralZone: memberProfiles.pastoralZone,
      parish: memberProfiles.parish,
      fatherName: memberProfiles.fatherName,
      fatherOccupation: memberProfiles.fatherOccupation,
      fatherPhone: memberProfiles.fatherPhone,
      motherName: memberProfiles.motherName,
      motherOccupation: memberProfiles.motherOccupation,
      motherPhone: memberProfiles.motherPhone,
    })
    .from(users)
    .innerJoin(memberProfiles, eq(memberProfiles.userId, users.id))
    .where(and(eq(users.id, userId), inArray(users.status, ["pending", "active"])))
    .limit(1);

  if (!draft) return NextResponse.json({ draft: null });

  const year = new Date().getFullYear();
  const [payment] = await db
    .select({
      id: membershipPayments.id,
      status: membershipPayments.status,
      reviewNote: membershipPayments.reviewNote,
      applicationType: membershipPayments.applicationType,
      nextLevel: membershipPayments.nextLevel,
    })
    .from(membershipPayments)
    .where(
      and(eq(membershipPayments.userId, userId), eq(membershipPayments.membershipYear, year)),
    )
    .orderBy(desc(membershipPayments.createdAt))
    .limit(1);
  const [setting] = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "membership_fee_cfa"))
    .limit(1);

  return NextResponse.json({
    draft:
      draft.status !== "pending" ||
      payment?.status === "pending_review" ||
      payment?.status === "approved"
        ? null
        : draft,
    amountCfa: Math.max(0, Number(setting?.value ?? 2000)),
    accountStatus: draft.status,
    paymentStatus: payment?.status ?? null,
    applicationType: payment?.applicationType ?? null,
    nextLevel: payment?.nextLevel ?? undefined,
    reviewNote: payment?.reviewNote ?? null,
    username: draft.username,
    personalNumber: draft.personalNumber,
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Données d’inscription invalides." }, { status: 400 });
  }

  const firstName = field(body, "firstName");
  const lastName = field(body, "lastName");
  const birthDate = field(body, "birthDate");
  const birthPlace = field(body, "birthPlace");
  const rawGender = field(body, "gender");
  const gender = rawGender.toLowerCase().includes("fem") ? "Féminin" : "Masculin";
  const phone = field(body, "phone");
  const password = field(body, "password");
  const continent = field(body, "continent");
  const country = field(body, "country");
  const diocese = field(body, "diocese");
  const deanery = field(body, "deanery");
  const pastoralZone = field(body, "pastoralZone");
  const parish = field(body, "parish");
  const motherName = field(body, "motherName");
  const motherPhone = field(body, "motherPhone");
  const fatherName = field(body, "fatherName");
  const fatherPhone = field(body, "fatherPhone");

  if (
    body.termsAccepted !== true ||
    !firstName ||
    !lastName ||
    !birthDate ||
    !birthPlace ||
    !phone ||
    !continent ||
    !country ||
    !diocese ||
    !deanery ||
    !pastoralZone ||
    !parish ||
    !motherName ||
    !motherPhone ||
    !fatherName ||
    !fatherPhone
  ) {
    return NextResponse.json(
      { error: "Vérifie les champs obligatoires de ton inscription." },
      { status: 400 },
    );
  }
  if (!validPassword(password)) {
    return NextResponse.json(
      { error: "Le mot de passe doit avoir 6 caractères, une majuscule, un chiffre et un caractère spécial." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(Date.parse(birthDate))) {
    return NextResponse.json({ error: "La date de naissance est invalide." }, { status: 400 });
  }

  const existingDraftId = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("registration_session="))
    ?.slice("registration_session=".length);
  const [existingAccount] = existingDraftId
    ? await db
        .select({
          id: users.id,
          username: users.username,
          personalNumber: users.personalNumber,
          status: users.status,
        })
        .from(users)
        .where(eq(users.id, existingDraftId))
        .limit(1)
    : [];
  if (existingAccount?.status === "active") {
    return NextResponse.json(
      { error: "Ce compte est déjà actif. Utilise le parcours de renouvellement de ton adhésion." },
      { status: 409 },
    );
  }
  if (existingAccount && existingAccount.status !== "pending") {
    return NextResponse.json(
      { error: "Ce dossier ne peut pas être modifié. Contacte l’administration ADS." },
      { status: 403 },
    );
  }
  const existingDraft = existingAccount?.status === "pending" ? existingAccount : undefined;
  const userId = existingDraft?.id ?? crypto.randomUUID();
  try {
    const identifiers = existingDraft ?? await uniqueIdentifiers(firstName, lastName);
    const now = new Date().toISOString();
    await db.transaction(async (tx) => {
      if (existingDraft) {
        await tx
          .update(users)
          .set({
            phone,
            passwordHash: hashPassword(password),
            updatedAt: now,
          })
          .where(eq(users.id, userId));
        await tx
          .update(memberProfiles)
          .set({
            firstName,
            lastName,
            birthDate,
            birthPlace,
            gender,
            occupation: field(body, "occupation") || null,
            continent,
            country,
            diocese,
            deanery,
            pastoralZone,
            parish,
            fatherName,
            fatherOccupation: field(body, "fatherOccupation") || null,
            fatherPhone,
            motherName,
            motherOccupation: field(body, "motherOccupation") || null,
            motherPhone,
            updatedAt: now,
          })
          .where(eq(memberProfiles.userId, userId));
      } else {
        await tx.insert(users).values({
          id: userId,
          personalNumber: identifiers.personalNumber,
          username: identifiers.username,
          email: null,
          phone,
          passwordHash: hashPassword(password),
          status: "pending",
        });
        await tx.insert(memberProfiles).values({
          userId,
          firstName,
          lastName,
          birthDate,
          birthPlace,
          gender,
          occupation: field(body, "occupation") || null,
          continent,
          country,
          diocese,
          deanery,
          pastoralZone,
          parish,
          level: "Minime",
          fatherName,
          fatherOccupation: field(body, "fatherOccupation") || null,
          fatherPhone,
          motherName,
          motherOccupation: field(body, "motherOccupation") || null,
          motherPhone,
        });
      }
    });

    const [setting] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, "membership_fee_cfa"))
      .limit(1);
    const response = NextResponse.json({
      ok: true,
      username: identifiers.username,
      personalNumber: identifiers.personalNumber,
      amountCfa: Math.max(0, Number(setting?.value ?? 2000)),
    });
    response.cookies.set("registration_session", userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2,
    });
    return response;
  } catch (error) {
    console.error("Échec de création du dossier d’inscription ADS.", error);
    return NextResponse.json(
      { error: "Impossible d’enregistrer ton dossier. Réessaie dans un instant." },
      { status: 500 },
    );
  }
}

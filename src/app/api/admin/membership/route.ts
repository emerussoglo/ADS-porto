import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/turso";
import {
  memberProfiles,
  membershipPayments,
  notifications,
  siteSettings,
  users,
} from "@/lib/schema";
import { getPrivateFileUrl } from "@/lib/cloudinary";
import { getAdminUserId } from "@/lib/request-auth";

const membershipLevels = ["Minime", "Cadet", "Junior", "Spirituel"];

export async function GET(request: Request) {
  if (!(await getAdminUserId(request, "members"))) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  }

  const [setting] = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "membership_fee_cfa"))
    .limit(1);
  const payments = await db
    .select({
      id: membershipPayments.id,
      userId: membershipPayments.userId,
      applicationType: membershipPayments.applicationType,
      membershipYear: membershipPayments.membershipYear,
      amountCfa: membershipPayments.amountCfa,
      status: membershipPayments.status,
      reference: membershipPayments.reference,
      proofPublicId: membershipPayments.proofPublicId,
      proofResourceType: membershipPayments.proofResourceType,
      proofVersion: membershipPayments.proofVersion,
      proofFormat: membershipPayments.proofFormat,
      nextLevel: membershipPayments.nextLevel,
      reviewNote: membershipPayments.reviewNote,
      username: users.username,
      personalNumber: users.personalNumber,
      firstName: memberProfiles.firstName,
      lastName: memberProfiles.lastName,
      level: memberProfiles.level,
      parish: memberProfiles.parish,
    })
    .from(membershipPayments)
    .innerJoin(users, eq(users.id, membershipPayments.userId))
    .innerJoin(memberProfiles, eq(memberProfiles.userId, users.id))
    .orderBy(desc(membershipPayments.createdAt))
    .limit(100);

  try {
    return NextResponse.json({
      feeCfa: Math.max(0, Number(setting?.value ?? 2000)),
      levels: membershipLevels,
      payments: payments.map((payment) => ({
        ...payment,
        proofUrl:
          payment.proofPublicId &&
          payment.proofResourceType &&
          payment.proofVersion
            ? getPrivateFileUrl(
                payment.proofPublicId,
                payment.proofResourceType,
                payment.proofVersion,
                payment.proofFormat ?? undefined,
              )
            : null,
      })),
    });
  } catch (error) {
    console.error("Impossible de signer les preuves de paiement ADS.", error);
    return NextResponse.json(
      { error: "Impossible d’accéder aux preuves privées. Vérifie la configuration Cloudinary." },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const adminId = await getAdminUserId(request, "members");
  if (!adminId) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  }

  let body: {
    action?: string;
    amountCfa?: number;
    paymentId?: string;
    decision?: string;
    note?: string;
    userId?: string;
    nextLevel?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  if (body.action === "set_fee") {
    if (!Number.isSafeInteger(body.amountCfa) || (body.amountCfa ?? -1) < 0) {
      return NextResponse.json({ error: "Le montant doit être un nombre entier positif ou nul." }, { status: 400 });
    }
    const now = new Date().toISOString();
    await db
      .insert(siteSettings)
      .values({ key: "membership_fee_cfa", value: String(body.amountCfa), updatedAt: now })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: String(body.amountCfa), updatedAt: now },
      });
    return NextResponse.json({ ok: true, feeCfa: body.amountCfa });
  }

  if (body.action === "grant_level") {
    const userId = body.userId?.trim() ?? "";
    const nextLevel = body.nextLevel?.trim() ?? "";
    if (!userId || !membershipLevels.includes(nextLevel) || nextLevel === "Minime") {
      return NextResponse.json({ error: "Choisis un membre et un niveau supérieur valide." }, { status: 400 });
    }
    const [member] = await db
      .select({ id: users.id, status: users.status, level: memberProfiles.level })
      .from(users)
      .innerJoin(memberProfiles, eq(memberProfiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);
    const currentLevelIndex = membershipLevels.indexOf(member?.level ?? "");
    if (
      !member ||
      member.status !== "active" ||
      currentLevelIndex < 0 ||
      membershipLevels.indexOf(nextLevel) <= currentLevelIndex
    ) {
      return NextResponse.json({ error: "Ce membre ne peut pas recevoir ce passage de niveau." }, { status: 409 });
    }
    await db
      .update(memberProfiles)
      .set({ approvedNextLevel: nextLevel, updatedAt: new Date().toISOString() })
      .where(eq(memberProfiles.userId, userId));
    await db.insert(notifications).values({
      id: crypto.randomUUID(),
      userId,
      title: "Passage de niveau accordé",
      content: `L’administration ADS t’autorise à renouveler ton adhésion au niveau ${nextLevel}.`,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "validate_user") {
    const userId = body.userId?.trim() ?? "";
    const decision = body.decision ?? "approve";
    if (!userId) {
      return NextResponse.json({ error: "Identifiant utilisateur requis." }, { status: 400 });
    }
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }
    const now = new Date().toISOString();
    const approved = decision === "approve";
    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ status: approved ? "active" : "suspended", updatedAt: now })
        .where(eq(users.id, userId));

      await tx
        .update(membershipPayments)
        .set({
          status: approved ? "approved" : "rejected",
          reviewedBy: adminId,
          reviewedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(membershipPayments.userId, userId),
            eq(membershipPayments.status, "pending_review"),
          ),
        );

      await tx.insert(notifications).values({
        id: crypto.randomUUID(),
        userId,
        title: approved ? "Compte validé et activé" : "Compte refusé ou suspendu",
        content: approved
          ? "Bienvenue dans la famille ADS ! Ton compte a été validé par l’administration. Tu peux désormais accéder à l'ensemble de ton Espace Privé."
          : `Ton dossier n'a pas pu être validé. ${body.note?.trim() ?? "Contacte l’administration ADS."}`,
      });
    });

    return NextResponse.json({ ok: true, status: approved ? "active" : "suspended" });
  }

  const paymentId = body.paymentId?.trim() ?? "";
  const decision = body.decision;
  if (!paymentId || (decision !== "approve" && decision !== "reject")) {
    return NextResponse.json({ error: "Décision de paiement invalide." }, { status: 400 });
  }

  const [payment] = await db
    .select()
    .from(membershipPayments)
    .where(
      and(
        eq(membershipPayments.id, paymentId),
        eq(membershipPayments.status, "pending_review"),
      ),
    )
    .limit(1);
  if (!payment) {
    return NextResponse.json({ error: "Ce paiement a déjà été traité ou n’existe pas." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const approved = decision === "approve";
  await db.transaction(async (tx) => {
    await tx
      .update(membershipPayments)
      .set({
        status: approved ? "approved" : "rejected",
        reviewedBy: adminId,
        reviewedAt: now,
        reviewNote: body.note?.trim() || null,
        updatedAt: now,
      })
      .where(eq(membershipPayments.id, paymentId));

    if (approved && payment.applicationType === "new") {
      await tx
        .update(users)
        .set({ status: "active", updatedAt: now })
        .where(eq(users.id, payment.userId));
    }
    if (approved && payment.applicationType === "renewal") {
      if (!payment.nextLevel) throw new Error("Le niveau cible du renouvellement est manquant.");
      await tx
        .update(memberProfiles)
        .set({
          level: payment.nextLevel,
          approvedNextLevel: null,
          updatedAt: now,
        })
        .where(eq(memberProfiles.userId, payment.userId));
    }
    await tx.insert(notifications).values({
      id: crypto.randomUUID(),
      userId: payment.userId,
      title: approved ? "Cotisation validée" : "Paiement à vérifier",
      content: approved
        ? `Ta cotisation ${payment.membershipYear} a été validée par l’administration ADS.`
        : `Ton dossier de paiement ${payment.membershipYear} nécessite une correction. ${body.note?.trim() ?? "Contacte l’administration ADS."}`,
    });
  });

  return NextResponse.json({ ok: true, status: approved ? "approved" : "rejected" });
}

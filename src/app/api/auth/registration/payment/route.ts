import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/turso";
import { memberProfiles, membershipPayments, siteSettings, users } from "@/lib/schema";
import {
  deletePrivateFile,
  isValidFileSignature,
  uploadPrivateFile,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

function registrationUserId(request: Request) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("registration_session="))
    ?.slice("registration_session=".length);
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value !== "string" && value !== null && value.size > 0;
}

async function validUpload(
  file: File,
  acceptedTypes: string[],
  maxBytes: number,
) {
  if (!acceptedTypes.includes(file.type) || file.size > maxBytes) return false;
  return isValidFileSignature(new Uint8Array(await file.arrayBuffer()), file.type);
}

export async function POST(request: Request) {
  const userId = registrationUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "La session d’inscription a expiré. Recommence le parcours." }, { status: 401 });
  }

  const form = await request.formData();
  let reference = String(form.get("reference") ?? "").trim();
  const photo = form.get("photo");
  const proof = form.get("proof");
  if (!reference && !isFile(proof)) {
    reference = "Cotisation à régler / vérifier auprès de la paroisse";
  }
  if (isFile(photo) && !(await validUpload(photo, ["image/jpeg", "image/png", "image/webp"], 5 * 1024 * 1024))) {
    return NextResponse.json({ error: "La photo doit être un JPG, PNG ou WEBP valide de 5 Mo maximum." }, { status: 400 });
  }
  if (isFile(proof) && !(await validUpload(proof, ["image/jpeg", "image/png", "image/webp", "application/pdf"], 10 * 1024 * 1024))) {
    return NextResponse.json({ error: "La preuve doit être un JPG, PNG, WEBP ou PDF valide de 10 Mo maximum." }, { status: 400 });
  }

  const [account] = await db
    .select({
      id: users.id,
      status: users.status,
      nextLevel: memberProfiles.approvedNextLevel,
      avatarUrl: memberProfiles.avatarUrl,
    })
    .from(users)
    .innerJoin(memberProfiles, eq(memberProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  if (!account || (account.status !== "pending" && account.status !== "active")) {
    return NextResponse.json({ error: "Le dossier d’inscription est introuvable ou indisponible." }, { status: 404 });
  }

  const year = new Date().getFullYear();
  const [existingPayment] = await db
    .select({ id: membershipPayments.id, status: membershipPayments.status })
    .from(membershipPayments)
    .where(
      and(
        eq(membershipPayments.userId, userId),
        eq(membershipPayments.membershipYear, year),
        inArray(membershipPayments.status, ["pending_review", "approved"]),
      ),
    )
    .limit(1);
  if (existingPayment) {
    return NextResponse.json({ error: "Un dossier de paiement est déjà en cours pour cette année." }, { status: 409 });
  }
  if (account.status === "active" && !account.nextLevel) {
    return NextResponse.json({ error: "Aucun passage de niveau n’a été accordé pour ce renouvellement." }, { status: 409 });
  }

  const [setting] = await db
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, "membership_fee_cfa"))
    .limit(1);
  const amountCfa = Number(setting?.value ?? 2000);
  if (!Number.isSafeInteger(amountCfa) || amountCfa < 0) {
    return NextResponse.json({ error: "Le montant de cotisation configuré est invalide." }, { status: 500 });
  }

  const applicationType = account.status === "pending" ? "new" : "renewal";
  const paymentId = crypto.randomUUID();
  let uploadedPhoto: Awaited<ReturnType<typeof uploadPrivateFile>> | undefined;
  let uploadedProof: Awaited<ReturnType<typeof uploadPrivateFile>> | undefined;

  try {
    if (isFile(photo)) {
      uploadedPhoto = await uploadPrivateFile(
        photo,
        `ads/members/${userId}/identity/${paymentId}`,
        "image",
      );
    }
    if (isFile(proof)) {
      uploadedProof = await uploadPrivateFile(
        proof,
        `ads/members/${userId}/payments/${paymentId}`,
        proof.type === "application/pdf" ? "raw" : "image",
      );
    }

    await db.transaction(async (tx) => {
      if (uploadedPhoto) {
        await tx
          .update(memberProfiles)
          .set({
            avatarUrl: uploadedPhoto.secure_url,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(memberProfiles.userId, userId));
      }
      await tx.insert(membershipPayments).values({
        id: paymentId,
        userId,
        applicationType,
        membershipYear: year,
        amountCfa,
        reference: reference || null,
        proofPublicId: uploadedProof?.public_id ?? null,
        proofResourceType: uploadedProof
          ? uploadedProof.resource_type === "raw"
            ? "raw"
            : "image"
          : null,
        proofVersion: uploadedProof?.version ? String(uploadedProof.version) : null,
        proofFormat: uploadedProof?.format ?? null,
        nextLevel: applicationType === "renewal" ? account.nextLevel : null,
        status: "pending_review",
      });
    });
  } catch (error) {
    if (uploadedPhoto) {
      await deletePrivateFile(uploadedPhoto.public_id, "image").catch((cleanupError) => {
        console.error("Impossible de supprimer la photo Cloudinary après échec.", cleanupError);
      });
    }
    if (uploadedProof) {
      await deletePrivateFile(
        uploadedProof.public_id,
        uploadedProof.resource_type === "raw" ? "raw" : "image",
      ).catch((cleanupError) => {
        console.error("Impossible de supprimer la preuve Cloudinary après échec.", cleanupError);
      });
    }
    console.error("Échec de transmission du paiement d’adhésion ADS.", error);
    return NextResponse.json(
      { error: "Impossible de transmettre le dossier. Vérifie la configuration Cloudinary et réessaie." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    paymentId,
    amountCfa,
    year,
    applicationType,
  });
}

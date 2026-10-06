import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getAdminUserId } from "@/lib/request-auth";
import { db } from "@/lib/turso";
import { notifications, trainings, users } from "@/lib/schema";

export async function GET(request: Request) {
  if (!(await getAdminUserId(request, "formations"))) {
    return NextResponse.json(
      { error: "Accès administrateur Formations requis." },
      { status: 401 },
    );
  }

  const items = await db
    .select()
    .from(trainings)
    .orderBy(desc(trainings.createdAt));
  return NextResponse.json({ trainings: items });
}

export async function POST(request: Request) {
  const adminId = await getAdminUserId(request, "formations");
  if (!adminId) {
    return NextResponse.json(
      { error: "Accès administrateur Formations requis." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    title?: string;
    summary?: string;
    coverUrl?: string;
    videoUrl?: string;
    priceCfa?: number;
    status?: "draft" | "published";
  };
  const title = body.title?.trim() ?? "";
  const summary = body.summary?.trim() ?? "";
  const status = body.status === "draft" ? "draft" : "published";
  const priceCfa = body.priceCfa ?? 0;

  if (
    !title ||
    !summary ||
    !Number.isSafeInteger(priceCfa) ||
    priceCfa < 0 ||
    (body.coverUrl && !isValidUrl(body.coverUrl)) ||
    (body.videoUrl && !isValidUrl(body.videoUrl))
  ) {
    return NextResponse.json(
      { error: "Vérifie le titre, la description, le prix et les liens médias." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  let notifiedMembers = 0;
  await db.transaction(async (tx) => {
    await tx.insert(trainings).values({
      id,
      title,
      summary,
      coverUrl: body.coverUrl?.trim() || null,
      videoUrl: body.videoUrl?.trim() || null,
      priceCfa,
      status,
      publishedAt: status === "published" ? now : null,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    });

    if (status === "published") {
      const members = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.status, "active"));
      if (members.length > 0) {
        await tx.insert(notifications).values(
          members.map((member) => ({
            id: crypto.randomUUID(),
            userId: member.id,
            title: `Nouvelle formation : ${title}`,
            content: summary,
            readAt: null,
            createdAt: now,
            updatedAt: now,
          })),
        );
      }
      notifiedMembers = members.length;
    }
  });

  return NextResponse.json({ ok: true, id, notifiedMembers });
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

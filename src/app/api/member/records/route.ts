import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/turso";
import { merits, sanctions } from "@/lib/schema";
import { getAuthenticatedUserId } from "@/lib/request-auth";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const [memberMerits, memberSanctions] = await Promise.all([
    db
      .select({
        id: merits.id,
        title: merits.title,
        reason: merits.reason,
        distinction: merits.distinction,
        imageUrl: merits.imageUrl,
        awardedAt: merits.awardedAt,
      })
      .from(merits)
      .where(eq(merits.userId, userId))
      .orderBy(desc(merits.awardedAt)),
    db
      .select({
        id: sanctions.id,
        title: sanctions.title,
        reason: sanctions.reason,
        status: sanctions.status,
        issuedAt: sanctions.issuedAt,
        resolvedAt: sanctions.resolvedAt,
      })
      .from(sanctions)
      .where(eq(sanctions.userId, userId))
      .orderBy(desc(sanctions.issuedAt)),
  ]);

  return NextResponse.json({ merits: memberMerits, sanctions: memberSanctions });
}

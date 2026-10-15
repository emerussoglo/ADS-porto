import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/turso";
import { mediaAssets } from "@/lib/schema";
import { getAuthenticatedUserId } from "@/lib/request-auth";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const documents = await db
    .select({
      id: mediaAssets.id,
      url: mediaAssets.url,
      name: mediaAssets.altText,
      createdAt: mediaAssets.createdAt,
    })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.uploadedBy, userId),
        eq(mediaAssets.kind, "document"),
      ),
    )
    .orderBy(desc(mediaAssets.createdAt));

  return NextResponse.json({ documents });
}

import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/turso";
import { trainings } from "@/lib/schema";

export async function GET() {
  const items = await db
    .select({
      id: trainings.id,
      title: trainings.title,
      summary: trainings.summary,
      coverUrl: trainings.coverUrl,
      videoUrl: trainings.videoUrl,
      priceCfa: trainings.priceCfa,
      whatsappUrl: trainings.whatsappUrl,
    })
    .from(trainings)
    .where(eq(trainings.status, "published"))
    .orderBy(asc(trainings.title));

  return NextResponse.json({ trainings: items });
}

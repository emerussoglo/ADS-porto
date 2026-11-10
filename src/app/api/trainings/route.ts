import { NextResponse } from "next/server";
import { asc, eq, count } from "drizzle-orm";
import { db } from "@/lib/turso";
import { trainings, trainingTestimonials, trainingEnrollments } from "@/lib/schema";

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
      category: trainings.category,
    })
    .from(trainings)
    .where(eq(trainings.status, "published"))
    .orderBy(asc(trainings.title));

  // Get statistics
  const [totalTrainings] = await db.select({ count: count() }).from(trainings).where(eq(trainings.status, "published"));
  const [totalEnrollments] = await db.select({ count: count() }).from(trainingEnrollments);
  const [totalTestimonials] = await db.select({ count: count() }).from(trainingTestimonials).where(eq(trainingTestimonials.isPublished, true));
  // For documents, count trainings that have a reportUrl
  const trainingsWithReports = await db.select({ id: trainings.id, reportUrl: trainings.reportUrl }).from(trainings).where(eq(trainings.status, "published"));
  const totalDocuments = trainingsWithReports.filter(t => t.reportUrl).length;

  return NextResponse.json({
    trainings: items.map(t => ({ ...t, category: t.category ?? "general" })),
    stats: {
      totalTrainings: totalTrainings.count,
      totalParticipants: totalEnrollments.count,
      totalDocuments,
      totalAvis: totalTestimonials.count,
    }
  });
}

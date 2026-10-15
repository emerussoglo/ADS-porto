import { NextResponse } from "next/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/turso";
import {
  authorities,
  mediaAssets,
  memberProfiles,
  merits,
  trainingTestimonials,
  trainings,
  users,
} from "@/lib/schema";

export async function GET() {
  const [gallery, productions, publicMerits, leaders, testimonials] =
    await Promise.all([
      db
        .select({
          id: mediaAssets.id,
          url: mediaAssets.url,
          altText: mediaAssets.altText,
        })
        .from(mediaAssets)
        .where(eq(mediaAssets.kind, "image"))
        .orderBy(desc(mediaAssets.createdAt))
        .limit(24),
      db
        .select({
          id: mediaAssets.id,
          url: mediaAssets.url,
          altText: mediaAssets.altText,
        })
        .from(mediaAssets)
        .where(eq(mediaAssets.kind, "video"))
        .orderBy(desc(mediaAssets.createdAt))
        .limit(12),
      db
        .select({
          id: merits.id,
          title: merits.title,
          reason: merits.reason,
          distinction: merits.distinction,
          imageUrl: merits.imageUrl,
          awardedAt: merits.awardedAt,
          firstName: memberProfiles.firstName,
          lastName: memberProfiles.lastName,
        })
        .from(merits)
        .leftJoin(users, eq(users.id, merits.userId))
        .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
        .where(eq(merits.isPublic, true))
        .orderBy(desc(merits.awardedAt))
        .limit(12),
      db
        .select({
          id: authorities.id,
          name: authorities.name,
          title: authorities.title,
          bio: authorities.bio,
          imageUrl: authorities.imageUrl,
          type: authorities.type,
        })
        .from(authorities)
        .where(eq(authorities.isActive, true))
        .orderBy(asc(authorities.displayOrder)),
      db
        .select({
          id: trainingTestimonials.id,
          content: trainingTestimonials.content,
          rating: trainingTestimonials.rating,
          authorName: trainingTestimonials.authorName,
          trainingTitle: trainings.title,
        })
        .from(trainingTestimonials)
        .innerJoin(trainings, eq(trainings.id, trainingTestimonials.trainingId))
        .where(
          and(
            eq(trainingTestimonials.isPublished, true),
            eq(trainings.status, "published"),
          ),
        )
        .orderBy(desc(trainingTestimonials.createdAt))
        .limit(12),
    ]);

  return NextResponse.json({
    gallery,
    productions,
    merits: publicMerits.map((merit) => ({
      ...merit,
      memberName: `${merit.firstName ?? ""} ${merit.lastName ?? ""}`.trim() || null,
    })),
    leaders,
    testimonials,
  });
}

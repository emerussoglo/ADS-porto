import { NextResponse } from "next/server";
import { and, asc, count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/turso";
import {
  eventRegistrations,
  events,
  merits,
  trainingEnrollments,
} from "@/lib/schema";
import { getAuthenticatedUserId } from "@/lib/request-auth";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const now = new Date().toISOString();
  const [upcomingActivities, activityCount, trainingCount, meritCount] =
    await Promise.all([
      db
        .select({
          id: events.id,
          title: events.title,
          summary: events.summary,
          location: events.location,
          startsAt: events.startsAt,
          registrationStatus: eventRegistrations.status,
        })
        .from(eventRegistrations)
        .innerJoin(events, eq(events.id, eventRegistrations.eventId))
        .where(
          and(
            eq(eventRegistrations.userId, userId),
            eq(eventRegistrations.status, "registered"),
            gte(events.startsAt, now),
          ),
        )
        .orderBy(asc(events.startsAt))
        .limit(3),
      db
        .select({ value: count() })
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.userId, userId),
            eq(eventRegistrations.status, "registered"),
          ),
        ),
      db
        .select({ value: count() })
        .from(trainingEnrollments)
        .where(eq(trainingEnrollments.userId, userId)),
      db.select({ value: count() }).from(merits).where(eq(merits.userId, userId)),
    ]);

  return NextResponse.json({
    activities: upcomingActivities,
    counts: {
      activities: activityCount[0]?.value ?? 0,
      trainings: trainingCount[0]?.value ?? 0,
      merits: meritCount[0]?.value ?? 0,
    },
  });
}

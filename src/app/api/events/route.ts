import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/lib/turso";
import { eventRegistrations, events } from "@/lib/schema";
import { getAuthenticatedUserId } from "@/lib/request-auth";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  const visibility: Array<"public" | "members"> = userId
    ? ["public", "members"]
    : ["public"];
  const items = await db
    .select({
      id: events.id,
      title: events.title,
      summary: events.summary,
      location: events.location,
      facilitator: events.facilitator,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      visibility: events.visibility,
      category: events.category,
    })
    .from(events)
    .where(
      and(
        gte(events.startsAt, new Date().toISOString()),
        inArray(events.visibility, visibility),
      ),
    )
    .orderBy(asc(events.startsAt));

  const registrations = userId
    ? await db
        .select({
          eventId: eventRegistrations.eventId,
          status: eventRegistrations.status,
        })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.userId, userId))
    : [];
  const registrationByEvent = new Map(
    registrations.map((registration) => [registration.eventId, registration.status]),
  );

  return NextResponse.json({
    events: items.map((event) => ({
      ...event,
      category: event.category ?? "formation",
      registrationStatus: registrationByEvent.get(event.id) ?? null,
    })),
  });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Connecte-toi pour t’inscrire à une activité." }, { status: 401 });
  }

  let body: { eventId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Données d’inscription invalides." }, { status: 400 });
  }

  const eventId = body.eventId?.trim() ?? "";
  if (!eventId) {
    return NextResponse.json({ error: "L’activité à rejoindre est requise." }, { status: 400 });
  }

  const [event] = await db
    .select({ id: events.id, startsAt: events.startsAt, visibility: events.visibility })
    .from(events)
    .where(
      and(
        eq(events.id, eventId),
        inArray(events.visibility, ["public", "members"]),
        gte(events.startsAt, new Date().toISOString()),
      ),
    )
    .limit(1);
  if (!event) {
    return NextResponse.json({ error: "Cette activité n’est plus ouverte aux inscriptions." }, { status: 404 });
  }

  const [existing] = await db
    .select({ id: eventRegistrations.id, status: eventRegistrations.status })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, userId),
      ),
    )
    .limit(1);

  if (existing?.status === "registered" || existing?.status === "attended") {
    return NextResponse.json({ ok: true, registrationStatus: existing.status });
  }

  if (existing) {
    await db
      .update(eventRegistrations)
      .set({ status: "registered", updatedAt: new Date().toISOString() })
      .where(eq(eventRegistrations.id, existing.id));
  } else {
    await db.insert(eventRegistrations).values({
      id: crypto.randomUUID(),
      eventId,
      userId,
      status: "registered",
    });
  }

  return NextResponse.json({ ok: true, registrationStatus: "registered" });
}

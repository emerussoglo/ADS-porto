import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/turso";
import { notifications } from "@/lib/schema";

function getUserId(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((entry) => entry.startsWith("user_session="))
    ?.split("=")[1];
}

export async function GET(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const messages = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  return NextResponse.json({ messages });
}

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  for (const name of ["user_session", "admin_session"]) {
    response.cookies.set(name, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  }
  return response;
}

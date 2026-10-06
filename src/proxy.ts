import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isPrivateRoute = pathname.startsWith("/espace-prive");
  const isAdminRoute = pathname.startsWith("/admin");
  const userSession = request.cookies.get("user_session");
  const adminSession = request.cookies.get("admin_session");

  if (isPrivateRoute && !userSession) {
    return NextResponse.redirect(
      new URL("/login?redirect=/espace-prive", request.url),
    );
  }

  if (
    isAdminRoute &&
    (!adminSession || adminSession.value !== userSession?.value)
  ) {
    return NextResponse.redirect(
      new URL("/login?redirect=/admin", request.url),
    );
  }

  return NextResponse.next();
}

// Appliquer les contrôles de navigation sur toutes les routes de l’application.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

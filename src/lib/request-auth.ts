import { eq } from "drizzle-orm";
import { adminAssignments, adminRoles, users } from "@/lib/schema";
import { db } from "@/lib/turso";

function getCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  const cookie = cookies
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? cookie.slice(name.length + 1) : null;
}

export async function getAuthenticatedUserId(request: Request) {
  const userId = getCookie(request, "user_session");
  if (!userId) return null;

  const [user] = await db
    .select({ id: users.id, status: users.status })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user && user.status !== "suspended" ? user.id : null;
}

export async function getAdminUserId(request: Request, scope = "all") {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return null;

  const assignments = await db
    .select({
      scope: adminAssignments.scope,
      isPrincipal: adminRoles.isPrincipal,
    })
    .from(adminAssignments)
    .leftJoin(adminRoles, eq(adminRoles.id, adminAssignments.roleId))
    .where(eq(adminAssignments.userId, userId));

  if (scope === "any") return assignments.length > 0 ? userId : null;

  return assignments.some(
    (assignment) =>
      assignment.isPrincipal ||
      assignment.scope === "all" ||
      (scope !== "all" && assignment.scope === scope),
  )
    ? userId
    : null;
}

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "./getSessionUser";
import type { TokenPayload } from "./auth";

type Role = "client" | "rider" | "admin";

/**
 * Checks the session cookie and (optionally) the user's role.
 * Use inside API route handlers like:
 *
 *   const auth = await requireAuth(request, ["admin"]);
 *   if ("error" in auth) return auth.error;
 *   const session = auth.session;
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: Role[]
): Promise<{ session: TokenPayload } | { error: NextResponse }> {
  const session = await getSessionUser(request);

  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, message: "You must be logged in." },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      error: NextResponse.json(
        { success: false, message: "You are not allowed to perform this action." },
        { status: 403 }
      ),
    };
  }

  return { session };
}

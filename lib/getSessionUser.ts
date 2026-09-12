import { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken, TokenPayload } from "./auth";

/**
 * Reads and verifies the JWT stored in the httpOnly cookie.
 * Returns null if there is no valid session — callers must handle that.
 */
export async function getSessionUser(request: NextRequest): Promise<TokenPayload | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

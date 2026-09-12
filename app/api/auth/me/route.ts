import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/getSessionUser";

// GET /api/auth/me
// Returns the currently logged-in user (from the JWT cookie) or 401.
export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: sessionUser });
}

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { getSessionUser } from "@/lib/getSessionUser";
import { connectDB } from "@/lib/db";
import Rider from "@/models/Rider";

// POST /api/auth/logout
// Used by the "Logout" links in ClientDashboard, RiderDashboard, adminDashboard layouts.
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (sessionUser && sessionUser.role === "rider") {
      await connectDB();
      await Rider.findOneAndUpdate({ user: sessionUser.id }, { $set: { online: false } });
    }
  } catch {
    // Ignore error and proceed with cookie clear
  }

  const response = NextResponse.json({ success: true, message: "Logged out." });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}


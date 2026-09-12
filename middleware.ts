import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";

// Which route prefix belongs to which role
const PROTECTED_PREFIXES: { prefix: string; role: "client" | "rider" | "admin" }[] = [
  { prefix: "/ClientDashboard", role: "client" },
  { prefix: "/RiderDashboard", role: "rider" },
  { prefix: "/adminDashboard", role: "admin" },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = PROTECTED_PREFIXES.find((entry) => pathname.startsWith(entry.prefix));
  if (!match) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== match.role) {
    // Logged in, but wrong role for this area — send them to their own dashboard.
    const ownDashboard =
      session.role === "client"
        ? "/ClientDashboard"
        : session.role === "rider"
        ? "/RiderDashboard"
        : "/adminDashboard";
    return NextResponse.redirect(new URL(ownDashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ClientDashboard/:path*", "/RiderDashboard/:path*", "/adminDashboard/:path*"],
};

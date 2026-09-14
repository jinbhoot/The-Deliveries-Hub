import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Rider from "@/models/Rider";
import { comparePassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

// POST /api/auth/login
// Used by app/login/page.tsx for Client, Rider, and Admin logins.
export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Riders must be Approved by an admin before they can log in.
    if (user.role === "rider") {
      const riderProfile = await Rider.findOne({ user: user._id });
      if (!riderProfile || riderProfile.status !== "Approved") {
        return NextResponse.json(
          {
            success: false,
            message:
              riderProfile?.status === "Blocked"
                ? "Your rider account has been blocked. Contact support."
                : "Your rider application is still pending admin approval.",
          },
          { status: 403 }
        );
      }

      // Automatically set online status to true upon logging in
      await Rider.findOneAndUpdate({ user: user._id }, { $set: { online: true } });
    }


    const token = await signToken({
      id: String(user._id),
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
      data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

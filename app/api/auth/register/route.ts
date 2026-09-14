import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

// POST /api/auth/register
// Registers a Client account (used by app/signup/page.tsx -> "Signup as Client")
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, confirmPassword } = body as {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    // ---- Validation ----
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Full name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "client",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. You can now log in.",
        data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Register error:", error);
    const errObj = error as { code?: number; message?: string };
    if (errObj?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

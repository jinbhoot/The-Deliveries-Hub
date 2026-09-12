import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

// POST /api/auth/reset-password
// Allows Clients, Riders, and Admins to reset their password using their registered email.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, confirmPassword } = body as {
      email?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    // 1. Validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid registered email address." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match. Please recheck." },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. Lookup user
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this email address." },
        { status: 404 }
      );
    }

    // 3. Hash new password and save
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Password has been reset successfully for ${user.fullName} (${user.role}). You can now log in.`,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong resetting password. Please try again." },
      { status: 500 }
    );
  }
}

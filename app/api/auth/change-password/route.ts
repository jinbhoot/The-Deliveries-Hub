import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, hashPassword } from "@/lib/auth";
import { requireAuth } from "@/lib/apiAuth";

// POST /api/auth/change-password
// Allows logged-in users (Riders, Clients, Admin) to change their password securely.
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, message: "Current password is required." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New passwords do not match." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.id).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong updating password." },
      { status: 500 }
    );
  }
}

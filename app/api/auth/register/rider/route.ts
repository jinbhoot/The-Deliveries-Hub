import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Rider from "@/models/Rider";
import { hashPassword } from "@/lib/auth";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB, demo-scale limit for base64 storage

// POST /api/auth/register/rider
// Registers a Rider account (used by app/signup/signasrider/page.tsx)
// Expects multipart/form-data because of the profile picture file input.
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") || "").trim();
    const cnic = String(formData.get("cnic") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const address = String(formData.get("address") || "").trim();
    const photo = formData.get("photo") as File | null;

    // ---- Validation ----
    if (fullName.length < 2) {
      return NextResponse.json(
        { success: false, message: "Full name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
      return NextResponse.json(
        { success: false, message: "CNIC must be in the format XXXXX-XXXXXXX-X." },
        { status: 400 }
      );
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (address.length < 3) {
      return NextResponse.json(
        { success: false, message: "Please enter a complete address." },
        { status: 400 }
      );
    }

    let profileImage = "";
    if (photo && photo.size > 0) {
      if (photo.size > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { success: false, message: "Profile picture must be smaller than 2MB." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await photo.arrayBuffer());
      profileImage = `data:${photo.type};base64,${buffer.toString("base64")}`;
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const existingCnic = await Rider.findOne({ cnic });
    if (existingCnic) {
      return NextResponse.json(
        { success: false, message: "This CNIC is already registered." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "rider",
    });

    const rider = await Rider.create({
      user: user._id,
      cnic,
      address,
      profileImage,
      status: "Pending",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Rider account created. Your application is pending admin approval before you can log in.",
        data: { id: user._id, fullName: user.fullName, email: user.email, riderStatus: rider.status },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Rider register error:", error);
    const errObj = error as { code?: number; message?: string };
    if (errObj?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "An account with this email or CNIC already exists." },
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

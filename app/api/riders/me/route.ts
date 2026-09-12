import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rider from "@/models/Rider";
import User from "@/models/User";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/riders/me -> the logged-in rider's own profile
// Used by RiderDashboard/profile
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["rider"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  await connectDB();

  const rider = await Rider.findOne({ user: session.id }).populate("user", "fullName email phone");
  if (!rider) {
    return NextResponse.json({ success: false, message: "Rider profile not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: rider });
}

// PATCH /api/riders/me -> rider updates photo, phone, address, fullName, and online status
// (CNIC, email, and approval status remain strictly protected and cannot be modified)
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request, ["rider"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const body = await request.json();
    const { fullName, phone, address, profileImage, online } = body as {
      fullName?: string;
      phone?: string;
      address?: string;
      profileImage?: string;
      online?: boolean;
    };

    await connectDB();

    // 1. Update User fields (fullName, phone)
    const userUpdates: Record<string, unknown> = {};
    if (fullName !== undefined && fullName.trim().length >= 2) {
      userUpdates.fullName = fullName.trim();
    }
    if (phone !== undefined) {
      userUpdates.phone = phone.trim();
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(session.id, userUpdates, {
        runValidators: true,
      });
    }

    // 2. Update Rider fields (address, profileImage, online)
    const riderUpdates: Record<string, unknown> = {};
    if (address !== undefined && address.trim().length >= 3) {
      riderUpdates.address = address.trim();
    }
    if (profileImage !== undefined) {
      riderUpdates.profileImage = profileImage;
    }
    if (online !== undefined) {
      riderUpdates.online = Boolean(online);
    }

    const rider = await Rider.findOneAndUpdate({ user: session.id }, riderUpdates, {
      new: true,
      runValidators: true,
    }).populate("user", "fullName email phone");

    if (!rider) {
      return NextResponse.json({ success: false, message: "Rider profile not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully.", data: rider });
  } catch (error) {
    console.error("Update rider profile error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}


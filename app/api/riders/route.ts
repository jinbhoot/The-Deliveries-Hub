import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rider from "@/models/Rider";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/riders -> admin only, list every rider with their linked account info
// Used by adminDashboard/rider
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  await connectDB();

  const riders = await Rider.find()
    .populate("user", "fullName email phone createdAt")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: riders });
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/clients -> admin only, list all client accounts
// Used by adminDashboard/clients
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  await connectDB();

  const clients = await User.find({ role: "client" }).sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: clients });
}

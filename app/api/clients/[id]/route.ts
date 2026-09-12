import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/clients/:id -> admin only, client profile + their full order history
// Used by adminDashboard/clients/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await connectDB();

  const client = await User.findOne({ _id: id, role: "client" });
  if (!client) {
    return NextResponse.json({ success: false, message: "Client not found." }, { status: 404 });
  }

  const orders = await Order.find({ customer: id }).sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: { client, orders } });
}

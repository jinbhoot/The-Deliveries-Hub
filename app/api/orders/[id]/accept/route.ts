import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/apiAuth";

// POST /api/orders/:id/accept -> rider only
// Uses findOneAndUpdate with a condition on the CURRENT state (status "Placed"
// AND rider null) so that if two riders tap "Accept" at the same moment, only
// one update actually succeeds — MongoDB handles this atomically. The loser
// gets a clean "already taken" response instead of silently overwriting data.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["rider"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const { id } = await params;
    await connectDB();

    const order = await Order.findOneAndUpdate(
      { _id: id, status: "Placed", rider: null },
      { $set: { rider: session.id, status: "Accepted", billStatus: "Requested" } },
      { new: true }
    );


    if (!order) {
      return NextResponse.json(
        { success: false, message: "This order was already accepted by another rider." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, message: "Order accepted.", data: order });
  } catch (error) {
    console.error("Accept order error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

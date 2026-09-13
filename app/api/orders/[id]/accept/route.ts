import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notifications";

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

    // Trigger Notification to Customer
    const shortCode = id.slice(-6).toUpperCase();
    await createNotification({
      recipient: order.customer,
      sender: session.id,
      type: "ORDER_ACCEPTED",
      title: "🛵 Rider Accepted Your Order!",
      message: `Rider ${session.fullName || "A rider"} has accepted order #${shortCode} and is heading to the store.`,
      link: `/ClientDashboard/myorders?id=${id}`,
      orderId: id,
    });

    // Also trigger Payment Requested notification since billStatus is set to Requested
    await createNotification({
      recipient: order.customer,
      sender: session.id,
      type: "PAYMENT_REQUESTED",
      title: "💳 Payment Requested",
      message: `Rider requested bill payment of PKR ${order.totalAmount} for order #${shortCode}. Please complete payment online or select Cash on Delivery.`,
      link: `/ClientDashboard/payment?orderId=${id}`,
      orderId: id,
    });

    return NextResponse.json({ success: true, message: "Order accepted.", data: order });
  } catch (error) {
    console.error("Accept order error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/apiAuth";
import { calculateRevenueSplit } from "@/lib/revenue";
import { createNotification } from "@/lib/notifications";

// GET /api/payments -> client sees their own, admin sees all
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["client", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  await connectDB();

  const filter = session.role === "client" ? { customer: session.id } : {};

  const payments = await Payment.find(filter)
    .populate({
      path: "order",
      select: "subtotal deliveryFee totalAmount status rider riderEarnings adminCommission deliveryAddress",
      populate: { path: "rider", select: "fullName email phone" },
    })
    .populate("customer", "fullName email phone")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: payments });
}

// POST /api/payments -> client only, records a payment for an order
// (COD payments are created automatically when the order is marked Delivered.)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["client"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const { orderId, amount, method, stripePaymentIntentId, currency } = (await request.json()) as {
      orderId?: string;
      amount?: number;
      method?: "COD" | "Card";
      stripePaymentIntentId?: string;
      currency?: string;
    };

    if (!orderId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Order and a valid amount are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const existingOrder = await Order.findById(orderId);
    const orderSubtotal = existingOrder?.subtotal || Math.max(0, amount - (existingOrder?.deliveryFee || 0));
    const orderDeliveryFee = existingOrder?.deliveryFee || 0;

    const split = calculateRevenueSplit(orderSubtotal, orderDeliveryFee, amount);

    const payment = await Payment.findOneAndUpdate(
      { order: orderId },
      {
        order: orderId,
        customer: session.id,
        amount,
        subtotal: split.subtotal,
        deliveryFee: split.deliveryFee,
        riderEarnings: split.riderEarnings,
        adminCommission: split.adminCommission,
        currency: currency || (process.env.STRIPE_CURRENCY || "pkr").toLowerCase(),
        method: method === "Card" ? "Card" : "COD",
        status: "Paid",
        stripePaymentIntentId: stripePaymentIntentId || null,
      },
      { upsert: true, new: true }
    );

    // Synchronize Order model so isPaid and billStatus reflect immediately
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        isPaid: true,
        billStatus: "Paid",
        subtotal: split.subtotal,
        deliveryFee: split.deliveryFee,
        riderEarnings: split.riderEarnings,
        adminCommission: split.adminCommission,
      },
    });

    const shortCode = orderId.slice(-6).toUpperCase();

    // 1. Notify Rider if order has an assigned rider
    if (existingOrder?.rider) {
      await createNotification({
        recipient: existingOrder.rider,
        sender: session.id,
        type: "PAYMENT_RECEIVED",
        title: "💰 Payment Received!",
        message: `Online payment of PKR ${amount} confirmed for order #${shortCode}. Your earnings: PKR ${split.riderEarnings}. You can now proceed to pick up and deliver.`,
        link: `/RiderDashboard/myorders`,
        orderId,
      });
    }

    // 2. Notify Client
    await createNotification({
      recipient: session.id,
      type: "PAYMENT_RECEIVED",
      title: "✅ Payment Confirmed",
      message: `Your payment of PKR ${amount} for order #${shortCode} has been confirmed. Rider will deliver your order soon.`,
      link: `/ClientDashboard/myorders?id=${orderId}`,
      orderId,
    });

    return NextResponse.json(
      { success: true, message: "Payment recorded successfully.", data: payment },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/apiAuth";
import { calculateDeliveryCharges } from "@/lib/deliveryCharges";
import { calculateRevenueSplit } from "@/lib/revenue";
import { createNotification } from "@/lib/notifications";

// GET /api/orders -> role-scoped list
//   client -> only their own orders
//   rider  -> orders assigned to them + unassigned "Placed" orders to pick up
//   admin  -> every order
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["client", "rider", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  await connectDB();

  let filter = {};
  if (session.role === "client") {
    filter = { customer: session.id };
  } else if (session.role === "rider") {
    const scope = request.nextUrl.searchParams.get("scope"); // "available" | "mine"
    filter =
      scope === "available"
        ? { status: "Placed", rider: null }
        : { rider: session.id };
  }
  // admin -> no filter, sees everything

  const orders = await Order.find(filter)
    .populate("customer", "fullName email phone")
    .populate("rider", "fullName email phone")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: orders });
}

// POST /api/orders -> client only, creates an order from their cart/checkout
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["client"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const body = await request.json();
    const { items, deliveryAddress, paymentMethod, categoryCount } = body as {
      items?: { item: string; name: string; price: number; quantity: number }[];
      deliveryAddress?: string;
      paymentMethod?: "Card" | "COD";
      categoryCount?: number;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Your cart is empty." },
        { status: 400 }
      );
    }
    if (!deliveryAddress || deliveryAddress.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Please provide a complete delivery address." },
        { status: 400 }
      );
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
    const totalQuantity = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const diffCategories = Math.max(1, categoryCount || 1);

    const calc = calculateDeliveryCharges(subtotal, totalQuantity, diffCategories);
    const split = calculateRevenueSplit(calc.subtotal, calc.totalDeliveryCharges, calc.finalBill);

    await connectDB();

    const order = await Order.create({
      customer: session.id,
      items,
      subtotal: calc.subtotal,
      deliveryFee: calc.totalDeliveryCharges,
      totalAmount: calc.finalBill,
      riderEarnings: split.riderEarnings,
      adminCommission: split.adminCommission,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod: paymentMethod === "COD" ? "COD" : "Card",
      status: "Placed",
      billStatus: "Pending",
    });

    const shortCode = order._id.toString().slice(-6).toUpperCase();
    await createNotification({
      recipient: session.id,
      type: "NEW_ORDER",
      title: "📦 Order Placed Successfully!",
      message: `Your order #${shortCode} for PKR ${calc.finalBill} was placed. Waiting for a nearby rider to accept.`,
      link: `/ClientDashboard/myorders?id=${order._id}`,
      orderId: order._id,
    });

    return NextResponse.json(
      { success: true, message: "Order placed successfully.", data: order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/apiAuth";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["client"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const { orderId } = (await request.json()) as { orderId?: string };

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    if (order.customer.toString() !== session.id) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to pay for this order." },
        { status: 403 }
      );
    }

    if (order.isPaid) {
      return NextResponse.json(
        { success: false, message: "This order has already been paid." },
        { status: 400 }
      );
    }

    const currency = (process.env.STRIPE_CURRENCY || "pkr").toLowerCase();
    // Stripe expects amounts in smallest unit (e.g., Paisa for PKR / Cents for USD)
    const amountInSmallestUnit = Math.round((order.totalAmount || 0) * 100);

    if (amountInSmallestUnit <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order amount for payment." },
        { status: 400 }
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order._id.toString(),
        customerId: session.id,
      },
      description: `Deliveries Hub Order #${order._id.toString().slice(-6).toUpperCase()}`,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.totalAmount,
      currency,
    });
  } catch (error: unknown) {
    console.error("Stripe create-payment-intent error:", error);
    const message = error instanceof Error ? error.message : "Failed to initialize Stripe payment. Please check your Stripe keys.";
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

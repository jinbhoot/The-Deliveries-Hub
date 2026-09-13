import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order, { ORDER_STATUS_FLOW, type OrderStatus } from "@/models/Order";
import Payment from "@/models/Payment";
import { requireAuth } from "@/lib/apiAuth";
import { calculateRevenueSplit } from "@/lib/revenue";
import { createNotification } from "@/lib/notifications";

// GET /api/orders/:id -> owner (client), assigned rider, or admin
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["client", "rider", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  const { id } = await params;
  await connectDB();

  const order = await Order.findById(id)
    .populate("customer", "fullName email phone")
    .populate("rider", "fullName email phone");


  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
  }

  const isOwner = session.role === "client" && String(order.customer._id) === session.id;
  const isAssignedRider = session.role === "rider" && order.rider && String(order.rider._id) === session.id;
  const isAdmin = session.role === "admin";

  if (!isOwner && !isAssignedRider && !isAdmin) {
    return NextResponse.json({ success: false, message: "You cannot view this order." }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: order });
}

// PATCH /api/orders/:id -> move order to the next status or update bill notification
//   rider -> Accepted -> Picked Up -> On the way -> Delivered (only on their own order)
//   admin -> can also Cancel
// Auto-creates a Payment record (Paid) when a COD order becomes "Delivered".
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["rider", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, billStatus } = body as { status?: OrderStatus; billStatus?: "Pending" | "Requested" | "Paid" };

    if (!status && !billStatus) {
      return NextResponse.json({ success: false, message: "New status or billStatus is required." }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (session.role === "rider" && String(order.rider) !== session.id) {
      return NextResponse.json(
        { success: false, message: "This order is not assigned to you." },
        { status: 403 }
      );
    }

    const shortCode = String(order._id).slice(-6).toUpperCase();

    if (billStatus) {
      order.billStatus = billStatus;
      if (billStatus === "Requested") {
        await createNotification({
          recipient: order.customer,
          sender: session.id,
          type: "PAYMENT_REQUESTED",
          title: "💳 Payment Requested",
          message: `Rider has requested bill payment of PKR ${order.totalAmount} for order #${shortCode}. Please complete payment online or via COD.`,
          link: `/ClientDashboard/payment?orderId=${id}`,
          orderId: id,
        });
      }
    }

    if (status) {
      const allowedNext = ORDER_STATUS_FLOW[order.status as OrderStatus] || [];
      if (!allowedNext.includes(status)) {
        return NextResponse.json(
          { success: false, message: `Cannot move an order from "${order.status}" to "${status}".` },
          { status: 400 }
        );
      }

      // Rider cannot pick up or deliver an order until client's payment is received
      if (
        session.role === "rider" &&
        (status === "Picked Up" || status === "On the way" || status === "Delivered") &&
        !order.isPaid &&
        order.paymentMethod !== "COD"
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot advance status. Client payment has not been received yet. Please wait for client payment.",
          },
          { status: 400 }
        );
      }

      order.status = status;

      // Send status update notifications to customer
      if (status === "Picked Up") {
        await createNotification({
          recipient: order.customer,
          sender: session.id,
          type: "ORDER_PICKED_UP",
          title: "🛍️ Order Picked Up!",
          message: `Rider has picked up your items for order #${shortCode} from the store.`,
          link: `/ClientDashboard/myorders?id=${id}`,
          orderId: id,
        });
      } else if (status === "On the way") {
        await createNotification({
          recipient: order.customer,
          sender: session.id,
          type: "ORDER_ON_THE_WAY",
          title: "🚚 Order is On The Way!",
          message: `Rider is on the way with your order #${shortCode}. Please be available at the delivery location.`,
          link: `/ClientDashboard/myorders?id=${id}`,
          orderId: id,
        });
      } else if (status === "Delivered") {
        await createNotification({
          recipient: order.customer,
          sender: session.id,
          type: "ORDER_DELIVERED",
          title: "🎉 Order Delivered!",
          message: `Your order #${shortCode} has been successfully delivered. Thank you for using Deliveries Hub!`,
          link: `/ClientDashboard/myorders?id=${id}`,
          orderId: id,
        });
      } else if (status === "Cancelled") {
        await createNotification({
          recipient: order.customer,
          sender: session.id,
          type: "ORDER_CANCELLED",
          title: "❌ Order Cancelled",
          message: `Order #${shortCode} has been cancelled.`,
          link: `/ClientDashboard/myorders?id=${id}`,
          orderId: id,
        });
      }

      // Cash-on-delivery orders are marked paid automatically on delivery.
      if (status === "Delivered" && order.paymentMethod === "COD" && !order.isPaid) {
        const subtotal = order.subtotal || Math.max(0, order.totalAmount - (order.deliveryFee || 0));
        const deliveryFee = order.deliveryFee || 0;
        const split = calculateRevenueSplit(subtotal, deliveryFee, order.totalAmount);

        order.isPaid = true;
        order.billStatus = "Paid";
        order.subtotal = split.subtotal;
        order.deliveryFee = split.deliveryFee;
        order.riderEarnings = split.riderEarnings;
        order.adminCommission = split.adminCommission;

        await Payment.findOneAndUpdate(
          { order: order._id },
          {
            order: order._id,
            customer: order.customer,
            amount: order.totalAmount,
            subtotal: split.subtotal,
            deliveryFee: split.deliveryFee,
            riderEarnings: split.riderEarnings,
            adminCommission: split.adminCommission,
            method: "COD",
            status: "Paid",
          },
          { upsert: true, new: true }
        );

        // Notify Rider about COD collection
        if (order.rider) {
          await createNotification({
            recipient: order.rider,
            type: "PAYMENT_RECEIVED",
            title: "💰 COD Payment Collected",
            message: `COD Payment of PKR ${order.totalAmount} recorded for order #${shortCode}. Your earnings: PKR ${split.riderEarnings}.`,
            link: `/RiderDashboard/myorders`,
            orderId: id,
          });
        }
      }
    }

    await order.save();

    return NextResponse.json({ success: true, message: "Order updated successfully.", data: order });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}


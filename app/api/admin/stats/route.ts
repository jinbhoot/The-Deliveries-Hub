import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Rider from "@/models/Rider";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Report from "@/models/Report";
import { requireAuth } from "@/lib/apiAuth";
import { calculateRevenueSplit } from "@/lib/revenue";

// GET /api/admin/stats -> admin only, aggregate numbers for the dashboard home page
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  await connectDB();

  const [totalClients, totalRiders, pendingRiders, totalOrders, activeOrders, paymentAgg, pendingReports] =
    await Promise.all([
      User.countDocuments({ role: "client" }),
      Rider.countDocuments({ status: "Approved" }),
      Rider.countDocuments({ status: "Pending" }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $nin: ["Delivered", "Cancelled"] } }),
      Payment.aggregate([
        { $match: { status: "Paid" } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalSubtotal: { $sum: "$subtotal" },
            totalDeliveryFee: { $sum: "$deliveryFee" },
            totalAdminCommission: { $sum: "$adminCommission" },
            totalRiderEarnings: { $sum: "$riderEarnings" },
          },
        },
      ]),
      Report.countDocuments({ status: { $ne: "Resolved" } }),
    ]);

  const agg = paymentAgg[0] || {};
  const totalRevenue = agg.totalAmount ?? 0;
  const totalDeliveryFee = agg.totalDeliveryFee ?? 0;
  const totalBaseBill = agg.totalSubtotal ?? Math.max(0, totalRevenue - totalDeliveryFee);

  let adminRevenue = agg.totalAdminCommission ?? 0;
  let riderPayouts = agg.totalRiderEarnings ?? 0;

  if (adminRevenue === 0 && riderPayouts === 0 && totalDeliveryFee > 0) {
    const split = calculateRevenueSplit(totalBaseBill, totalDeliveryFee, totalRevenue);
    adminRevenue = split.adminCommission;
    riderPayouts = split.riderEarnings;
  }

  return NextResponse.json({
    success: true,
    data: {
      totalClients,
      totalRiders,
      pendingRiders,
      totalOrders,
      activeOrders,
      totalRevenue,
      totalBaseBill,
      totalDeliveryFee,
      adminRevenue,
      riderPayouts,
      pendingReports,
    },
  });
}

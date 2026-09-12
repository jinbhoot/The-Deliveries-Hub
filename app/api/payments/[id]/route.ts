import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import { requireAuth } from "@/lib/apiAuth";

// PATCH /api/payments/:id -> admin only, e.g. mark a failed payment as resolved
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const { status } = (await request.json()) as { status?: "Pending" | "Paid" | "Failed" };

    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required." }, { status: 400 });
    }

    await connectDB();

    const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Payment updated.", data: payment });
  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

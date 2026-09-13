import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rider from "@/models/Rider";
import { requireAuth } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notifications";

// PATCH /api/riders/:id -> admin only, approve or block a rider
// Body: { status: "Approved" | "Blocked" | "Pending" }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const { status } = (await request.json()) as { status?: "Pending" | "Approved" | "Blocked" };

    if (!status || !["Pending", "Approved", "Blocked"].includes(status)) {
      return NextResponse.json({ success: false, message: "A valid status is required." }, { status: 400 });
    }

    await connectDB();

    const rider = await Rider.findByIdAndUpdate(id, { status }, { new: true }).populate(
      "user",
      "fullName email"
    );

    if (!rider) {
      return NextResponse.json({ success: false, message: "Rider not found." }, { status: 404 });
    }

    // Trigger notification to Rider
    if (rider.user) {
      const riderUserId = typeof rider.user === "object" ? rider.user._id : rider.user;
      if (status === "Approved") {
        await createNotification({
          recipient: riderUserId,
          type: "RIDER_APPROVED",
          title: "🎉 Rider Application Approved!",
          message: "Congratulations! Your rider account has been approved by the Admin. You can now go online and accept delivery orders.",
          link: "/RiderDashboard",
        });
      } else if (status === "Blocked") {
        await createNotification({
          recipient: riderUserId,
          type: "RIDER_BLOCKED",
          title: "⚠️ Account Restricted",
          message: "Your rider account has been temporarily restricted by the Admin. Please contact support for more details.",
          link: "/contact",
        });
      }
    }

    return NextResponse.json({ success: true, message: `Rider marked as ${status}.`, data: rider });
  } catch (error) {
    console.error("Update rider error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

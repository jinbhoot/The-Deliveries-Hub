import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/notifications -> returns recent notifications & unread count for current user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["client", "rider", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    await connectDB();

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: session.id })
        .sort({ createdAt: -1 })
        .limit(30)
        .populate("sender", "fullName email role")
        .lean(),
      Notification.countDocuments({ recipient: session.id, read: false }),
    ]);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Could not fetch notifications." },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications -> mark all notifications as read for current user
export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request, ["client", "rider", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    await connectDB();

    await Notification.updateMany(
      { recipient: session.id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return NextResponse.json(
      { success: false, message: "Could not update notifications." },
      { status: 500 }
    );
  }
}


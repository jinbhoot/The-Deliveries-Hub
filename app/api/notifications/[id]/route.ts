import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/apiAuth";

// PATCH /api/notifications/:id -> mark single notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, ["client", "rider", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const { id } = await params;
    await connectDB();

    const notif = await Notification.findOneAndUpdate(
      { _id: id, recipient: session.id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notif) {
      return NextResponse.json(
        { success: false, message: "Notification not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read.",
      data: notif,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { success: false, message: "Could not update notification." },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/:id -> delete a notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, ["client", "rider", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const { id } = await params;
    await connectDB();

    const notif = await Notification.findOneAndDelete({
      _id: id,
      recipient: session.id,
    });

    if (!notif) {
      return NextResponse.json(
        { success: false, message: "Notification not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted.",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json(
      { success: false, message: "Could not delete notification." },
      { status: 500 }
    );
  }
}


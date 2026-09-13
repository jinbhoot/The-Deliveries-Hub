import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import { requireAuth } from "@/lib/apiAuth";
import mongoose from "mongoose";

// POST /api/notifications/subscribe -> Register or update a browser push subscription
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["client", "rider", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { success: false, message: "Invalid push subscription object" },
        { status: 400 }
      );
    }

    await connectDB();

    // Upsert subscription: match by endpoint
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        user: new mongoose.Types.ObjectId(session.id),
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Push notification subscription saved successfully.",
    });
  } catch (error) {
    console.error("Save push subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save push subscription." },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/subscribe -> Remove push subscription
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request, ["client", "rider", "admin"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, message: "Endpoint required" },
        { status: 400 }
      );
    }

    await connectDB();
    await PushSubscription.deleteOne({ endpoint });

    return NextResponse.json({
      success: true,
      message: "Push notification subscription removed.",
    });
  } catch (error) {
    console.error("Delete push subscription error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete push subscription." },
      { status: 500 }
    );
  }
}

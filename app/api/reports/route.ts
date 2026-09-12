import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/reports -> client sees their own, admin sees all
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["client", "admin"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  await connectDB();

  const filter = session.role === "client" ? { customer: session.id } : {};

  const reports = await Report.find(filter)
    .populate("customer", "fullName email")
    .populate("order", "totalAmount status")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: reports });
}

// POST /api/reports -> client only (used by ClientDashboard/Report)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["client"]);
  if ("error" in auth) return auth.error;
  const { session } = auth;

  try {
    const { subject, message, orderId } = (await request.json()) as {
      subject?: string;
      message?: string;
      orderId?: string;
    };

    if (!subject || subject.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Subject must be at least 3 characters." },
        { status: 400 }
      );
    }
    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "Message must be at least 5 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const report = await Report.create({
      customer: session.id,
      order: orderId || null,
      subject: subject.trim(),
      message: message.trim(),
    });

    return NextResponse.json(
      { success: true, message: "Report submitted. Our team will review it shortly.", data: report },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { requireAuth } from "@/lib/apiAuth";

// PATCH /api/reports/:id -> admin only (used by adminDashboard/reports/[id])
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const { status } = (await request.json()) as { status?: "Open" | "In Review" | "Resolved" };

    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required." }, { status: 400 });
    }

    await connectDB();

    const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
    if (!report) {
      return NextResponse.json({ success: false, message: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Report updated.", data: report });
  } catch (error) {
    console.error("Update report error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

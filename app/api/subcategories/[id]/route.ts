import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subcategory from "@/models/Subcategory";
import Item from "@/models/Item";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/subcategories/:id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    const subcategory = await Subcategory.findById(id).populate("category", "name");
    if (!subcategory) {
      return NextResponse.json({ success: false, message: "Subcategory not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subcategory });
  } catch (error) {
    console.error("Get subcategory error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// PATCH /api/subcategories/:id -> admin only
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category } = body as { name?: string; category?: string };

    const updates: Record<string, unknown> = {};
    if (name && name.trim().length >= 2) updates.name = name.trim();
    if (category) updates.category = category;

    await connectDB();

    const updated = await Subcategory.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    if (!updated) {
      return NextResponse.json({ success: false, message: "Subcategory not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Subcategory updated.", data: updated });
  } catch (error) {
    console.error("Update subcategory error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// DELETE /api/subcategories/:id -> admin only
// Cascade deletes only its nested items, leaving the parent category untouched
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    await connectDB();

    // 1. Delete all nested items belonging to this subcategory
    await Item.deleteMany({ subcategory: id });

    // 2. Delete the subcategory itself
    const deleted = await Subcategory.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Subcategory not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Subcategory and its nested items were deleted successfully.",
    });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

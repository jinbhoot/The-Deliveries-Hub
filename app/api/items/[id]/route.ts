import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { requireAuth } from "@/lib/apiAuth";

// PATCH /api/items/:id -> admin only (edit price, stock, etc.)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const updates = await request.json();

    await connectDB();

    const item = await Item.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Item updated.", data: item });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// DELETE /api/items/:id -> admin only
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    await connectDB();

    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Item deleted." });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

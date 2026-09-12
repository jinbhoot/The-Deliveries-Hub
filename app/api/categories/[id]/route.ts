import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Subcategory from "@/models/Subcategory";
import Item from "@/models/Item";
import { requireAuth } from "@/lib/apiAuth";

// DELETE /api/categories/:id -> admin only
// Cascade deletes all subcategories and nested items associated with this category
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    await connectDB();

    // 1. Find all subcategories belonging to this category
    const subcategories = await Subcategory.find({ category: id }).select("_id");
    const subcategoryIds = subcategories.map((s) => s._id);

    // 2. Cascade delete all items belonging to this category or its subcategories
    await Item.deleteMany({
      $or: [
        { category: id },
        { subcategory: { $in: subcategoryIds } },
      ],
    });

    // 3. Cascade delete all subcategories belonging to this category
    await Subcategory.deleteMany({ category: id });

    // 4. Delete the category itself
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Category and all associated subcategories & items were deleted successfully.",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}


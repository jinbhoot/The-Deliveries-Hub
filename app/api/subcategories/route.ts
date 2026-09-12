import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Subcategory from "@/models/Subcategory";
import Category from "@/models/Category";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/subcategories -> public / all authenticated users
// Optional query: ?category=categoryId
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const categoryId = request.nextUrl.searchParams.get("category");

    const filter: Record<string, unknown> = {};
    if (categoryId) {
      filter.category = categoryId;
    }

    const subcategories = await Subcategory.find(filter)
      .populate("category", "name")
      .sort({ name: 1 });

    return NextResponse.json({ success: true, data: subcategories });
  } catch (error) {
    console.error("Fetch subcategories error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// POST /api/subcategories -> admin only
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { name, category } = (await request.json()) as { name?: string; category?: string };

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Subcategory name must be at least 2 characters." },
        { status: 400 }
      );
    }
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Parent category is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const parentCat = await Category.findById(category);
    if (!parentCat) {
      return NextResponse.json(
        { success: false, message: "Parent category not found." },
        { status: 404 }
      );
    }

    const existing = await Subcategory.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      category,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A subcategory with this name already exists in this category." },
        { status: 409 }
      );
    }

    const subcategory = await Subcategory.create({
      name: name.trim(),
      category,
    });

    const populated = await Subcategory.findById(subcategory._id).populate("category", "name");

    return NextResponse.json(
      { success: true, message: "Subcategory created.", data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create subcategory error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

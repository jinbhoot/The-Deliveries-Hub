import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/categories -> any logged-in user (used by catalog + admin dropdown)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  await connectDB();
  const categories = await Category.find().sort({ name: 1 });

  return NextResponse.json({ success: true, data: categories });
}

// POST /api/categories -> admin only (used by adminDashboard/addCatagory)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const { name } = (await request.json()) as { name?: string };

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Category name must be at least 2 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "This category already exists." },
        { status: 409 }
      );
    }

    const category = await Category.create({ name: name.trim() });

    return NextResponse.json(
      { success: true, message: "Category created.", data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Item from "@/models/Item";
import { requireAuth } from "@/lib/apiAuth";

// GET /api/items -> any logged-in user. Optional ?category=<id>&subcategory=<id> filter.
// Used by ClientDashboard catalog and adminDashboard/Item.
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  await connectDB();

  const categoryId = request.nextUrl.searchParams.get("category");
  const subcategoryId = request.nextUrl.searchParams.get("subcategory");

  const filter: Record<string, unknown> = {};
  if (categoryId) filter.category = categoryId;
  if (subcategoryId) filter.subcategory = subcategoryId;

  const items = await Item.find(filter)
    .populate("category", "name")
    .populate("subcategory", "name")
    .sort({ createdAt: -1 });

  return NextResponse.json({ success: true, data: items });
}

// POST /api/items -> admin only
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const { name, category, subcategory, price, image, description, inStock } = body as {
      name?: string;
      category?: string;
      subcategory?: string | null;
      price?: number;
      image?: string;
      description?: string;
      inStock?: boolean;
    };

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Item name must be at least 2 characters." },
        { status: 400 }
      );
    }
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category is required." },
        { status: 400 }
      );
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { success: false, message: "Price must be a positive number." },
        { status: 400 }
      );
    }

    await connectDB();

    const item = await Item.create({
      name: name.trim(),
      category,
      subcategory: subcategory || null,
      price,
      image: image || "",
      description: description || "",
      inStock: inStock !== undefined ? Boolean(inStock) : true,
    });

    const populated = await Item.findById(item._id)
      .populate("category", "name")
      .populate("subcategory", "name");

    return NextResponse.json(
      { success: true, message: "Item added.", data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}


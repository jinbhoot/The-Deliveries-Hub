"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type CategoryItem = {
  _id: string;
  name: string;
};

type SubcategoryItem = {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
};

type ItemRecord = {
  _id: string;
  name: string;
  category?: {
    _id: string;
    name: string;
  } | string;
  subcategory?: {
    _id: string;
    name: string;
  } | string | null;
  price: number;
  image?: string;
  description?: string;
  inStock: boolean;
  createdAt: string;
};

const PHOTO_PRESETS = [
  { label: "🍔 Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=180&auto=format&fit=crop&q=50" },
  { label: "🍕 Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=180&auto=format&fit=crop&q=50" },
  { label: "🍟 Fries", url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=180&auto=format&fit=crop&q=50" },
  { label: "🍛 Biryani", url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=180&auto=format&fit=crop&q=50" },
  { label: "🍲 Karahi", url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=180&auto=format&fit=crop&q=50" },
  { label: "🍢 Kabab", url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=180&auto=format&fit=crop&q=50" },
  { label: "🍜 Chow Mein", url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=180&auto=format&fit=crop&q=50" },
  { label: "🥡 Kung Pao", url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=180&auto=format&fit=crop&q=50" },
  { label: "🥟 Dumplings", url: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=180&auto=format&fit=crop&q=50" },
  { label: "💊 Panadol / Meds", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=180&auto=format&fit=crop&q=50" },
  { label: "🧴 Syrup", url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=180&auto=format&fit=crop&q=50" },
  { label: "🩹 First Aid", url: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=180&auto=format&fit=crop&q=50" },
  { label: "🍾 Cooking Oil", url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=180&auto=format&fit=crop&q=50" },
  { label: "🌾 Rice", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=180&auto=format&fit=crop&q=50" },
  { label: "🥔 Chips", url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=180&auto=format&fit=crop&q=50" },
  { label: "🥤 Drinks", url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=180&auto=format&fit=crop&q=50" },
  { label: "🥛 Milk", url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=180&auto=format&fit=crop&q=50" },
];

export default function ManageItemsPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [inStock, setInStock] = useState(true);

  // Filter state for catalog list
  const [filterCat, setFilterCat] = useState("all");
  const [filterSubcat, setFilterSubcat] = useState("all");

  // Action states
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, subsRes, itemsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/subcategories"),
        fetch("/api/items"),
      ]);

      const [catsData, subsData, itemsData] = await Promise.all([
        catsRes.json(),
        subsRes.json(),
        itemsRes.json(),
      ]);

      if (catsRes.ok && catsData.success && Array.isArray(catsData.data)) {
        setCategories(catsData.data);
        if (!selectedCategory && catsData.data.length > 0) {
          setSelectedCategory(catsData.data[0]._id);
        }
      }
      if (subsRes.ok && subsData.success && Array.isArray(subsData.data)) {
        setSubcategories(subsData.data);
      }
      if (itemsRes.ok && itemsData.success && Array.isArray(itemsData.data)) {
        setItems(itemsData.data);
      }
    } catch (err) {
      console.error("Manage items load error:", err);
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter subcategories for the selected category in the form
  const availableSubcategoriesForForm = subcategories.filter(
    (s) => s.category?._id === selectedCategory
  );

  // Handle local image file upload -> Base64
  function handleImageFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("Image file size should be less than 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setMessage("Image loaded successfully!");
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const numPrice = Number(price);
    if (!selectedCategory) {
      setError("Please select a main category.");
      return;
    }
    if (!name.trim()) {
      setError("Please provide an item name.");
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Please enter a valid price in PKR.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category: selectedCategory,
          subcategory: selectedSubcategory || null,
          price: numPrice,
          description: description.trim(),
          image: image.trim() || undefined,
          inStock,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create item.");
        setSubmitting(false);
        return;
      }

      setMessage(`Item "${name}" added to catalog with photo!`);
      // Reset form fields
      setName("");
      setPrice("");
      setDescription("");
      setImage("");
      setSelectedSubcategory("");
      setInStock(true);

      // Reload items
      loadData();
    } catch (err) {
      console.error("Create item error:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteItem(id: string, itemName: string) {

    if (!confirm(`Are you sure you want to delete item "${itemName}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
        setMessage(`Item "${itemName}" was deleted.`);
      } else {
        setError(data.message || "Failed to delete item.");
      }
    } catch (err) {
      console.error("Delete item error:", err);
      setError("Network error deleting item.");
    } finally {
      setDeletingId(null);
    }
  }

  const getCategoryName = (item: ItemRecord) => {
    if (typeof item.category === "object" && item.category !== null) {
      return item.category.name;
    }
    const match = categories.find((c) => c._id === item.category);
    return match?.name || "General";
  };

  const getSubcategoryName = (item: ItemRecord) => {
    if (typeof item.subcategory === "object" && item.subcategory !== null) {
      return item.subcategory.name;
    }
    if (typeof item.subcategory === "string") {
      const match = subcategories.find((s) => s._id === item.subcategory);
      return match?.name || null;
    }
    return null;
  };

  // Filtered items list
  const displayedItems = items.filter((item) => {
    const catId = typeof item.category === "object" && item.category !== null ? item.category._id : item.category;
    const subId = typeof item.subcategory === "object" && item.subcategory !== null ? item.subcategory._id : item.subcategory;

    if (filterCat !== "all" && catId !== filterCat) return false;
    if (filterSubcat !== "all" && subId !== filterSubcat) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Catalog Items & Photos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload item pictures, assign categories/subcategories, set prices, and control stock.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Refresh All
        </button>
      </div>

      {(message || error) && (
        <div
          role="alert"
          className={`mb-6 flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm ${
            error ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          <p>{error || message}</p>
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setError(null);
            }}
            className="font-semibold"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Create Item Card */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-bold text-gray-900">Add New Catalog Item with Photo</h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Upload real images from your device or pick high-res presets.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Hierarchy: Category & Subcategory */}
          <div className="grid gap-4 md:grid-cols-2 bg-orange-50/40 border border-orange-100 p-4 rounded-xl">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-orange-900" htmlFor="item-category">
                1. Main Category
              </label>
              <select
                id="item-category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory("");
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-orange-900" htmlFor="item-subcategory">
                2. Subcategory (Optional)
              </label>
              <select
                id="item-subcategory"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
              >
                <option value="">General (No Subcategory)</option>
                {availableSubcategoriesForForm.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Item details */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-600" htmlFor="item-name">
                3. Item Name
              </label>
              <input
                id="item-name"
                type="text"
                required
                placeholder="e.g. Zinger Burger or Panadol 500mg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-600" htmlFor="item-price">
                4. Price (PKR)
              </label>
              <input
                id="item-price"
                type="number"
                min="0"
                step="1"
                required
                placeholder="e.g. 650"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-gray-600" htmlFor="item-desc">
                5. Provider / Description
              </label>
              <input
                id="item-desc"
                type="text"
                placeholder="e.g. KFC / 250ml / Official Store"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Image Upload & Presets Section */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
            <label className="block text-xs font-bold uppercase text-gray-700">
              6. Item Image (Upload File or Enter URL)
            </label>

            <div className="grid gap-4 md:grid-cols-12 items-start">
              {/* File Upload Button */}
              <div className="md:col-span-4">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-white rounded-xl p-4 cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition text-center"
                >
                  <span className="text-2xl mb-1">📷</span>
                  <span className="text-xs font-bold text-gray-800">Upload Image from Device</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP (Max 4MB)</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* URL input */}
              <div className="md:col-span-5 space-y-2">
                <input
                  id="item-image"
                  type="text"
                  placeholder="Or paste image URL (https://...)"
                  value={image.startsWith("data:image") ? "Uploaded file attached" : image}
                  disabled={image.startsWith("data:image")}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {/* Quick Presets Picker */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 mb-1">Or click a photo preset:</p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setImage(p.url)}
                        className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-800 transition"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="md:col-span-3 flex flex-col items-center justify-center border border-gray-200 bg-white rounded-xl p-2 h-32">
                {image ? (
                  <div className="relative h-full w-full flex flex-col items-center justify-center">
                    <img
                      src={image}
                      alt="Preview"
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-full object-cover rounded-lg"
                      onError={() => {
                        // ignore
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="mt-1 text-[10px] text-red-600 font-bold hover:underline"
                    >
                      ✕ Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <span className="text-xl block">🖼️</span>
                    <span className="text-[10px]">No photo selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="h-4 w-4 accent-orange-500 rounded"
              />
              <span className="text-sm font-semibold text-gray-800">In Stock and Available for Customers</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-orange-600 disabled:opacity-50 transition"
            >
              {submitting ? "Saving item..." : "Save Catalog Item"}
            </button>
          </div>
        </form>
      </section>

      {/* Catalog List */}
      <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
        <div className="border-b border-gray-100 px-6 py-4 flex flex-wrap justify-between items-center gap-3 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Catalog Items ({displayedItems.length} of {items.length})
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCat}
              onChange={(e) => {
                setFilterCat(e.target.value);
                setFilterSubcat("all");
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {filterCat !== "all" && (
              <select
                value={filterSubcat}
                onChange={(e) => setFilterSubcat(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none"
              >
                <option value="all">All Subcategories</option>
                {subcategories
                  .filter((s) => s.category?._id === filterCat)
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading catalog items...</div>
        ) : displayedItems.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500">
            No items match the selected filter.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {displayedItems.map((it) => {
              const subcatLabel = getSubcategoryName(it);

              return (
                <li
                  key={it._id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Thumbnail */}
                    <div className="h-14 w-14 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                      {it.image && (it.image.startsWith("http") || it.image.startsWith("data:image")) ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">{it.name}</span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                          {getCategoryName(it)}
                        </span>
                        {subcatLabel && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            📁 {subcatLabel}
                          </span>
                        )}
                        {!it.inStock && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {it.description || "No description"} ·{" "}
                        <span className="font-bold text-orange-600 text-sm">
                          PKR {it.price.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={deletingId === it._id}
                      onClick={() => deleteItem(it._id, it.name)}
                      className="rounded-lg bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition flex items-center gap-1"
                    >
                      {deletingId === it._id ? "..." : "🗑️ Delete Item"}
                    </button>
                  </div>

                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

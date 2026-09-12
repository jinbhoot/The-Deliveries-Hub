"use client";

import { FormEvent, useEffect, useState } from "react";

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

type ModalType = "addCategory" | "addSubcategory" | null;

const suggestedCategories = [
  "Food",
  "Medicine",
  "Grocery",
  "Beverages",
  "Bakery",
  "Fresh Fruits",
  "Pharmacy",
  "Personal Care",
];

const suggestedSubcategories: Record<string, string[]> = {
  Food: ["Fast Food", "Chinese Food", "Desi Food", "Italian", "Desserts", "BBQ"],
  Medicine: ["Syrups", "Tablets", "Injections", "Pain Relief", "Antibiotics", "Vitamins"],
  Grocery: ["Cooking Oil", "Kitchen Staples", "Snacks & Chips", "Beverages & Juices", "Dairy & Milk"],
};

export default function ManageCategoriesPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");

  // Data states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state for subcategories
  const [subcatFilter, setSubcatFilter] = useState<string>("all");

  // Modal & Form states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [categoryName, setCategoryName] = useState("");
  const [subcatName, setSubcatName] = useState("");
  const [subcatParentId, setSubcatParentId] = useState("");

  // Action states
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, subsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/subcategories"),
      ]);

      const [catsData, subsData] = await Promise.all([catsRes.json(), subsRes.json()]);

      if (catsRes.ok && catsData.success && Array.isArray(catsData.data)) {
        setCategories(catsData.data);
      }
      if (subsRes.ok && subsData.success && Array.isArray(subsData.data)) {
        setSubcategories(subsData.data);
      }
    } catch (err) {
      console.error("Load category data error:", err);
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function closeModal() {
    setModalType(null);
    setCategoryName("");
    setSubcatName("");
    setSubcatParentId("");
    setSubmitting(false);
  }

  // --- Category Actions ---
  async function handleAddCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = categoryName.trim();
    if (!cleanName) {
      setError("Please provide a category name.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create category.");
        setSubmitting(false);
        return;
      }

      setCategories((current) => [...current, data.data]);
      closeModal();
      setNotice(`Category "${cleanName}" created successfully.`);
    } catch (err) {
      console.error("Create category error:", err);
      setError("Network error creating category.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCategory(id: string, name: string) {
    if (
      !confirm(
        `⚠️ CASCADE DELETE WARNING:\n\nDeleting category "${name}" will AUTOMATICALLY DELETE all associated subcategories and their nested items!\n\nAre you sure you want to proceed?`
      )
    ) {
      return;
    }

    setDeletingId(id);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to delete category.");
        setDeletingId(null);
        return;
      }

      setCategories((current) => current.filter((cat) => cat._id !== id));
      setSubcategories((current) => current.filter((sub) => sub.category?._id !== id));
      setNotice(`Category "${name}" and all its subcategories & items were deleted.`);
    } catch (err) {
      console.error("Delete category error:", err);
      setError("Network error deleting category.");
    } finally {
      setDeletingId(null);
    }
  }

  // --- Subcategory Actions ---
  async function handleAddSubcategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = subcatName.trim();
    if (!cleanName) {
      setError("Please provide a subcategory name.");
      return;
    }
    if (!subcatParentId) {
      setError("Please select a parent category.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, category: subcatParentId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to create subcategory.");
        setSubmitting(false);
        return;
      }

      setSubcategories((current) => [...current, data.data]);
      closeModal();
      setNotice(`Subcategory "${cleanName}" created successfully.`);
    } catch (err) {
      console.error("Create subcategory error:", err);
      setError("Network error creating subcategory.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeSubcategory(id: string, name: string) {
    if (
      !confirm(
        `⚠️ DELETE SUBCATEGORY:\n\nDeleting subcategory "${name}" will remove all items nested under it.\n(The main category will remain untouched).\n\nProceed?`
      )
    ) {
      return;
    }

    setDeletingId(id);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to delete subcategory.");
        setDeletingId(null);
        return;
      }

      setSubcategories((current) => current.filter((sub) => sub._id !== id));
      setNotice(`Subcategory "${name}" and its nested items were deleted.`);
    } catch (err) {
      console.error("Delete subcategory error:", err);
      setError("Network error deleting subcategory.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredSubcategories =
    subcatFilter === "all"
      ? subcategories
      : subcategories.filter((s) => s.category?._id === subcatFilter);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories & Subcategories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Structure catalog taxonomy with automatic cascade deletion safeguards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setModalType("addCategory");
              setNotice(null);
              setError(null);
            }}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
          >
            + Add Main Category
          </button>
          <button
            type="button"
            onClick={() => {
              setModalType("addSubcategory");
              setSubcatParentId(categories[0]?._id || "");
              setNotice(null);
              setError(null);
            }}
            className="rounded-lg border border-orange-500 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition"
          >
            + Add Subcategory
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`border-b-2 px-6 py-3 text-sm font-bold transition ${
            activeTab === "categories"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Main Categories ({categories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subcategories")}
          className={`border-b-2 px-6 py-3 text-sm font-bold transition ${
            activeTab === "subcategories"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Subcategories ({subcategories.length})
        </button>
      </div>

      {/* Alerts */}
      {(notice || error) && (
        <div
          role="alert"
          className={`mb-6 flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm ${
            error ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          <p>{error || notice}</p>
          <button
            type="button"
            onClick={() => {
              setNotice(null);
              setError(null);
            }}
            className="font-semibold"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {/* TAB 1: MAIN CATEGORIES */}
      {activeTab === "categories" && (
        <section className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-base font-bold text-gray-900">Main Categories</h2>
              <p className="text-xs text-gray-500">
                Deleting a category will automatically cascade delete all its subcategories and items.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-500">
              No categories found. Click &ldquo;+ Add Main Category&rdquo; to create one.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {categories.map((category) => {
                const subCount = subcategories.filter(
                  (s) => s.category?._id === category._id || s.category?.name === category.name
                ).length;

                return (
                  <li
                    key={category._id}
                    className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{category.name}</h3>
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
                          {subCount} {subCount === 1 ? "subcategory" : "subcategories"}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">ID: {category._id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={deletingId === category._id}
                        onClick={() => removeCategory(category._id, category.name)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
                        title="Cascade delete this category and all its nested subcategories & items"
                      >
                        {deletingId === category._id ? "Deleting..." : "Delete (Cascade)"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* TAB 2: SUBCATEGORIES */}
      {activeTab === "subcategories" && (
        <section className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-gray-100 px-6 py-4 flex flex-wrap justify-between items-center gap-3 bg-gray-50/50">
            <div>
              <h2 className="text-base font-bold text-gray-900">Subcategories</h2>
              <p className="text-xs text-gray-500">
                Deleting a subcategory removes only its nested items (parent category remains intact).
              </p>
            </div>

            {/* Filter by parent category */}
            <div className="flex items-center gap-2">
              <label htmlFor="subcat-filter" className="text-xs font-bold text-gray-600">
                Parent:
              </label>
              <select
                id="subcat-filter"
                value={subcatFilter}
                onChange={(e) => setSubcatFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-orange-500"
              >
                <option value="all">All Categories ({subcategories.length})</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading subcategories...</div>
          ) : filteredSubcategories.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-500">
              No subcategories found for the selected category.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredSubcategories.map((subcat) => (
                <li
                  key={subcat._id}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base">{subcat.name}</h3>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        📁 {subcat.category?.name || "Main Category"}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">ID: {subcat._id}</p>
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === subcat._id}
                    onClick={() => removeSubcategory(subcat._id, subcat.name)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
                    title="Delete subcategory and its items"
                  >
                    {deletingId === subcat._id ? "Deleting..." : "Delete Subcategory"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* MODAL 1: ADD MAIN CATEGORY */}
      {modalType === "addCategory" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Add Main Category</h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-xl text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleAddCategory} noValidate>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-600" htmlFor="cat-name">
                  Category Name
                </label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  placeholder="e.g. Food, Medicine, Grocery"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1.5">Quick suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedCategories.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCategoryName(s)}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-800 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* MODAL 2: ADD SUBCATEGORY */}
      {modalType === "addSubcategory" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900">Add Subcategory</h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-xl text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleAddSubcategory} noValidate>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-600" htmlFor="subcat-parent">
                  1. Parent Category
                </label>
                <select
                  id="subcat-parent"
                  value={subcatParentId}
                  onChange={(e) => setSubcatParentId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-600" htmlFor="subcat-name-input">
                  2. Subcategory Name
                </label>
                <input
                  id="subcat-name-input"
                  type="text"
                  required
                  placeholder="e.g. Fast Food, Tablets, Cooking Oil"
                  value={subcatName}
                  onChange={(e) => setSubcatName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Suggestions for chosen category */}
              {(() => {
                const parent = categories.find((c) => c._id === subcatParentId);
                const list = parent ? suggestedSubcategories[parent.name] : null;
                if (!list) return null;

                return (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5">
                      Suggested for {parent?.name}:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSubcatName(s)}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-800 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Subcategory"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

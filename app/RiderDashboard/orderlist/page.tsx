"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OrderCard, { type RiderOrder } from "../order-card";

export default function OrderListPage() {
  const [availableOrders, setAvailableOrders] = useState<RiderOrder[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      // 1. Load available orders
      const res = await fetch("/api/orders?scope=available");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setAvailableOrders(data.data);
      } else {
        setError(data.message || "Failed to load available orders.");
      }

      // 2. Load rider's current active orders to check the 2-order limit
      const myRes = await fetch("/api/orders", { cache: "no-store" });
      const myData = await myRes.json();
      if (myRes.ok && myData.success && Array.isArray(myData.data)) {
        const inProgress = myData.data.filter(
          (o: RiderOrder) =>
            o.status === "Accepted" || o.status === "Picked Up" || o.status === "On the way"
        );
        setActiveCount(inProgress.length);
      }
    } catch (err) {
      console.error("Error loading order list data:", err);
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function acceptOrder(id: string) {
    if (activeCount >= 2) {
      setError(
        "You cannot accept more than 2 active orders at the same time. Please complete or deliver your existing orders first."
      );
      return;
    }

    setAcceptingId(id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/orders/${id}/accept`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to accept order.");
        setAcceptingId(null);
        loadData();
        return;
      }

      setSuccess("Order accepted! Moved to your active deliveries.");
      setAvailableOrders((prev) => prev.filter((o) => o._id !== id));
      setActiveCount((prev) => prev + 1);
    } catch (err) {
      console.error("Accept order error:", err);
      setError("Network error. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  }

  function rejectOrder(id: string) {
    setAvailableOrders((prev) => prev.filter((o) => o._id !== id));
  }

  const isLimitReached = activeCount >= 2;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Order List</h1>
          <p className="mt-1 text-orange-100">
            Review available delivery requests and choose orders to deliver.
          </p>
        </div>

        {/* Active Capacity Badge */}
        <div
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black shadow-sm ${
            isLimitReached
              ? "bg-red-500 text-white border border-red-300 animate-pulse"
              : "bg-white text-orange-600 border border-orange-200"
          }`}
        >
          <span>🛵 Active Load: {activeCount} / 2</span>
          {isLimitReached && <span className="uppercase text-[10px] tracking-wider font-extrabold">(Limit Reached)</span>}
        </div>
      </div>

      {/* Capacity Warning Banner */}
      {isLimitReached && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-500 text-white p-4 shadow-md">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            <span className="text-xl">⚠️</span>
            <span>
              <strong>Active Orders Limit Reached (2/2):</strong> You already have 2 deliveries in progress. You must deliver or cancel existing orders before accepting more.
            </span>
          </div>
          <Link
            href="/RiderDashboard/myorders"
            className="rounded-xl bg-white text-amber-900 px-3.5 py-1.5 text-xs font-black shadow hover:bg-amber-50 transition shrink-0"
          >
            Go to My Deliveries →
          </Link>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white p-6 shadow-sm">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="mt-3 h-4 w-60 bg-gray-200 rounded" />
              <div className="mt-4 h-10 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : availableOrders.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {availableOrders.map((order) => (
            <OrderCard key={order._id} order={order}>
              <button
                type="button"
                disabled={acceptingId === order._id || isLimitReached}
                onClick={() => acceptOrder(order._id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isLimitReached
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600 shadow cursor-pointer disabled:opacity-60"
                }`}
                title={isLimitReached ? "Maximum 2 active orders reached. Complete existing orders first." : "Accept this delivery"}
              >
                {acceptingId === order._id
                  ? "Accepting..."
                  : isLimitReached
                  ? "🔒 Limit Reached (2/2)"
                  : "Accept order"}
              </button>
              <button
                type="button"
                onClick={() => rejectOrder(order._id)}
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer"
              >
                Dismiss
              </button>
            </OrderCard>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-white p-8 text-center text-gray-500 shadow">
          <p className="text-base font-semibold text-gray-700">
            There are no new order requests right now.
          </p>
          <p className="mt-1 text-sm">
            When clients place delivery requests, they will appear here in real-time.
          </p>
          <button
            type="button"
            onClick={loadData}
            className="mt-4 rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition cursor-pointer"
          >
            Refresh List
          </button>
        </div>
      )}
    </div>
  );
}

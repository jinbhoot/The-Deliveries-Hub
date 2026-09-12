"use client";

import { useEffect, useState } from "react";
import OrderCard, { type RiderOrder } from "../order-card";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "completed">("active");

  async function loadMyOrders(isInitial = false) {
    if (isInitial) setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const text = await res.text().catch(() => "");
      const data = text ? JSON.parse(text) : null;
      if (res.ok && data?.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        if (isInitial) setError(data?.message || "Failed to load orders.");
      }
    } catch (err) {
      console.error("Error loading my orders:", err);
      if (isInitial) setError("Could not reach the server.");
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  useEffect(() => {
    loadMyOrders(true);

    // Live auto-polling every 4 seconds to instantly detect when client pays
    const interval = setInterval(() => {
      loadMyOrders(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function updateStatus(orderId: string, nextStatus: string) {
    setUpdatingId(orderId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const text = await res.text().catch(() => "");
      const data = text ? JSON.parse(text) : null;

      if (!res.ok || !data?.success) {
        setError(data?.message || `Failed to update status to ${nextStatus}.`);
        setUpdatingId(null);
        return;
      }

      setSuccess(`Order status updated to "${nextStatus}".`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus, isPaid: nextStatus === "Delivered" ? true : o.isPaid } : o))
      );
    } catch (err) {
      console.error("Status update error:", err);
      setError("Network error updating status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function notifyClientPayment(orderId: string) {
    setUpdatingId(orderId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billStatus: "Requested" }),
      });
      const text = await res.text().catch(() => "");
      const data = text ? JSON.parse(text) : null;

      if (!res.ok || !data?.success) {
        setError(data?.message || "Failed to notify client.");
        setUpdatingId(null);
        return;
      }

      setSuccess("Bill payment request sent to client's dashboard!");
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, billStatus: "Requested" } : o))
      );
    } catch (err) {
      console.error("Notify client error:", err);
      setError("Network error sending notification.");
    } finally {
      setUpdatingId(null);
    }
  }

  const activeOrders = orders.filter(
    (order) => order.status === "Accepted" || order.status === "Picked Up" || order.status === "On the way"
  );
  const completedOrders = orders.filter((order) => order.status === "Delivered" || order.status === "Cancelled");
  const displayedOrders = tab === "active" ? activeOrders : completedOrders;

  function renderStatusActions(order: RiderOrder & { billStatus?: string }) {
    const isBusy = updatingId === order._id;

    return (
      <div className="flex flex-wrap items-center gap-2 w-full">
        {/* Payment Status Notice for Rider */}
        {!order.isPaid && order.status !== "Delivered" && order.status !== "Cancelled" ? (
          <div className="flex flex-wrap items-center justify-between gap-2 w-full rounded-xl bg-amber-50 border border-amber-300 p-3 mb-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <span className="size-2 rounded-full bg-amber-500 animate-ping" />
              <span>⏳ Payment not received yet. Client notified to send Rs. {(order.totalAmount || 0).toLocaleString()}.</span>
            </div>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => notifyClientPayment(order._id)}
              className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition cursor-pointer"
            >
              🔔 Remind Client
            </button>
          </div>
        ) : order.isPaid && order.status !== "Delivered" && (
          <div className="w-full rounded-xl bg-emerald-50 border border-emerald-300 p-2.5 mb-1">
            <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <span>✅ Payment Received (Rs. {(order.totalAmount || 0).toLocaleString()})! You can now update tracking & deliver.</span>
            </p>
          </div>
        )}

        {/* Step 1: Picked Up - Enabled ONLY when payment is received */}
        {order.status === "Accepted" && (
          <button
            type="button"
            disabled={isBusy || !order.isPaid}
            onClick={() => updateStatus(order._id, "Picked Up")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              order.isPaid
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow cursor-pointer"
                : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75"
            }`}
            title={!order.isPaid ? "Client must pay bill before you can pick up" : "Click to mark as Picked Up"}
          >
            {isBusy ? "Updating..." : order.isPaid ? "📦 Mark as Picked Up" : "🔒 Pick Up (Locked until Paid)"}
          </button>
        )}

        {/* Step 2: On the way */}
        {order.status === "Picked Up" && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => updateStatus(order._id, "On the way")}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60 transition shadow cursor-pointer"
          >
            {isBusy ? "Updating..." : "🛵 Mark as On the Way"}
          </button>
        )}

        {/* Step 3: Delivered */}
        {order.status === "On the way" && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => updateStatus(order._id, "Delivered")}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition shadow cursor-pointer"
          >
            {isBusy ? "Updating..." : "✓ Complete & Mark Delivered"}
          </button>
        )}

        {order.status === "Delivered" && (
          <span className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 border border-green-200">
            ✓ Delivered Successfully ({order.isPaid ? "Paid Online" : "Paid"})
          </span>
        )}
      </div>
    );
  }



  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Deliveries</h1>
          <p className="mt-1 text-orange-100">Manage and progress your assigned orders.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-white/20 p-1 backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              tab === "active" ? "bg-white text-orange-600 shadow" : "text-white hover:bg-white/10"
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("completed")}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              tab === "completed" ? "bg-white text-orange-600 shadow" : "text-white hover:bg-white/10"
            }`}
          >
            Completed ({completedOrders.length})
          </button>
        </div>
      </div>

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
      ) : displayedOrders.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {displayedOrders.map((order) => (
            <OrderCard key={order._id} order={order}>
              {renderStatusActions(order)}
            </OrderCard>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-white p-8 text-center text-gray-500 shadow">
          <p className="text-base font-semibold text-gray-700">
            {tab === "active" ? "You have no active deliveries." : "No completed deliveries found."}
          </p>
          <p className="mt-1 text-sm">
            {tab === "active"
              ? "Browse the Order List to accept and start new deliveries."
              : "Completed orders will be logged here for your record."}
          </p>
        </div>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import OrderCard, { type RiderOrder } from "../order-card";

export default function OrderListPage() {
  const [availableOrders, setAvailableOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  async function loadAvailableOrders() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders?scope=available");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setAvailableOrders(data.data);
      } else {
        setError(data.message || "Failed to load available orders.");
      }
    } catch (err) {
      console.error("Error loading available orders:", err);
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAvailableOrders();
  }, []);

  async function acceptOrder(id: string) {
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
        // Refresh list to remove already taken orders
        loadAvailableOrders();
        return;
      }

      setSuccess("Order accepted! Moved to your active deliveries.");
      // Remove from available list
      setAvailableOrders((prev) => prev.filter((o) => o._id !== id));
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Order List</h1>
      <p className="mt-1 text-orange-100">
        Review available delivery requests and choose an order to deliver.
      </p>

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
                disabled={acceptingId === order._id}
                onClick={() => acceptOrder(order._id)}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition"
              >
                {acceptingId === order._id ? "Accepting..." : "Accept order"}
              </button>
              <button
                type="button"
                onClick={() => rejectOrder(order._id)}
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
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
            onClick={loadAvailableOrders}
            className="mt-4 rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
          >
            Refresh List
          </button>
        </div>
      )}
    </div>
  );
}


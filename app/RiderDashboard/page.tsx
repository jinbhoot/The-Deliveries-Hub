"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OrderCard, { type RiderOrder } from "./order-card";

export default function RiderDashboardPage() {
  const [riderName, setRiderName] = useState("Rider");
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError("");
      try {
        const [meRes, ordersRes] = await Promise.all([
          fetch("/api/riders/me"),
          fetch("/api/orders"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success && meData.data) {
            setRiderName(meData.data.user?.fullName || "Rider");
          }
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.success && Array.isArray(ordersData.data)) {
            setOrders(ordersData.data);
          }
        } else {
          setError("Failed to load your orders.");
        }
      } catch (err) {
        console.error("Rider dashboard error:", err);
        setError("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const activeOrders = orders.filter(
    (order) => order.status === "Accepted" || order.status === "Picked Up" || order.status === "On the way"
  );
  const deliveredOrders = orders.filter((order) => order.status === "Delivered");
  
  // Rider delivery earnings = 80% of delivery fee for delivered orders
  const totalGrossDelivered = deliveredOrders.reduce((total, order) => total + (order.totalAmount ?? 0), 0);
  const totalDeliveryFees = deliveredOrders.reduce((total, order) => total + (order.deliveryFee ?? 250), 0);
  const totalBaseBills = deliveredOrders.reduce(
    (total, order) => total + (order.subtotal ?? Math.max(0, (order.totalAmount ?? 0) - (order.deliveryFee ?? 250))),
    0
  );
  const riderEarnings = deliveredOrders.reduce(
    (total, order) => total + (order.riderEarnings ?? Math.round((order.deliveryFee ?? 250) * 0.8)),
    0
  );

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wider text-orange-100">
          Rider dashboard
        </p>
        <h1 className="text-2xl font-bold text-white">
          {loading ? "Welcome back..." : `Good day, ${riderName}`}
        </h1>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Rider Delivery Fee Split Info Banner */}
      <div className="mb-6 rounded-2xl bg-white/10 p-4 border border-white/20 text-white backdrop-blur-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛵</span>
          <div>
            <p className="font-bold text-sm">Delivery Fee Earnings</p>
            <p className="text-xs text-orange-100">
              You earn 80% of the delivery fee for each delivery.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="mt-4 h-8 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="My Delivery Earnings (80%)"
            value={`PKR ${riderEarnings.toLocaleString()}`}
            subtext={`From PKR ${totalDeliveryFees.toLocaleString()} fees (Base bill PKR ${totalBaseBills.toLocaleString()} separated)`}
            highlight
          />
          <StatCard
            label="Delivered Orders"
            value={String(deliveredOrders.length)}
            subtext={`Gross collected: PKR ${totalGrossDelivered.toLocaleString()}`}
          />
          <StatCard
            label="Active Deliveries"
            value={String(activeOrders.length)}
            subtext="In-progress orders"
          />
        </section>
      )}

      {/* Active Orders Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Active Deliveries</h2>
          <Link
            href="/RiderDashboard/myorders"
            className="text-sm font-semibold text-orange-100 hover:text-white hover:underline"
          >
            View all my orders →
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow">
            Loading active deliveries...
          </div>
        ) : activeOrders.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {activeOrders.slice(0, 4).map((order) => (
              <OrderCard key={order._id} order={order}>
                <Link
                  href="/RiderDashboard/myorders"
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
                >
                  Manage Status ({order.status})
                </Link>
              </OrderCard>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow">
            <p className="font-semibold text-gray-700">No active deliveries right now</p>
            <p className="mt-1 text-sm">Check the Order List to accept new available orders.</p>
            <Link
              href="/RiderDashboard/orderlist"
              className="mt-4 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
            >
              Browse Available Orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  highlight,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl bg-white p-6 shadow transition hover:shadow-md ${
        highlight ? "border-2 border-emerald-500/40 ring-2 ring-emerald-100" : ""
      }`}
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${highlight ? "text-emerald-600" : "text-gray-900"}`}>
        {value}
      </p>
      {subtext && <p className="mt-1 text-xs text-gray-400">{subtext}</p>}
    </article>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminStats = {
  totalClients: number;
  totalRiders: number;
  pendingRiders: number;
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  totalBaseBill?: number;
  totalDeliveryFee?: number;
  adminRevenue?: number;
  riderPayouts?: number;
  pendingReports: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setStats(data.data);
        } else {
          setError(data.message || "Failed to load dashboard statistics.");
        }
      } catch (err) {
        console.error("Admin stats error:", err);
        setError("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const totalFee = stats?.totalDeliveryFee ?? (stats?.totalRevenue ? Math.round(stats.totalRevenue * 0.25) : 0);
  const adminNet = stats ? (stats.adminRevenue ?? Math.round(totalFee * 0.2)) : 0;
  const riderTotal = stats ? (stats.riderPayouts ?? Math.round(totalFee * 0.8)) : 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Live platform overview, delivery charge commissions, and operational metrics.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/adminDashboard/payments"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Payments & Commission
          </Link>
          <Link
            href="/adminDashboard/orders"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
          >
            Manage Orders
          </Link>
          <Link
            href="/adminDashboard/rider"
            className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Riders Panel
          </Link>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="mt-4 h-8 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Admin Platform Fee from Delivery Charges */}
          <div className="rounded-2xl bg-white p-6 shadow border-2 border-emerald-500/30 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Admin Platform Fee (20% Fee)</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Platform Cut</span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-emerald-600">
              PKR {adminNet.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-400">20% cut from PKR {totalFee.toLocaleString()} delivery charges</p>
          </div>

          {/* Rider Delivery Earnings */}
          <div className="rounded-2xl bg-white p-6 shadow border-2 border-blue-500/30 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700">Rider Delivery Earnings (80% Fee)</h2>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">Riders Share</span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-blue-600">
              PKR {riderTotal.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-400">80% cut from PKR {totalFee.toLocaleString()} delivery charges</p>
          </div>


          {/* Total Gross Volume */}
          <div className="rounded-2xl bg-white p-6 shadow transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Gross Volume (100%)</h2>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">Total Billed</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              PKR {stats.totalRevenue.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-400">Base items + delivery fees settled</p>
          </div>

          {/* Total Orders */}
          <div className="rounded-2xl bg-white p-6 shadow transition hover:shadow-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Orders</h2>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {stats.totalOrders}
            </p>
            <p className="mt-1 text-xs font-semibold text-orange-600">
              {stats.activeOrders} active in-progress
            </p>
          </div>

          {/* Approved Riders */}
          <div className="rounded-2xl bg-white p-6 shadow transition hover:shadow-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Approved Riders</h2>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {stats.totalRiders}
            </p>
            {stats.pendingRiders > 0 ? (
              <p className="mt-1 text-xs font-semibold text-amber-600">
                {stats.pendingRiders} pending approval
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-400">All applications processed</p>
            )}
          </div>

          {/* Open Reports */}
          <div className="rounded-2xl bg-white p-6 shadow transition hover:shadow-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Open Reports</h2>
            <p className={`mt-3 text-2xl font-bold ${stats.pendingReports > 0 ? "text-red-500" : "text-gray-900"}`}>
              {stats.pendingReports}
            </p>
            <p className="mt-1 text-xs text-gray-400">Customer support issues</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}


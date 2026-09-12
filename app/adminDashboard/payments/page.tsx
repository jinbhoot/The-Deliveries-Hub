"use client";

import { useEffect, useState } from "react";

type PaymentRecord = {
  _id: string;
  order?: {
    _id: string;
    totalAmount: number;
    subtotal?: number;
    deliveryFee?: number;
    status: string;
    rider?: {
      fullName?: string;
      email?: string;
    } | string;
    riderEarnings?: number;
    adminCommission?: number;
  };
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  amount: number;
  subtotal?: number;
  deliveryFee?: number;
  riderEarnings?: number;
  adminCommission?: number;
  method: "COD" | "Card";
  status: "Pending" | "Paid" | "Failed";
  createdAt: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPayments() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setPayments(data.data);
      } else {
        setError(data.message || "Failed to load payment records.");
      }
    } catch (err) {
      console.error("Admin payments error:", err);
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const paidPayments = payments.filter((p) => p.status === "Paid");

  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalAdminRevenue = paidPayments.reduce((sum, p) => {
    if (typeof p.adminCommission === "number") return sum + p.adminCommission;
    const fee = p.deliveryFee ?? (p.order?.deliveryFee ?? 0);
    return sum + Math.round(fee * 0.2);
  }, 0);

  const totalRiderPayouts = paidPayments.reduce((sum, p) => {
    if (typeof p.riderEarnings === "number") return sum + p.riderEarnings;
    const fee = p.deliveryFee ?? (p.order?.deliveryFee ?? 0);
    return sum + Math.round(fee * 0.8);
  }, 0);

  const totalBaseBills = paidPayments.reduce((sum, p) => {
    const sub = p.subtotal ?? (p.order?.subtotal ?? (p.amount - (p.deliveryFee ?? (p.order?.deliveryFee ?? 0))));
    return sum + (sub > 0 ? sub : 0);
  }, 0);

  const totalDeliveryCharges = paidPayments.reduce((sum, p) => {
    const fee = p.deliveryFee ?? (p.order?.deliveryFee ?? 0);
    return sum + fee;
  }, 0);

  const pendingCount = payments.filter((p) => p.status === "Pending").length;
  const paidCount = paidPayments.length;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment & Revenue Management</h1>
          <p className="text-sm text-gray-500">
            Delivery charges are split 80% to Rider and 20% to Admin. Base item bills remain 100% separated.
          </p>
        </div>
        <button
          type="button"
          onClick={loadPayments}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Payment & Revenue Split Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow border-2 border-emerald-500/30">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Admin Platform Net (20% Fee)</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">PKR {totalAdminRevenue.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-400">20% fee from PKR {totalDeliveryCharges.toLocaleString()} delivery charges</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow border-2 border-blue-500/30">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Rider Total Payouts (80% Fee)</p>
          <p className="mt-2 text-2xl font-extrabold text-blue-600">PKR {totalRiderPayouts.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-400">80% fee from PKR {totalDeliveryCharges.toLocaleString()} delivery charges</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Base Items Volume (Separated)</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">PKR {totalBaseBills.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-400">Total store product items cost</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Gross Settled Volume (100%)</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">PKR {totalPaid.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-400">{paidCount} Paid · {pendingCount} Pending</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Transactions & Revenue Split Breakdown</h2>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
            Split Model: 80% Rider / 20% Admin (Delivery Fee Only)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payment records found.</div>
        ) : (
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 text-left font-bold text-gray-700">Order ID</th>
                <th className="p-3 text-left font-bold text-gray-700">Client</th>
                <th className="p-3 text-left font-bold text-gray-700">Rider</th>
                <th className="p-3 text-left font-bold text-gray-700">Method</th>
                <th className="p-3 text-left font-bold text-slate-700">Base Bill</th>
                <th className="p-3 text-left font-bold text-amber-700">Delivery Fee</th>
                <th className="p-3 text-left font-bold text-blue-700">Rider (80%)</th>
                <th className="p-3 text-left font-bold text-emerald-700">Admin (20%)</th>
                <th className="p-3 text-left font-bold text-gray-900">Total Paid</th>
                <th className="p-3 text-left font-bold text-gray-700">Status</th>
                <th className="p-3 text-left font-bold text-gray-700">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => {
                const riderObj =
                  typeof payment.order?.rider === "object" && payment.order?.rider !== null
                    ? payment.order.rider
                    : null;
                const riderName = riderObj?.fullName || "Unassigned";

                const delivFee = payment.deliveryFee ?? (payment.order?.deliveryFee ?? 0);
                const baseBill =
                  payment.subtotal ??
                  (payment.order?.subtotal ?? Math.max(0, payment.amount - delivFee));

                const rShare =
                  payment.riderEarnings ??
                  (payment.order?.riderEarnings ?? Math.round(delivFee * 0.8));
                const aFee =
                  payment.adminCommission ??
                  (payment.order?.adminCommission ?? (delivFee - rShare));

                return (
                  <tr key={payment._id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-mono font-bold text-gray-900">
                      {payment.order?._id
                        ? `#${payment.order._id.slice(-6).toUpperCase()}`
                        : `#${payment._id.slice(-6).toUpperCase()}`}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-gray-900">{payment.customer?.fullName || "Client"}</p>
                      <p className="text-xs text-gray-400">{payment.customer?.email}</p>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-gray-800">{riderName}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-gray-700">
                        {payment.method === "Card" ? "💳 Card" : "💵 COD"}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      PKR {baseBill.toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-amber-700">
                      PKR {delivFee.toLocaleString()}
                    </td>
                    <td className="p-3 font-extrabold text-blue-700">
                      PKR {rShare.toLocaleString()}
                    </td>
                    <td className="p-3 font-extrabold text-emerald-700">
                      PKR {aFee.toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      PKR {payment.amount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                          payment.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  item: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderRecord = {
  _id: string;
  customer?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  rider?: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
  items: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  riderEarnings?: number;
  adminCommission?: number;
  totalAmount: number;
  deliveryAddress: string;
  status: "Placed" | "Accepted" | "Picked Up" | "On the way" | "Delivered" | "Cancelled";
  paymentMethod: "COD" | "Card";
  isPaid: boolean;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setError(data.message || "Failed to load orders.");
      }
    } catch (err) {
      console.error("Admin orders error:", err);
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function cancelOrder(orderId: string) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: "Cancelled" } : o))
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: "Cancelled" } : null));
        }
      } else {
        alert(data.message || "Failed to cancel order.");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Error cancelling order.");
    } finally {
      setCancellingId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    return order.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Placed":
        return "bg-amber-100 text-amber-800";
      case "Accepted":
        return "bg-blue-100 text-blue-800";
      case "Picked Up":
      case "On the way":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-500">Monitor all customer orders and rider assignments.</p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <label htmlFor="statusFilter" className="text-sm font-semibold text-gray-700">
            Filter Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-orange-500"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="Placed">Placed</option>
            <option value="Accepted">Accepted</option>
            <option value="Picked Up">Picked Up</option>
            <option value="On the way">On the way</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow mt-6 p-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">All Orders</h2>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found matching this filter.</div>
        ) : (
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3.5 font-bold text-gray-700">Order ID</th>
                <th className="text-left p-3.5 font-bold text-gray-700">Customer</th>
                <th className="text-left p-3.5 font-bold text-gray-700">Rider</th>
                <th className="text-left p-3.5 font-bold text-gray-700">Amount</th>
                <th className="text-left p-3.5 font-bold text-gray-700">Payment</th>
                <th className="text-left p-3.5 font-bold text-gray-700">Status</th>
                <th className="text-left p-3.5 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/80 transition">
                  <td className="p-3.5 font-mono font-bold text-gray-900">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-gray-900">{order.customer?.fullName || "Client"}</p>
                    <p className="text-xs text-gray-500">{order.customer?.email || order.customer?.phone}</p>
                  </td>
                  <td className="p-3.5">
                    {order.rider ? (
                      <span className="font-medium text-gray-900">{order.rider.fullName}</span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-gray-900">
                    PKR {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className="text-xs font-semibold text-gray-700">
                      {order.paymentMethod} · {order.isPaid ? "Paid ✓" : "Pending"}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3.5 space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition"
                    >
                      Details
                    </button>
                    {order.status !== "Delivered" && order.status !== "Cancelled" && (
                      <button
                        type="button"
                        disabled={cancellingId === order._id}
                        onClick={() => cancelOrder(order._id)}
                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {cancellingId === order._id ? "..." : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold">
                  Order #{selectedOrder._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-gray-500">
                  Placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-gray-400">Delivery Address</p>
                <p className="font-medium text-gray-800">{selectedOrder.deliveryAddress}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-400">Customer</p>
                <p className="font-medium text-gray-800">
                  {selectedOrder.customer?.fullName} ({selectedOrder.customer?.email} / {selectedOrder.customer?.phone || "No phone"})
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-400">Assigned Rider</p>
                <p className="font-medium text-gray-800">
                  {selectedOrder.rider?.fullName ? `${selectedOrder.rider.fullName} (${selectedOrder.rider.email})` : "None"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-2">Order Items</p>
                <div className="rounded-lg bg-gray-50 p-3 space-y-2 border border-gray-200">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {i.name} <strong className="text-gray-600">x{i.quantity}</strong>
                      </span>
                      <span className="font-semibold">PKR {i.price * i.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex justify-between text-xs text-gray-600">
                    <span>Base Items Subtotal:</span>
                    <span className="font-semibold">
                      PKR {(
                        selectedOrder.subtotal ??
                        selectedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-amber-700">
                    <span>Delivery Charge:</span>
                    <span className="font-semibold">
                      PKR {(
                        selectedOrder.deliveryFee ??
                        Math.max(
                          0,
                          selectedOrder.totalAmount -
                            (selectedOrder.subtotal ??
                              selectedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0))
                        )
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total Collected Bill:</span>
                    <span>PKR {selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Revenue Commission Breakdown (Only on delivery charges) */}
              {(() => {
                const sub =
                  selectedOrder.subtotal ??
                  selectedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0);
                const delivFee = selectedOrder.deliveryFee ?? Math.max(0, selectedOrder.totalAmount - sub);
                const rEarn = selectedOrder.riderEarnings ?? Math.round(delivFee * 0.8);
                const aComm = selectedOrder.adminCommission ?? (delivFee - rEarn);

                return (
                  <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-200 space-y-1.5">
                    <p className="text-xs font-bold uppercase text-emerald-800">
                      Delivery Charge Split (80% Rider / 20% Admin)
                    </p>
                    <div className="flex justify-between text-xs font-semibold text-blue-800">
                      <span>Rider Delivery Share (80% of Fee):</span>
                      <span>PKR {rEarn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-emerald-800">
                      <span>Admin Platform Cut (20% of Fee):</span>
                      <span>PKR {aComm.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-emerald-200/60 pt-1 flex justify-between text-[11px] text-gray-500">
                      <span>Base Items Bill (Separated):</span>
                      <span className="font-medium">PKR {sub.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
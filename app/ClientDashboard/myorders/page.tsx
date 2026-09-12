"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useMemo } from "react";

type OrderItem = {
  item?: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderData = {
  _id: string;
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress: string;
  status: "Placed" | "Accepted" | "Picked Up" | "On the way" | "Delivered" | "Cancelled";
  paymentMethod: "COD" | "Card";
  isPaid: boolean;
  billStatus?: "Pending" | "Requested" | "Paid";
  createdAt: string;
  updatedAt: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  rider?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
};

const TRACKING_STEPS = [
  { key: "Placed", label: "Order Placed", desc: "Order sent to store & riders", icon: "📋" },
  { key: "Accepted", label: "Rider Assigned", desc: "Rider accepted delivery", icon: "🛵" },
  { key: "Picked Up", label: "Picked Up", desc: "Items collected from store", icon: "🛍️" },
  { key: "On the way", label: "On The Way", desc: "Rider is heading to you", icon: "🚀" },
  { key: "Delivered", label: "Delivered", desc: "Order completed safely", icon: "✅" },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "Placed":
      return 0;
    case "Accepted":
      return 1;
    case "Picked Up":
      return 2;
    case "On the way":
      return 3;
    case "Delivered":
      return 4;
    default:
      return 0;
  }
}

function MyOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("id");

  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orderIdParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  async function loadOrders(isInitial = false) {
    if (isInitial) setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const text = await res.text();
      let data: { success?: boolean; data?: OrderData[]; message?: string } | null = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }


      if (res.status === 401) {
        router.push("/login?redirectTo=/ClientDashboard/myorders");
        return;
      }

      if (res.ok && data?.success && Array.isArray(data.data)) {
        setAllOrders(data.data);
        setLastRefreshed(new Date());

        // Set selected order if not yet set or if orderIdParam passed
        if (orderIdParam) {
          setSelectedOrderId(orderIdParam);
        } else if (!selectedOrderId && data.data.length > 0) {
          setSelectedOrderId(data.data[0]._id);
        }
      } else {
        if (isInitial) setError(data?.message || "Failed to load orders.");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (isInitial) setError("Could not connect to the server.");
    } finally {
      if (isInitial) setLoading(false);
    }

  }

  useEffect(() => {
    loadOrders(true);

    // Live auto-polling every 5 seconds for real-time status and rider updates
    const interval = setInterval(() => {
      loadOrders(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [orderIdParam]);

  // Active selected order
  const activeOrder = useMemo(() => {
    if (!allOrders.length) return null;
    if (selectedOrderId) {
      const found = allOrders.find((o) => o._id === selectedOrderId);
      if (found) return found;
    }
    return allOrders[0];
  }, [allOrders, selectedOrderId]);

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;
  const isCancelled = activeOrder?.status === "Cancelled";
  const isPaidOrder = Boolean(
    activeOrder?.isPaid || activeOrder?.billStatus === "Paid" || activeOrder?.status === "Delivered"
  );

  const itemsSubtotal =
    activeOrder?.subtotal ||
    activeOrder?.items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0) ||
    0;

  const deliveryCharges =
    activeOrder?.deliveryFee !== undefined
      ? activeOrder.deliveryFee
      : Math.max(0, (activeOrder?.totalAmount || 0) - itemsSubtotal);

  function proceedToPayment(orderId: string) {
    router.push(`/ClientDashboard/payment?orderId=${orderId}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-orange-600/30 bg-orange-500 px-4 py-3 sm:px-6 sm:py-4 text-white shadow-md md:px-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/ClientDashboard"
            className="flex items-center gap-1.5 rounded-xl bg-orange-600/60 px-2.5 py-1.5 text-xs font-bold transition hover:bg-orange-700 shrink-0"
          >
            ← <span className="hidden sm:inline">Back to</span> Dashboard
          </Link>
          <span className="hidden sm:inline text-white/50">|</span>
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate">📦 My Orders & Live Tracking</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadOrders(false)}
            className="rounded-xl border border-white/30 bg-white/10 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/20 transition flex items-center gap-1.5"
            title="Refresh Orders"
          >
            <span className="animate-spin text-xs">↻</span> Live
          </button>
          <Link
            href="/ClientDashboard"
            className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 shadow-sm transition"
          >
            + New Order
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mb-4" />
            <p className="font-bold text-slate-700">Loading your orders...</p>
            <p className="text-xs text-slate-500 mt-1">Connecting to tracking server</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-2xl mb-2">⚠️</p>
            <h2 className="font-bold text-red-900 text-lg">Unable to load orders</h2>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => loadOrders(true)}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : allOrders.length === 0 ? (
          /* Empty State */
          <div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-lg border border-slate-200">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-black text-slate-900">No Orders Placed Yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              You haven&apos;t placed any orders yet. Browse our delicious food, medicines, or groceries and place your first order today!
            </p>
            <Link
              href="/ClientDashboard"
              className="mt-6 inline-block rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition"
            >
              Browse Catalog & Order Now →
            </Link>
          </div>
        ) : (
          /* Main 2-Column Grid */
          <div className="grid gap-6 lg:grid-cols-12">
            {/* LEFT COLUMN: Orders List Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h2 className="font-bold text-slate-900 text-base">
                  Your Orders ({allOrders.length})
                </h2>
                <span className="text-[11px] font-semibold text-slate-400">
                  Updated: {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                {allOrders.map((ord) => {
                  const isSelected = activeOrder?._id === ord._id;
                  const itemPaid = Boolean(ord.isPaid || ord.billStatus === "Paid" || ord.status === "Delivered");

                  return (
                    <button
                      key={ord._id}
                      onClick={() => setSelectedOrderId(ord._id)}
                      className={`w-full text-left rounded-2xl p-4 transition border ${
                        isSelected
                          ? "bg-white border-orange-500 shadow-md ring-2 ring-orange-100"
                          : "bg-white/80 hover:bg-white border-slate-200 shadow-xs hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-slate-900">
                          #{ord._id.slice(-6).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              itemPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {itemPaid ? "Paid ✓" : "Pending"}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              ord.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : ord.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : ord.status === "On the way"
                                ? "bg-purple-100 text-purple-800 animate-pulse"
                                : ord.status === "Accepted"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            ● {ord.status}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-slate-500 truncate">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                        <span className="font-extrabold text-orange-600">
                          Rs. {ord.totalAmount.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Live Tracking & Order Details (8 Cols) */}
            {activeOrder && (
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Order Status Header Card */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900">
                          Order #{activeOrder._id.slice(-6).toUpperCase()}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            activeOrder.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : activeOrder.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : activeOrder.status === "On the way"
                              ? "bg-purple-100 text-purple-800"
                              : activeOrder.status === "Accepted"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          ● {activeOrder.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Placed on {new Date(activeOrder.createdAt).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-xl px-3 py-1 text-xs font-bold ${
                          isPaidOrder
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {isPaidOrder ? "Paid ✓" : "Payment Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Paid Confirmation or Rider Bill Payment Request Alert Banner */}
                  {isPaidOrder ? (
                    <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-950 shadow-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                          <p className="font-extrabold text-sm text-emerald-900">
                            Bill Paid Successfully
                          </p>
                          <p className="text-xs text-emerald-800 mt-0.5">
                            Payment of <strong>Rs. {activeOrder.totalAmount.toLocaleString()}</strong> has been received & verified.
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 shrink-0">
                        Paid Online ✓
                      </span>
                    </div>
                  ) : activeOrder.billStatus === "Requested" && !isCancelled ? (
                    <div className="mt-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-300 p-4 text-orange-950 shadow-sm animate-pulse">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🔔</span>
                        <div className="flex-1">
                          <p className="font-black text-sm text-orange-900">
                            Rider Bill Payment Request ({activeOrder.rider?.fullName || "Assigned Rider"})
                          </p>
                          <p className="text-xs mt-1 text-orange-800 leading-relaxed">
                            &quot;Your order has been accepted! Please complete the bill payment of{" "}
                            <strong>Rs. {activeOrder.totalAmount.toLocaleString()}</strong> so I can proceed with delivery to your doorstep.&quot;
                          </p>
                          <button
                            onClick={() => proceedToPayment(activeOrder._id)}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition"
                          >
                            💳 Pay Bill Now (Rs. {activeOrder.totalAmount.toLocaleString()}) →
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}


                  {/* 2. LIVE TRACKING PROGRESS STEPPER */}
                  {!isCancelled ? (
                    <div className="mt-8">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-6">
                        Live Delivery Progress
                      </p>

                      <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0 hidden md:block" />
                        <div
                          className="absolute top-5 left-6 h-1 bg-orange-500 transition-all duration-700 -z-0 hidden md:block"
                          style={{
                            width: `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%`,
                          }}
                        />

                        {/* Steps Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                          {TRACKING_STEPS.map((step, idx) => {
                            const isDone = idx <= currentStep;
                            const isCurrent = idx === currentStep;

                            return (
                              <div
                                key={step.key}
                                className={`flex md:flex-col items-center gap-3 md:text-center p-2 rounded-2xl transition ${
                                  isCurrent
                                    ? "bg-orange-50/80 md:bg-transparent"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-lg font-bold transition shadow-sm ${
                                    isCurrent
                                      ? "bg-orange-500 text-white ring-4 ring-orange-200 scale-110"
                                      : isDone
                                      ? "bg-green-500 text-white"
                                      : "bg-slate-200 text-slate-400"
                                  }`}
                                >
                                  {isDone && !isCurrent ? "✓" : step.icon}
                                </div>

                                <div>
                                  <p
                                    className={`text-xs font-bold ${
                                      isCurrent
                                        ? "text-orange-600"
                                        : isDone
                                        ? "text-slate-900"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {step.label}
                                  </p>
                                  <p className="text-[11px] text-slate-500 hidden md:block mt-0.5">
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-center">
                      <p className="text-xl mb-1">❌</p>
                      <p className="font-bold text-red-900">This order was cancelled.</p>
                      <p className="text-xs text-red-700 mt-0.5">Please place a new order if you still need delivery.</p>
                    </div>
                  )}
                </div>

                {/* 3. Rider Details Card */}
                {activeOrder.rider && (
                  <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                        🛵
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase text-slate-400">Assigned Delivery Rider</p>
                        <h3 className="font-bold text-base text-slate-900">{activeOrder.rider.fullName || "Delivery Rider"}</h3>
                        <p className="text-xs text-slate-500">{activeOrder.rider.phone || activeOrder.rider.email || "Active on delivery"}</p>
                      </div>
                    </div>

                    {activeOrder.rider.phone && (
                      <a
                        href={`tel:${activeOrder.rider.phone}`}
                        className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
                      >
                        📞 Call Rider
                      </a>
                    )}
                  </div>
                )}

                {/* 4. Delivery Address & Receipt Summary */}
                <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-base text-slate-900 mb-4 pb-2 border-b border-slate-100">
                    Delivery Details & Receipt
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 mb-6 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase">Delivery Address</p>
                      <p className="font-semibold text-slate-900 mt-1">{activeOrder.deliveryAddress}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase">Payment Details</p>
                      <p className="font-semibold text-slate-900 mt-1">
                        Online Card Payment ·{" "}
                        <span className={isPaidOrder ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                          {isPaidOrder ? "Paid ✓" : "Pending"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-2">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-sm">
                        <div>
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <span className="text-xs text-slate-500 ml-2">× {item.quantity || 1}</span>
                        </div>
                        <span className="font-semibold text-slate-800">
                          Rs. {(item.price * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bill Breakdown */}
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Items Subtotal</span>
                      <span className="font-semibold text-slate-900">Rs. {itemsSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Charges (Tiered Formula)</span>
                      <span className="font-semibold text-slate-900">Rs. {deliveryCharges.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-3 text-lg font-black text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-orange-600">Rs. {activeOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Pay button if unpaid */}
                  {!isPaidOrder && !isCancelled && (
                    <button
                      onClick={() => proceedToPayment(activeOrder._id)}
                      className="mt-6 w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition"
                    >
                      💳 Complete Card Payment (Rs. {activeOrder.totalAmount.toLocaleString()}) →
                    </button>
                  )}

                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
          <p className="font-bold">Loading My Orders...</p>
        </div>
      }
    >
      <MyOrdersContent />
    </Suspense>
  );
}

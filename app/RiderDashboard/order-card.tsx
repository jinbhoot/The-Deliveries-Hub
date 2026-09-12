import React from "react";

export type RiderOrderItem = {
  item?: string;
  name: string;
  price: number;
  quantity: number;
};

export type RiderOrder = {
  _id: string;
  id?: number | string;
  customer?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | string;
  phone?: string;
  items?: RiderOrderItem[];
  item?: string;
  type?: string;
  deliveryAddress?: string;
  address?: string;
  subtotal?: number;
  deliveryFee?: number;
  totalAmount?: number;
  amount?: number;
  riderEarnings?: number;
  adminCommission?: number;
  status: "Placed" | "Accepted" | "Picked Up" | "On the way" | "Delivered" | "Cancelled" | string;
  paymentMethod?: "COD" | "Card";
  isPaid?: boolean;
  createdAt?: string;
};

export default function OrderCard({
  order,
  children,
}: {
  order: RiderOrder;
  children?: React.ReactNode;
}) {
  const customerName =
    typeof order.customer === "object" && order.customer !== null
      ? order.customer.fullName || "Customer"
      : typeof order.customer === "string"
      ? order.customer
      : "Customer";

  const customerPhone =
    typeof order.customer === "object" && order.customer !== null
      ? order.customer.phone || order.phone || ""
      : order.phone || "";

  const address = order.deliveryAddress || order.address || "Address not provided";
  const totalAmount = order.totalAmount ?? order.amount ?? 0;
  const deliveryFee = order.deliveryFee ?? 250;
  const subtotal = order.subtotal ?? Math.max(0, totalAmount - deliveryFee);
  const orderId = order._id ? order._id.slice(-6).toUpperCase() : String(order.id || "");

  const itemsSummary =
    order.items && order.items.length > 0
      ? order.items.map((i) => `${i.name} (x${i.quantity || 1})`).join(", ")
      : order.item || "Delivery items";

  // Delivery fee split: 80% to Rider, 20% to Admin Platform
  const riderShare =
    order.riderEarnings && order.riderEarnings > 0
      ? order.riderEarnings
      : Math.round(deliveryFee * 0.8);
  const adminFee =
    order.adminCommission && order.adminCommission > 0
      ? order.adminCommission
      : deliveryFee - riderShare;

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-gray-900">{customerName}</p>
          <p className="mt-1 text-sm text-gray-500">
            Order #{orderId} · {itemsSummary}
          </p>
        </div>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          {order.paymentMethod ? `${order.paymentMethod}` : order.type || "Delivery"}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-gray-600">
        <p className="font-medium text-gray-800">📍 {address}</p>
        {customerPhone && (
          <p>
            Customer Phone:{" "}
            <a href={`tel:${customerPhone}`} className="font-medium text-orange-600 hover:underline">
              {customerPhone}
            </a>
          </p>
        )}
      </div>

      {/* Revenue & Payment Breakdown for Rider */}
      <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200/60 pb-2">
          <div>
            <span className="text-[11px] text-gray-500 block">Base Items Bill</span>
            <span className="font-bold text-gray-800 text-sm">PKR {subtotal.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-500 block">Delivery Charge</span>
            <span className="font-bold text-gray-800 text-sm">PKR {deliveryFee.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Collected</span>
            <span className="font-bold text-gray-900 text-sm">PKR {totalAmount.toLocaleString()}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Your Delivery Earning (80% fee)</span>
            <span className="font-extrabold text-emerald-600 text-base">PKR {riderShare.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-2 text-[11px]">
          <span className="text-gray-400">Admin Platform Fee (20% fee): PKR {adminFee.toLocaleString()}</span>
          <span
            className={`inline-flex items-center gap-1 font-bold ${
              order.isPaid ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            <span className={`size-1.5 rounded-full ${order.isPaid ? "bg-emerald-500" : "bg-amber-500 animate-ping"}`} />
            {order.isPaid ? "Paid ✓" : "Awaiting Client Payment"}
          </span>
        </div>
      </div>


      {children && <div className="mt-4 flex flex-wrap gap-3">{children}</div>}
    </article>
  );
}


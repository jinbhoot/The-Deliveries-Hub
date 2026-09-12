"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type ClientInfo = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
};

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type ClientOrder = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  status: string;
  paymentMethod: "COD" | "Card";
  isPaid: boolean;
  createdAt: string;
};

const orderStatusClasses: Record<string, string> = {
  Placed: "bg-amber-100 text-amber-800",
  Accepted: "bg-blue-100 text-blue-800",
  "Picked Up": "bg-purple-100 text-purple-800",
  "On the way": "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClientData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/clients/${id}`);
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setClient(data.data.client);
          setOrders(data.data.orders || []);
        } else {
          setError(data.message || "Client not found.");
        }
      } catch (err) {
        console.error("Client details fetch error:", err);
        setError("Could not reach server.");
      } finally {
        setLoading(false);
      }
    }

    loadClientData();
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        className="text-sm font-medium text-orange-600 hover:text-orange-700"
        href="/adminDashboard/clients"
      >
        ← Back to clients
      </Link>

      {error && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-4 rounded-xl bg-white p-8 text-center text-gray-500 shadow">
          Loading client profile and orders...
        </div>
      ) : client ? (
        <div className="mt-4 rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">Client Details</h1>

          <section aria-labelledby="client-details-heading" className="mt-6 border-b border-gray-100 pb-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-800" id="client-details-heading">
              {client.fullName}
            </h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <InfoItem label="Phone" value={client.phone || "Not provided"} />
              <InfoItem label="Email" value={client.email} />
              <InfoItem
                label="Account Created"
                value={new Date(client.createdAt).toLocaleDateString()}
              />
              <InfoItem label="Total Orders" value={String(orders.length)} />
            </dl>
          </section>

          <section aria-labelledby="order-details-heading" className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-800" id="order-details-heading">
              Order History ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
                This client has not placed any orders yet.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article className="rounded-lg border border-gray-200 p-4" key={order._id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold font-mono">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                          orderStatusClasses[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Placed on: {new Date(order.createdAt).toLocaleString()}
                    </div>

                    <div className="mt-3 text-sm text-gray-700">
                      <strong>Delivery Address:</strong> {order.deliveryAddress}
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 rounded bg-gray-50 p-2.5 text-xs text-gray-600">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between py-0.5">
                            <span>{i.name} (x{i.quantity})</span>
                            <span className="font-semibold">PKR {i.price * i.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 border-t border-gray-100 pt-3">
                      <InfoItem
                        label="Payment"
                        value={`${order.paymentMethod} (${order.isPaid ? "Paid ✓" : "Pending"})`}
                      />
                      <InfoItem
                        label="Order Total"
                        value={`PKR ${order.totalAmount.toLocaleString()}`}
                      />
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className="mt-1 font-medium text-gray-900">{value}</dd>
    </div>
  );
}


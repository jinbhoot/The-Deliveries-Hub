"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ClientItem = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function loadClients() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setClients(data.data);
      } else {
        setError(data.message || "Failed to load clients.");
      }
    } catch (err) {
      console.error("Admin clients error:", err);
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return clients;

    return clients.filter(
      (client) =>
        (client.fullName && client.fullName.toLowerCase().includes(normalizedQuery)) ||
        (client.email && client.email.toLowerCase().includes(normalizedQuery)) ||
        (client.phone && client.phone.toLowerCase().includes(normalizedQuery))
    );
  }, [clients, query]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-sm text-gray-500">View customer profiles and order histories.</p>
        </div>
        <button
          type="button"
          onClick={loadClients}
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

      <section aria-labelledby="client-list-heading" className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold" id="client-list-heading">
              Registered Clients ({clients.length})
            </h2>
            <p className="text-sm text-gray-500">Select a client to view their full profile and orders.</p>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="sr-only" htmlFor="client-search">
              Search clients by name, email, or phone
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              id="client-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, phone..."
              type="search"
              value={query}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading clients...</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <li key={client._id}>
                <Link
                  className="flex items-center justify-between gap-4 rounded-lg px-3 py-4 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  href={`/adminDashboard/clients/${client._id}`}
                >
                  <span>
                    <span className="block font-semibold text-gray-900">{client.fullName}</span>
                    <span className="mt-1 block text-sm text-gray-500">
                      {client.email} {client.phone ? `· ${client.phone}` : ""}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-orange-600">
                    View details <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!loading && filteredClients.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">
            {query ? `No clients match "${query}".` : "No registered clients found."}
          </p>
        )}
      </section>
    </div>
  );
}


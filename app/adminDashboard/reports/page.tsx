"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ReportItem = {
  _id: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  order?: {
    _id?: string;
    totalAmount?: number;
    status?: string;
  } | null;
  subject: string;
  message: string;
  status: "Open" | "In Review" | "Resolved";
  createdAt: string;
};

const statusClasses: Record<string, string> = {
  Open: "bg-red-100 text-red-700",
  "In Review": "bg-amber-100 text-amber-700",
  Resolved: "bg-green-100 text-green-700",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadReports() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setReports(data.data);
      } else {
        setError(data.message || "Failed to load reports.");
      }
    } catch (err) {
      console.error("Admin reports error:", err);
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Reports</h1>
          <p className="text-sm text-gray-500">Triage and resolve customer complaints.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:border-orange-500"
          >
            <option value="all">All Reports ({reports.length})</option>
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>
          <button
            type="button"
            onClick={loadReports}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section aria-labelledby="reports-list-heading" className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold" id="reports-list-heading">
          All Client Complaints
        </h2>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reports found matching this filter.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <li key={report._id}>
                <Link
                  className="block rounded-lg px-3 py-4 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  href={`/adminDashboard/reports/${report._id}`}
                >
                  <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <ReportItem
                      label="Client"
                      value={report.customer?.fullName || "Anonymous Client"}
                    />
                    <ReportItem label="Issue Type" value={report.subject} />
                    <ReportItem
                      label="Order Reference"
                      value={report.order?._id ? `#${report.order._id.slice(-6).toUpperCase()}` : "General"}
                    />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Status
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusClasses[report.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReportItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-gray-900">{value}</p>
    </div>
  );
}


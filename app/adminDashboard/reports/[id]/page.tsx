"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type ReportDetail = {
  _id: string;
  customer?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  order?: {
    _id?: string;
    totalAmount?: number;
    status?: string;
    deliveryAddress?: string;
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

export default function ReportDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [status, setStatus] = useState<"Open" | "In Review" | "Resolved">("Open");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          const found = data.data.find((r: ReportDetail) => r._id === id);
          if (found) {
            setReport(found);
            setStatus(found.status);
          } else {
            setError("Report not found.");
          }
        } else {
          setError(data.message || "Failed to load report.");
        }
      } catch (err) {
        console.error("Report details fetch error:", err);
        setError("Could not reach server.");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [id]);

  async function updateStatus(nextStatus: "Open" | "In Review" | "Resolved") {
    setUpdating(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to update report status.");
        setUpdating(false);
        return;
      }

      setStatus(nextStatus);
      setSuccess(`Report marked as "${nextStatus}".`);
    } catch (err) {
      console.error("Update report status error:", err);
      setError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        className="text-sm font-medium text-orange-600 hover:text-orange-700"
        href="/adminDashboard/reports"
      >
        ← Back to reports
      </Link>

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
        <div className="mt-4 rounded-xl bg-white p-8 text-center text-gray-500 shadow">
          Loading report details...
        </div>
      ) : report ? (
        <article className="mt-4 rounded-xl bg-white p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
              <p className="mt-1 text-sm text-gray-500">
                Submitted on {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold uppercase ${
                statusClasses[status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {status}
            </span>
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <DetailItem
              label="Client Name"
              value={report.customer?.fullName || "Anonymous Client"}
            />
            <DetailItem
              label="Client Contact"
              value={`${report.customer?.email || ""} ${
                report.customer?.phone ? `(${report.customer.phone})` : ""
              }`}
            />
            <DetailItem label="Issue Category" value={report.subject} />
            <DetailItem
              label="Order ID Reference"
              value={report.order?._id ? `#${report.order._id.slice(-6).toUpperCase()}` : "No order attached"}
            />
          </dl>

          <section aria-labelledby="issue-description-heading" className="mt-8">
            <h2 className="text-base font-semibold text-gray-900" id="issue-description-heading">
              Client Complaint Description
            </h2>
            <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-800 border border-gray-200">
              {report.message}
            </p>
          </section>

          <section aria-labelledby="resolution-actions-heading" className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-base font-semibold text-gray-900" id="resolution-actions-heading">
              Update Resolution Status
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition"
                onClick={() => updateStatus("Resolved")}
                disabled={updating || status === "Resolved"}
                type="button"
              >
                ✓ Mark as Resolved
              </button>
              <button
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition"
                onClick={() => updateStatus("In Review")}
                disabled={updating || status === "In Review"}
                type="button"
              >
                ⏳ Mark In Review
              </button>
              <button
                className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 transition"
                onClick={() => updateStatus("Open")}
                disabled={updating || status === "Open"}
                type="button"
              >
                ⚠️ Re-open Case
              </button>
            </div>
          </section>
        </article>
      ) : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className="mt-1 font-medium text-gray-900">{value}</dd>
    </div>
  );
}


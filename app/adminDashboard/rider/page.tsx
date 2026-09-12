"use client";

import { useEffect, useState } from "react";

type RiderStatus = "Pending" | "Approved" | "Blocked";

type RiderItem = {
  _id: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  cnic: string;
  address: string;
  status: RiderStatus;
  online: boolean;
  profileImage?: string;
  createdAt: string;
};

const statusClasses: Record<RiderStatus, string> = {
  Pending: "text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-full",
  Approved: "text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full",
  Blocked: "text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full",
};

export default function RidersPage() {
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadRiders() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/riders");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setRiders(data.data);
      } else {
        setError(data.message || "Failed to load riders.");
      }
    } catch (err) {
      console.error("Admin riders error:", err);
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRiders();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timeoutId = window.setTimeout(() => setToastMessage(""), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  async function updateRiderStatus(riderId: string, status: RiderStatus) {
    setUpdatingId(riderId);
    try {
      const res = await fetch(`/api/riders/${riderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || `Failed to update rider status to ${status}.`);
        setUpdatingId(null);
        return;
      }

      setRiders((prev) =>
        prev.map((r) => (r._id === riderId ? { ...r, status } : r))
      );
      setToastMessage(data.message || `Rider marked as ${status}.`);
    } catch (err) {
      console.error("Update rider error:", err);
      alert("Network error updating rider.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div
        aria-atomic="true"
        aria-live="polite"
        className={`fixed right-6 top-6 z-50 transition-opacity duration-200 ${
          toastMessage ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        role="status"
      >
        <div className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toastMessage}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riders Panel</h1>
          <p className="text-sm text-gray-500">Manage rider onboarding, approval status, and availability.</p>
        </div>
        <button
          type="button"
          onClick={loadRiders}
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

      {/* Rider Requests / Accounts */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow overflow-x-auto">
        <h2 className="mb-4 text-xl font-semibold">Registered Riders &amp; Applications</h2>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading riders...</div>
        ) : riders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No riders registered yet.</div>
        ) : (
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">CNIC</th>
                <th className="p-3 text-left">Area</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {riders.map((rider) => (
                <tr className="hover:bg-gray-50 transition" key={rider._id}>
                  <td className="p-3 font-semibold text-gray-900">{rider.user?.fullName || "Rider"}</td>
                  <td className="p-3">{rider.user?.phone || "—"}</td>
                  <td className="p-3 text-gray-500">{rider.user?.email || "—"}</td>
                  <td className="p-3 font-mono text-xs">{rider.cnic}</td>
                  <td className="p-3 text-gray-600">{rider.address}</td>
                  <td className="p-3">
                    <span className={statusClasses[rider.status] || ""}>
                      {rider.status}
                    </span>
                  </td>
                  <td className="space-x-2 p-3">
                    {rider.status !== "Approved" && (
                      <button
                        className="rounded bg-green-500 px-3 py-1 text-xs font-bold text-white hover:bg-green-600 disabled:opacity-50"
                        onClick={() => updateRiderStatus(rider._id, "Approved")}
                        disabled={updatingId === rider._id}
                        type="button"
                      >
                        {updatingId === rider._id ? "..." : "Approve"}
                      </button>
                    )}
                    {rider.status !== "Blocked" && (
                      <button
                        className="rounded bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
                        onClick={() => updateRiderStatus(rider._id, "Blocked")}
                        disabled={updatingId === rider._id}
                        type="button"
                      >
                        {updatingId === rider._id ? "..." : "Block"}
                      </button>
                    )}
                    {rider.status === "Blocked" && (
                      <button
                        className="rounded bg-gray-500 px-3 py-1 text-xs font-bold text-white hover:bg-gray-600 disabled:opacity-50"
                        onClick={() => updateRiderStatus(rider._id, "Pending")}
                        disabled={updatingId === rider._id}
                        type="button"
                      >
                        {updatingId === rider._id ? "..." : "Reset to Pending"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Online / Active Riders List */}
      <div className="rounded-xl bg-white p-6 shadow overflow-x-auto">
        <h2 className="mb-4 text-xl font-semibold">Rider Online Availability</h2>
        {riders.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No data available</div>
        ) : (
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Rider</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Operating Address</th>
                <th className="p-3 text-left">Availability</th>
                <th className="p-3 text-left">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {riders.map((rider) => (
                <tr key={rider._id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">{rider.user?.fullName}</td>
                  <td className="p-3">{rider.user?.phone || "—"}</td>
                  <td className="p-3">{rider.address}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        rider.online ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`size-2 rounded-full ${rider.online ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      {rider.online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-gray-700">{rider.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


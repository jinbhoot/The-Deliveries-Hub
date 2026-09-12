"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

const navigation = [
  { href: "/RiderDashboard", label: "Dashboard" },
  { href: "/RiderDashboard/myorders", label: "My Orders" },
  { href: "/RiderDashboard/orderlist", label: "Order List" },
  { href: "/RiderDashboard/profile", label: "My Profile" },
];

export default function RiderDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [riderName, setRiderName] = useState("Rider");
  const [riderId, setRiderId] = useState("...");
  const [isOnline, setIsOnline] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function loadRiderInfo() {
      try {
        const res = await fetch("/api/riders/me");
        const text = await res.text().catch(() => "");
        const data = text ? JSON.parse(text) : null;
        if (res.ok && data?.success && data?.data) {
          const r = data.data;
          setRiderName(r.user?.fullName || "Rider");
          setRiderId(r._id ? `#${r._id.slice(-6).toUpperCase()}` : "#123456");
          // If rider logs into dashboard, automatically ensure they are online
          const onlineState = r.online !== undefined ? Boolean(r.online) : true;
          setIsOnline(onlineState);

          // If currently offline in db on first dashboard load, mark online
          if (!r.online) {
            fetch("/api/riders/me", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ online: true }),
            })
              .then(() => setIsOnline(true))
              .catch(() => {});
          }
        }
      } catch (err) {
        console.error("Error loading rider layout info:", err);
      }
    }

    loadRiderInfo();
  }, []);

  async function toggleOnlineStatus() {
    const nextStatus = !isOnline;
    setIsOnline(nextStatus);
    setUpdatingStatus(true);
    try {
      await fetch("/api/riders/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to toggle online status:", err);
      setIsOnline(!nextStatus);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div
      className="flex min-h-screen bg-gray-100 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(234, 88, 12, 0.92), rgba(234, 88, 12, 0.92)), url('/rider%20pic.png')",
      }}
    >
      {/* Desktop / iPad Sidebar */}
      <aside className="hidden w-64 shrink-0 bg-white shadow-lg md:flex md:flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xl font-black text-orange-600">
            <span className="size-3 rounded-full bg-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.2)]" />
            Deliveries Hub
          </div>
          <p className="mt-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Rider Portal
          </p>
        </div>

        <div className="border-b border-gray-100 px-5 py-4">
          <p className="font-bold text-gray-900 truncate">{riderName}</p>
          <p className="mt-0.5 text-xs text-gray-500 font-mono">ID: {riderId}</p>

          {/* Interactive Online / Offline Status Toggle Badge */}
          <button
            type="button"
            onClick={toggleOnlineStatus}
            disabled={updatingStatus}
            className={`mt-3 flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-bold transition border cursor-pointer ${
              isOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-xs"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
            title="Click to toggle Online / Offline status"
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isOnline ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </span>
              <span>{isOnline ? "Online" : "Offline"}</span>
            </span>
            <span className="text-[10px] opacity-75 font-semibold">
              {updatingStatus ? "Saving..." : isOnline ? "Active" : "Inactive"}
            </span>
          </button>
        </div>

        <nav className="space-y-1 px-4 py-5 flex-1 overflow-y-auto" aria-label="Rider dashboard navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <LogoutButton className="block w-full text-left rounded-xl px-3.5 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
        {/* Mobile Header Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3.5 shadow-sm md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              RD
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 leading-tight">{riderName}</p>
              <p className="text-[11px] text-gray-500 font-mono">ID: {riderId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleOnlineStatus}
              disabled={updatingStatus}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition border cursor-pointer ${
                isOnline
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span
                className={`size-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`}
              />
              {isOnline ? "Online" : "Offline"}
            </button>
            <LogoutButton className="rounded-xl bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition" />
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scroll */}
        <nav
          className="mb-5 flex gap-1.5 overflow-x-auto rounded-2xl bg-white/95 backdrop-blur-xs p-1.5 shadow-sm md:hidden pb-1"
          aria-label="Rider dashboard navigation"
        >
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 block rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </main>
    </div>
  );
}


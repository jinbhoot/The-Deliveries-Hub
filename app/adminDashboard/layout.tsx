"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import Logo from "@/components/Logo";

const navItems = [
  { href: "/adminDashboard", label: "Dashboard" },
  { href: "/adminDashboard/orders", label: "Orders" },
  { href: "/adminDashboard/rider", label: "Riders" },
  { href: "/adminDashboard/clients", label: "Clients" },
  { href: "/adminDashboard/payments", label: "Payments" },
  { href: "/adminDashboard/reports", label: "Reports" },
  { href: "/adminDashboard/addCatagory", label: "Categories" },
  { href: "/adminDashboard/Item", label: "Catalog Items" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 flex md:hidden items-center justify-between bg-white px-4 py-2.5 shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Logo href="/adminDashboard" size="xs" showText={true} />
          <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell theme="light" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <span className="text-xl font-bold">✕</span>
            ) : (
              <span className="text-xl font-bold">☰</span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Mobile Slide-out Drawer Menu */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <Logo href="/adminDashboard" size="sm" showText={true} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <LogoutButton className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition text-left" />
        </div>
      </div>

      {/* Desktop / Tablet Sidebar */}
      <aside className="w-64 shrink-0 bg-white shadow-lg hidden md:flex md:flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Logo href="/adminDashboard" size="sm" showText={true} />
          <NotificationBell theme="light" />
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <LogoutButton className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition text-left" />
        </div>
      </aside>

      {/* Main Page Content with responsive padding */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}


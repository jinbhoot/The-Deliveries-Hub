"use client";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type DashboardHeaderProps = {
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
};

export function DashboardHeader({ cartCount, onOpenCart, onOpenOrders }: DashboardHeaderProps) {
  return (
    <header className="top">
      <Link className="brand" href="/ClientDashboard" aria-label="Delivery Hub dashboard">
        <span className="dot" aria-hidden="true" />
        <span>Delivery Hub<small>Client Dashboard</small></span>
      </Link>
      <nav className="top-actions" aria-label="Client navigation">
        <Link className="top-link" href="/">Home</Link>
        <button className="top-link" type="button" onClick={onOpenOrders}>My Orders</button>
        <Link className="top-link" href="/ClientDashboard/Report">Report</Link>
        <LogoutButton className="logout-link" />
      </nav>
      <button className="cart-toggle" type="button" onClick={onOpenCart}>
        🧾 Ticket <span className="badge">{cartCount}</span>
      </button>
    </header>
  );
}

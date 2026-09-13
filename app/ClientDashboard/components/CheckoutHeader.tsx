import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";

type CheckoutHeaderProps = { eyebrow: string };

export function CheckoutHeader({ eyebrow }: CheckoutHeaderProps) {
  return (
    <header className="checkout-header flex items-center justify-between">
      <Link className="checkout-brand" href="/ClientDashboard" aria-label="Delivery Hub dashboard">
        <span className="brand-mark" aria-hidden="true" />
        <span>Delivery Hub<small>{eyebrow}</small></span>
      </Link>
      <div className="flex items-center gap-2">
        <NotificationBell theme="light" />
      </div>
    </header>
  );
}

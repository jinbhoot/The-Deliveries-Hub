import Link from "next/link";

type CheckoutHeaderProps = { eyebrow: string };

export function CheckoutHeader({ eyebrow }: CheckoutHeaderProps) {
  return (
    <header className="checkout-header">
      <Link className="checkout-brand" href="/ClientDashboard" aria-label="Delivery Hub dashboard">
        <span className="brand-mark" aria-hidden="true" />
        <span>Delivery Hub<small>{eyebrow}</small></span>
      </Link>
    </header>
  );
}

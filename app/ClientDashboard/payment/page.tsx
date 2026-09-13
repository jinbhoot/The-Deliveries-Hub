"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe client outside of render
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

type OrderInfo = {
  _id: string;
  totalAmount: number;
  subtotal?: number;
  deliveryFee?: number;
  status: string;
  isPaid: boolean;
  billStatus?: string;
  paymentMethod: string;
  deliveryAddress?: string;
  items?: { name: string; price: number; quantity: number }[];
};

/**
 * Stripe Payment Form Component (rendered inside <Elements />)
 */
function StripeCheckoutForm({
  order,
  onPaymentSuccess,
}: {
  order: OrderInfo;
  onPaymentSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not finished loading. Please try again.");
      return;
    }

    setProcessing(true);

    try {
      // Confirm payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        setErrorMessage(result.error.message || "An error occurred with your payment.");
        setProcessing(false);
        return;
      }

      if (result.paymentIntent && (result.paymentIntent.status === "succeeded" || result.paymentIntent.status === "processing")) {
        // Record payment in database
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order._id,
            amount: order.totalAmount,
            method: "Card",
            stripePaymentIntentId: result.paymentIntent.id,
            currency: result.paymentIntent.currency,
          }),
        });

        const data = await res.json().catch(() => null);
        if (res.ok && data?.success) {
          onPaymentSuccess();
        } else {
          setErrorMessage(data?.message || "Payment succeeded but recording failed. Please refresh.");
        }
      } else {
        setErrorMessage("Payment status could not be verified. Please check with your bank.");
      }
    } catch (err: unknown) {
      console.error("Stripe confirmation error:", err);
      const msg = err instanceof Error ? err.message : "Could not connect to payment server.";
      setErrorMessage(msg);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5">
      {errorMessage && (
        <div className="error-banner" role="alert">
          <p className="font-bold">⚠️ Payment Error</p>
          <p className="mt-0.5 text-xs">{errorMessage}</p>
        </div>
      )}

      {/* Official Stripe Payment Element */}
      <div className="stripe-element-container rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="pay-button flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Processing with Stripe...</span>
          </>
        ) : (
          <span>💳 Pay Rs. {order.totalAmount.toLocaleString()} via Stripe</span>
        )}
      </button>
    </form>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const redirectStatus = searchParams.get("redirect_status");
  const paymentIntentParam = searchParams.get("payment_intent");

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [paid, setPaid] = useState(false);

  // Check if user returned from 3DS redirect
  useEffect(() => {
    if (redirectStatus === "succeeded" && orderIdParam && paymentIntentParam) {
      fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdParam,
          method: "Card",
          stripePaymentIntentId: paymentIntentParam,
        }),
      }).then(() => {
        setPaid(true);
      });
    }
  }, [redirectStatus, orderIdParam, paymentIntentParam]);

  // Hide Stripe Developer Assistant floating badge from DOM
  useEffect(() => {
    function purgeStripeBadge() {
      const badges = document.querySelectorAll(
        'iframe[src*="developer"], iframe[name*="developer"], iframe[src*="assistant"], div[class*="StripeDeveloperAssistant"], [data-stripe-assistant], #__privateStripeAssistant'
      );
      badges.forEach((node) => {
        const parent = node.parentElement;
        if (parent && parent !== document.body && parent.children.length === 1) {
          (parent as HTMLElement).style.setProperty("display", "none", "important");
        }
        (node as HTMLElement).style.setProperty("display", "none", "important");
      });

      // Target fixed bottom right elements containing stripe developer badge
      const allFixed = document.querySelectorAll('div[style*="fixed"]');
      allFixed.forEach((el) => {
        const txt = el.textContent?.trim().toLowerCase() || "";
        if (txt === "stripe >" || txt === "stripe" || txt.includes("stripe >")) {
          (el as HTMLElement).style.setProperty("display", "none", "important");
        }
      });
    }

    purgeStripeBadge();
    const obs = new MutationObserver(purgeStripeBadge);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  // Load Order details
  useEffect(() => {
    async function loadOrder() {
      setLoadingOrder(true);
      setErrorMsg("");
      try {
        let activeOrder: OrderInfo | null = null;

        if (orderIdParam) {
          const res = await fetch(`/api/orders/${orderIdParam}`);
          const data = await res.json().catch(() => null);
          if (res.ok && data?.success && data.data) {
            activeOrder = data.data;
          } else {
            setErrorMsg(data?.message || "Order not found.");
          }
        } else {
          // Fetch latest unpaid order from client's orders
          const res = await fetch("/api/orders");
          const data = await res.json().catch(() => null);
          if (res.ok && data?.success && Array.isArray(data.data) && data.data.length > 0) {
            activeOrder = data.data.find((o: OrderInfo) => !o.isPaid) || data.data[0];
          }
        }

        if (activeOrder) {
          setOrder(activeOrder);
          if (activeOrder.isPaid || activeOrder.billStatus === "Paid") {
            setPaid(true);
            return;
          }

          // Create Stripe PaymentIntent
          setLoadingSecret(true);
          const intentRes = await fetch("/api/payments/create-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: activeOrder._id }),
          });

          const intentData = await intentRes.json().catch(() => null);
          if (intentRes.ok && intentData?.success && intentData.clientSecret) {
            setClientSecret(intentData.clientSecret);
          } else {
            setErrorMsg(intentData?.message || "Could not initialize Stripe Payment Intent.");
          }
          setLoadingSecret(false);
        }
      } catch (err) {
        console.error("Error loading order for payment:", err);
        setErrorMsg("Failed to load order details from server.");
      } finally {
        setLoadingOrder(false);
      }
    }

    loadOrder();
  }, [orderIdParam]);

  const handlePaymentSuccess = () => {
    setPaid(true);
  };

  return (
    <div className="checkout-page">
      <main className="checkout-main">
        <section className="checkout-card" aria-live="polite">
          {paid ? (
            <div className="confirmation">
              <span className="success-icon" aria-hidden="true">
                ✓
              </span>
              <h1 className="text-2xl font-black text-emerald-600">Payment Successful!</h1>
              <p className="mt-2 text-slate-600">
                Your payment of <strong>Rs. {(order?.totalAmount ?? 0).toLocaleString()}</strong> has been securely received via Stripe. Your assigned rider can now proceed to deliver your order.
              </p>
              <div className="button-group mt-6">
                <Link
                  className="pay-button"
                  href={order ? `/ClientDashboard/myorders?id=${order._id}` : "/ClientDashboard/myorders"}
                >
                  📦 Track Order Progress →
                </Link>
                <Link className="secondary-button" href="/ClientDashboard">
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="eyebrow">Stripe Payment Gateway</p>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  SSL Encrypted
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Card Payment</h1>
              <p className="secure text-xs text-slate-500 mb-5">
                Pay securely using Visa, Mastercard, or debit cards powered by Stripe.
              </p>

              {loadingOrder ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mb-3" />
                  <p className="text-sm font-bold text-slate-700">Loading order details...</p>
                </div>
              ) : !order ? (
                <div className="rounded-xl bg-amber-50 p-6 text-center text-amber-900">
                  <p className="font-bold">No active order found to pay for.</p>
                  <Link
                    href="/ClientDashboard"
                    className="mt-3 inline-block rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              ) : (
                <>
                  {/* Order Summary Box */}
                  <div className="order-summary-box">
                    <div>
                      <span className="summary-label">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <p className="summary-desc truncate max-w-xs sm:max-w-sm">
                        📍 {order.deliveryAddress || "Delivery Address"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="summary-amount">Rs. {order.totalAmount.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 font-semibold">Total Amount</p>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="error-banner" role="alert">
                      <p className="font-bold">⚠️ Notice</p>
                      <p className="mt-0.5 text-xs">{errorMsg}</p>
                    </div>
                  )}

                  {/* Stripe Elements Checkout */}
                  {loadingSecret ? (
                    <div className="flex flex-col items-center justify-center py-10 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-orange-500 border-t-transparent mb-2" />
                      <p className="text-xs font-bold text-slate-600">Initializing Stripe Gateway...</p>
                    </div>
                  ) : clientSecret && stripePromise ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#f97316",
                            colorBackground: "#ffffff",
                            colorText: "#0f172a",
                            colorDanger: "#ef4444",
                            fontFamily: "system-ui, sans-serif",
                            borderRadius: "12px",
                          },
                        },
                      }}
                    >
                      <StripeCheckoutForm
                        order={order}
                        onPaymentSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  ) : !stripePublishableKey ? (
                    <div className="rounded-xl bg-red-50 p-4 text-xs text-red-700">
                      Stripe Publishable Key is not configured. Please check your environment variables.
                    </div>
                  ) : null}

                  <Link className="back-link" href="/ClientDashboard/myorders">
                    ← Back to My Orders
                  </Link>
                </>
              )}
            </>
          )}
        </section>
      </main>

      <style jsx global>{`
        .checkout-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          font-family: var(--font-geist-sans), Arial, sans-serif;
        }
        .checkout-main {
          max-width: 620px;
          margin: 0 auto;
          padding: 38px 20px;
        }
        .checkout-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
        }
        .eyebrow {
          margin: 0;
          color: #f97316;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .order-summary-box {
          margin-bottom: 20px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .summary-label {
          font-weight: 800;
          font-size: 15px;
          color: #1e293b;
        }
        .summary-desc {
          margin: 3px 0 0;
          font-size: 12px;
          color: #64748b;
        }
        .summary-amount {
          font-size: 20px;
          font-weight: 900;
          color: #f97316;
        }
        .error-banner {
          margin-bottom: 16px;
          padding: 12px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #b91c1c;
          font-size: 13px;
        }
        .pay-button {
          display: block;
          width: 100%;
          border: 0;
          border-radius: 14px;
          background: #f97316;
          color: #fff;
          padding: 14px;
          text-align: center;
          font: inherit;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
        }
        .pay-button:hover:not(:disabled) {
          background: #ea580c;
          transform: translateY(-1px);
        }
        .pay-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .secondary-button {
          display: block;
          width: 100%;
          border: 1.5px solid #cbd5e1;
          border-radius: 14px;
          background: #fff;
          color: #334155;
          padding: 13px;
          text-align: center;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .secondary-button:hover {
          background: #f1f5f9;
        }
        .back-link {
          display: block;
          margin-top: 18px;
          color: #64748b;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .back-link:hover {
          color: #f97316;
        }
        .confirmation {
          padding: 16px 0;
          text-align: center;
        }
        .success-icon {
          display: grid;
          width: 54px;
          height: 54px;
          place-items: center;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #dcfce7;
          color: #16a34a;
          font-size: 28px;
          font-weight: 800;
          box-shadow: 0 0 0 6px rgba(220, 252, 231, 0.5);
        }
        @media (max-width: 500px) {
          .checkout-main {
            padding: 20px 14px;
          }
          .checkout-card {
            padding: 20px 16px;
          }
        }
        /* Completely hide Stripe developer floating badge */
        iframe[src*="developer"],
        iframe[name*="developer"],
        iframe[src*="assistant"],
        div[class*="StripeDeveloperAssistant"],
        [data-stripe-assistant],
        #__privateStripeAssistant {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Loading secure checkout...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}


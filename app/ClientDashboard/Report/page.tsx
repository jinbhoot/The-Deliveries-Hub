"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import NotificationBell from "@/components/NotificationBell";

type OrderOption = {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
};

export default function ReportPage() {
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Error loading orders for report:", err);
      }
    }
    loadOrders();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!issue) {
      setError("Please select an issue type.");
      return;
    }
    if (description.trim().length < 5) {
      setError("Please describe the issue in at least 5 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: issue,
          message: description.trim(),
          orderId: selectedOrder || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to submit report. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submit report error:", err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="report-page">
      <header className="flex items-center justify-between">
        <div className="brand">
          Delivery Hub<small>Client Report</small>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell theme="light" />
          <Link className="back" href="/ClientDashboard">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main>
        <p className="eyebrow">Help &amp; support</p>
        <h1>Report a delivery issue</h1>
        <p className="intro">
          Tell us what went wrong with your delivery. Our support team will review your report and contact you.
        </p>

        <section className="report-card">
          {submitted ? (
            <div className="success">
              <strong>Report received.</strong>
              <br />
              Your case has been sent to the Delivery Hub support team. We will contact you after reviewing it.
              <div style={{ marginTop: "16px" }}>
                <Link
                  href="/ClientDashboard"
                  style={{
                    display: "inline-block",
                    background: "#166534",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2>Delivery complaint form</h2>

              <div className="field">
                <label htmlFor="orderSelect">Select order (optional)</label>
                <select
                  id="orderSelect"
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                >
                  <option value="">-- General Inquiry / No Order --</option>
                  {orders.map((o) => (
                    <option key={o._id} value={o._id}>
                      Order #{o._id.slice(-6).toUpperCase()} — {o.status} (Rs. {o.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="issue">Issue type</label>
                <select
                  id="issue"
                  name="issue"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                >
                  <option value="">Select an issue</option>
                  <option value="Late delivery">Late delivery</option>
                  <option value="Missing or incorrect items">Missing or incorrect items</option>
                  <option value="Damaged order">Damaged order</option>
                  <option value="Rider behaviour or safety concern">Rider behaviour or safety concern</option>
                  <option value="Payment issue">Payment issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="description">Describe the problem</label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what happened, including the delivery time or affected item."
                />
              </div>

              {error && <p className="error">{error}</p>}

              <button className="submit" type="submit" disabled={submitting}>
                {submitting ? "Submitting report..." : "Send report"}
              </button>
            </form>
          )}
        </section>
      </main>

      <style jsx>{`
        .report-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          font-family: Arial, sans-serif;
        }
        .report-page header {
          padding: 22px 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #fff;
          background: #f97316;
        }
        .brand {
          font-size: 20px;
          font-weight: 800;
        }
        .brand small {
          display: block;
          color: #ffedd5;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 3px;
        }
        .back {
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 999px;
          padding: 9px 14px;
          text-decoration: none;
          font-weight: 700;
          font-size: 13px;
        }
        .report-page main {
          max-width: 1040px;
          margin: auto;
          padding: 42px 24px;
        }
        .eyebrow {
          color: #f97316;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin: 0 0 8px;
        }
        h1 {
          font-size: 30px;
          margin: 0 0 8px;
        }
        .intro {
          color: #64748b;
          margin: 0 0 26px;
        }
        .report-card {
          max-width: 620px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 22px;
        }
        h2 {
          font-size: 18px;
          margin: 0 0 13px;
        }
        .field {
          margin-bottom: 15px;
        }
        .field label {
          display: block;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }
        .field input,
        .field select,
        .field textarea {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          padding: 11px 12px;
          background: #fff;
          color: #0f172a;
          font-size: 14px;
          box-sizing: border-box;
        }
        .field textarea {
          min-height: 115px;
          resize: vertical;
        }
        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          outline: 0;
          border-color: #f97316;
        }
        .submit {
          width: 100%;
          border: 0;
          border-radius: 10px;
          padding: 13px;
          background: #f97316;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .success {
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 12px;
          color: #166534;
          padding: 16px;
          line-height: 1.5;
        }
        .error {
          color: #dc2626;
          font-size: 13px;
          margin: 0 0 12px;
        }
        @media (max-width: 720px) {
          .report-page header {
            padding: 18px;
          }
          .report-page main {
            padding: 30px 18px;
          }
          h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </div>
  );
}


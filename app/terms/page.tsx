import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | Deliveries Hub",
  description: "Comprehensive Terms and Conditions covering delivery charges, delivery timelines, cancellation policy, refund procedures, and user responsibilities.",
};

export default function TermsPage() {
  return (
    <div className="bg-gradient-to-b from-orange-500 to-orange-300 min-h-screen py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <PublicHeader />

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white px-6 sm:px-12 py-12 text-center sm:text-left">
          <span className="inline-block rounded-full bg-white/20 backdrop-blur-xs px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
            Legal Agreement &amp; Operating Policies
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm sm:text-base text-orange-100 max-w-2xl">
            Effective Date: January 1, 2026. Please read these terms carefully before placing orders or operating as a delivery partner on Deliveries Hub.
          </p>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-12 text-gray-800 space-y-10">

          {/* Section 1: Overview & Scope */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">1.</span> Platform Overview &amp; Agreement
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Welcome to <strong>Deliveries Hub</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing our website, registering as a client or rider, or placing an order for food, groceries, or medicine, you agree to be bound by these comprehensive Terms and Conditions. These terms govern all transactions, delivery services, billing models, and interactions facilitated through our platform.
            </p>
          </section>

          {/* Section 2: Delivery Charges and Fee Allocation */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">2.</span> Delivery Charges, Pricing &amp; Fee Structure
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Deliveries Hub operates on a transparent, itemized billing model where every order consists of two distinct components:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 my-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900 text-base mb-1">🛒 Base Bill Amount (Items Subtotal)</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The base bill reflects the direct cost of store items, catalog products, restaurant dishes, or prescription medicines ordered. This amount is accounted for <strong>100% separately</strong> without commission deductions, ensuring merchant item values remain intact.
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5">
                <h3 className="font-bold text-orange-900 text-base mb-1">🛵 Fixed Delivery Charge &amp; Split</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A fixed delivery fee (standard PKR 200–300 depending on distance/zone) is charged per order. This delivery charge is automatically allocated as:
                </p>
                <ul className="mt-2 space-y-1 text-xs font-semibold text-gray-700 list-disc list-inside">
                  <li><strong className="text-blue-700">80% Rider Share:</strong> Directly credited to the assigned delivery rider&apos;s earnings balance.</li>
                  <li><strong className="text-emerald-700">20% Platform Fee:</strong> Retained by Deliveries Hub for platform maintenance and operational support.</li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              * Payment Methods: Users may pay via Cash on Delivery (COD) or Online Card Payment (powered securely by Stripe). All charges are displayed transparently in Pakistani Rupees (PKR) before order submission.
            </p>
          </section>

          {/* Section 3: Delivery Timelines & ETAs */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">3.</span> Delivery Timelines &amp; Estimated Arrival Times (ETA)
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              We strive to deliver orders with optimal speed and care. Our estimated standard turnaround times are:
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-xs">
                <div className="text-2xl mb-1">🍔</div>
                <h3 className="font-bold text-gray-900 text-sm">Food Delivery</h3>
                <p className="text-xs text-orange-600 font-bold mt-1">25 – 45 Minutes</p>
                <p className="text-[11px] text-gray-500 mt-1">Fresh from partner restaurants and hot kitchens.</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-xs">
                <div className="text-2xl mb-1">💊</div>
                <h3 className="font-bold text-gray-900 text-sm">Medicine Delivery</h3>
                <p className="text-xs text-emerald-600 font-bold mt-1">20 – 35 Minutes (Priority)</p>
                <p className="text-[11px] text-gray-500 mt-1">Express dispatch from licensed partner pharmacies.</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-xs">
                <div className="text-2xl mb-1">🛒</div>
                <h3 className="font-bold text-gray-900 text-sm">Grocery Delivery</h3>
                <p className="text-xs text-blue-600 font-bold mt-1">30 – 60 Minutes</p>
                <p className="text-[11px] text-gray-500 mt-1">Carefully packed from leading retail marts.</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-gray-600 space-y-1">
              <p className="font-bold text-gray-800">Live Order Status Progression:</p>
              <p className="font-mono text-[11px] text-gray-700">
                [Placed] → [Accepted by Rider] → [Picked Up from Store] → [On the way] → [Delivered]
              </p>
              <p className="text-gray-500 pt-1">
                Timelines may vary during peak rush hours, inclement weather conditions, or severe road congestion. Customers can track real-time milestones on their dashboard.
              </p>
            </div>
          </section>

          {/* Section 4: Cancellation Policy & Refund Procedures */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">4.</span> Cancellation Policy &amp; Refund Procedures
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">A. Order Cancellation Windows:</h3>
                <ul className="list-disc list-inside text-xs space-y-1 text-gray-600">
                  <li><strong>Prior to Rider Acceptance:</strong> Full cancellation permitted with 100% immediate refund / cancellation of invoice.</li>
                  <li><strong>After Rider Acceptance / Picked Up:</strong> Once items are prepared or dispatched by the vendor, cancellations may incur partial or full charges to cover supplier preparation costs and rider dispatch effort.</li>
                </ul>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">B. Refund Execution &amp; Timelines:</h3>
                <ul className="list-disc list-inside text-xs space-y-1 text-gray-600">
                  <li><strong>Card Payments (Stripe):</strong> Approved refunds are automatically credited back to the original payment card within <strong>3 to 5 business days</strong> depending on your issuing bank.</li>
                  <li><strong>Cash on Delivery (COD):</strong> For defective, expired, or missing items reported upon handover, the bill total is adjusted immediately on-site or resolved via credit voucher.</li>
                  <li><strong>Quality Claims:</strong> Claims for damaged or missing items must be submitted via the <Link href="/ClientDashboard/Report" className="text-orange-600 font-bold underline">Support Reports Portal</Link> or customer helpline within 2 hours of delivery.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: User Account Responsibilities */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">5.</span> User &amp; Rider Account Responsibilities
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="rounded-xl border border-gray-200 p-4 bg-white">
                <h3 className="font-bold text-gray-900 text-sm mb-1.5">👤 Client Responsibilities</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Provide accurate delivery address, phone number, and landmarks.</li>
                  <li>Maintain confidentiality of your account credentials and passwords.</li>
                  <li>Be available at the provided contact number during the delivery window.</li>
                  <li>Treat delivery riders with courtesy and respect during order handovers.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-white">
                <h3 className="font-bold text-gray-900 text-sm mb-1.5">🛵 Rider Partner Code of Conduct</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Provide valid CNIC, vehicle documentation, and undergo identity verification.</li>
                  <li>Maintain prompt communication and timely status updates on the portal.</li>
                  <li>Safeguard food hygiene and package integrity throughout transit.</li>
                  <li>Collect exact invoiced amounts and adhere to road safety laws.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6: Contact & Inquiries */}
          <section className="rounded-2xl bg-orange-50 border border-orange-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Questions regarding our Terms?</h3>
              <p className="text-xs text-gray-600 mt-0.5">Our legal and customer support team is here to assist you 7 days a week.</p>
            </div>
            <Link
              href="/contact"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition shrink-0"
            >
              Contact Support
            </Link>
          </section>

        </div>

        <PublicFooter />
      </div>
    </div>
  );
}

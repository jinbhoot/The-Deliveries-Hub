import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Deliveries Hub",
  description: "Comprehensive Privacy Policy outlining data collection, usage, user rights, data protection standards, and rider privacy practices.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-gradient-to-b from-orange-500 to-orange-300 min-h-screen py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <PublicHeader />

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white px-6 sm:px-12 py-12 text-center sm:text-left">
          <span className="inline-block rounded-full bg-white/20 backdrop-blur-xs px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
            Security &amp; Data Protection
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm sm:text-base text-orange-100 max-w-2xl">
            Last Updated: January 2026. Discover how Deliveries Hub collects, utilizes, safeguards, and respects your personal information and privacy rights.
          </p>
        </div>

        {/* Main Content */}
        <div className="p-6 sm:p-12 text-gray-800 space-y-10">

          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">1.</span> Commitment to Your Privacy
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              At <strong>Deliveries Hub</strong>, we respect your confidentiality and are committed to protecting the privacy of our customers, rider partners, and visitors. This Privacy Policy details the types of personal information we collect, how it is processed to fulfill orders and settlements, and the robust security protocols enacted to safeguard your digital footprint.
            </p>
          </section>

          {/* Section 2: Data Collection */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">2.</span> Information We Collect
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              We collect information strictly necessary to provide dependable delivery services, secure user authentication, and transparent revenue accounting:
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">👤 Client &amp; Customer Information</h3>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>Account Details:</strong> Full name, verified email address, encrypted password.</li>
                  <li><strong>Contact &amp; Delivery:</strong> Mobile phone number, street address, city, drop-off landmarks.</li>
                  <li><strong>Order History:</strong> Purchased items, timestamps, order amounts, and payment method (COD / Card).</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">🛵 Rider Partner Information</h3>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>Identity Verification:</strong> Full name, national identity number (CNIC), contact details.</li>
                  <li><strong>Operational Data:</strong> Profile photo, operational base address, online/offline status.</li>
                  <li><strong>Earnings &amp; Payouts:</strong> Completed delivery count, delivery fee earnings (80% share), and transaction logs.</li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900">
              <strong>💳 Payment Security Note:</strong> For online card payments, credit/debit card numbers are tokenized and processed directly through <strong>Stripe Inc.</strong> (PCI-DSS Level 1 certified). Deliveries Hub never stores raw credit card details on its application servers.
            </div>
          </section>

          {/* Section 3: How We Use Your Data */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">3.</span> How We Use Your Information
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 text-xs text-gray-600">
              <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-xs">
                <h3 className="font-bold text-gray-900 text-sm mb-1">📦 Order Fulfillment</h3>
                <p>Sharing delivery coordinates and contact info with assigned riders to guarantee swift package delivery.</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-xs">
                <h3 className="font-bold text-gray-900 text-sm mb-1">💰 Revenue &amp; Settlements</h3>
                <p>Calculating accurate 80% rider payouts and 20% platform fees, generating invoices, and processing COD handovers.</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-xs">
                <h3 className="font-bold text-gray-900 text-sm mb-1">🛡️ Safety &amp; Anti-Fraud</h3>
                <p>Verifying rider credentials, authenticating logins via JWT tokens, and resolving customer support reports.</p>
              </div>
            </div>
          </section>

          {/* Section 4: User Rights & Choices */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">4.</span> Your Privacy Rights &amp; Choices
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="text-xs leading-relaxed">
                As a user of Deliveries Hub, you retain full ownership and control over your personal data:
              </p>
              <ul className="list-disc list-inside text-xs space-y-1.5 text-gray-600">
                <li><strong>Access &amp; Review:</strong> You can view and edit your profile details, phone number, and address anytime from your Dashboard profile settings.</li>
                <li><strong>Password Reset &amp; Management:</strong> You can reset or update your password directly using our verified email reset tool on the <Link href="/login" className="text-orange-600 font-bold underline">Login Page</Link>.</li>
                <li><strong>Account Deletion:</strong> You may request complete account deactivation and removal of your personal profile by contacting our privacy officer at <span className="font-mono text-gray-800">privacy@deliverieshub.pk</span>.</li>
                <li><strong>No Third-Party Data Selling:</strong> We never sell, rent, or monetize your personal information to third-party advertisers.</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Technical Security & Cookies */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="text-orange-500">5.</span> Security Standards &amp; Cookie Usage
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Deliveries Hub incorporates industry-standard security measures including:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-bold text-gray-900 text-sm mb-1">🔐 Data Encryption</h3>
                <p>All passwords are encrypted with bcrypt salt hashing. Communication between your browser and our servers is secured over HTTPS / TLS 1.3 encryption.</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-bold text-gray-900 text-sm mb-1">🍪 Essential Cookies</h3>
                <p>We use strictly necessary httpOnly session cookies to maintain your authenticated login state securely without exposing sensitive tokens to browser scripts.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Contact Privacy Team */}
          <section className="rounded-2xl bg-orange-50 border border-orange-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Have questions about your data?</h3>
              <p className="text-xs text-gray-600 mt-0.5">Contact our Data Privacy and Compliance team for prompt assistance.</p>
            </div>
            <Link
              href="/contact"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition shrink-0"
            >
              Reach Privacy Desk
            </Link>
          </section>

        </div>

        <PublicFooter />
      </div>
    </div>
  );
}

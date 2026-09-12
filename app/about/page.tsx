import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import Link from "next/link";

export const metadata = {
  title: "About Us | Deliveries Hub",
  description: "Learn about Deliveries Hub - our origin story, mission to empower delivery riders with fair earnings, and commitment to fast doorstep deliveries in Pakistan.",
};

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-orange-500 to-orange-300 min-h-screen py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <PublicHeader />

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white px-6 sm:px-12 py-14 text-center sm:text-left">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block rounded-full bg-white/20 backdrop-blur-xs px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                Our Story &amp; Mission
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Empowering Local Deliveries Across Pakistan
              </h1>
              <p className="mt-3 text-sm sm:text-base text-orange-100 leading-relaxed">
                We connect neighborhood restaurants, essential pharmacies, and trusted supermarkets with fast, transparent delivery riders dedicated to serving your everyday needs.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                <Link
                  href="/signup"
                  className="bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition"
                >
                  Start Ordering
                </Link>
                <Link
                  href="/signup/signasrider"
                  className="bg-orange-700/60 hover:bg-orange-700 text-white border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold transition"
                >
                  Become a Rider
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <img
                src="/rider%20pic.png"
                alt="Deliveries Hub Fleet Rider"
                loading="lazy"
                decoding="async"
                className="w-full max-w-sm h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="bg-slate-900 text-white py-8 px-6 sm:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-orange-400">10,000+</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Orders Delivered</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">500+</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Verified Riders</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-400">80%</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Rider Fee Share</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400">30 Mins</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Average ETA</p>
            </div>
          </div>
        </div>

        {/* Main Body Content */}
        <div className="p-6 sm:p-12 text-gray-800 space-y-12">

          {/* Section 1: The Deliveries Hub Story */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">How Deliveries Hub Began</h2>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600">
              Deliveries Hub was born out of a simple, crucial observation: modern urban living demands dependable, ultra-fast delivery, but existing platforms often impose high hidden fees on consumers while under-compensating the hardworking riders on the road.
            </p>
            <p className="text-sm leading-relaxed text-gray-600">
              We set out to build a platform that bridges this gap with complete transparency. By uniting <strong>Food, Groceries, and Medicine</strong> into a single intuitive digital dashboard, we created a seamless ordering experience backed by real-time tracking and honest pricing.
            </p>
          </section>

          {/* Section 2: Our Core Mission */}
          <section className="rounded-3xl bg-orange-50/70 border border-orange-200 p-6 sm:p-10 space-y-4">
            <h2 className="text-2xl font-bold text-orange-950">Our Mission &amp; Purpose</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Our mission is twofold:
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-orange-100">
                <div className="text-2xl mb-2">🤝</div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Rider Empowerment (80/20 Rule)</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We believe riders are the true backbone of on-demand logistics. That is why <strong>80% of every delivery fee</strong> goes directly into the rider&apos;s take-home earnings, ensuring dignity, sustainable income, and motivated service.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-xs border border-orange-100">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Customer Dependability &amp; Speed</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Whether you need emergency medicine at night, fresh milk and groceries in the morning, or hot biryani for dinner, Deliveries Hub ensures your parcel arrives quickly, safely, and without inflated item markups.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Core Pillars */}
          <section className="space-y-6">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">What Drives Us Every Day</h2>
              <p className="text-xs text-gray-500 mt-1">Our four non-negotiable operational pillars</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-gray-200 p-5 bg-white shadow-xs hover:border-orange-400 transition">
                <span className="text-3xl block mb-2">🚀</span>
                <h3 className="font-bold text-gray-900 text-sm">Swift Delivery</h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Intelligent order routing to nearby active riders to minimize wait times across all sectors.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 bg-white shadow-xs hover:border-orange-400 transition">
                <span className="text-3xl block mb-2">💎</span>
                <h3 className="font-bold text-gray-900 text-sm">Zero Hidden Fees</h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Store item costs are 100% separated from delivery fees. You always know exactly where every rupee goes.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 bg-white shadow-xs hover:border-orange-400 transition">
                <span className="text-3xl block mb-2">🛡️</span>
                <h3 className="font-bold text-gray-900 text-sm">Verified Partners</h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Every rider undergoes CNIC identity checks, and all merchant catalogs feature genuine, authentic products.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 bg-white shadow-xs hover:border-orange-400 transition">
                <span className="text-3xl block mb-2">📱</span>
                <h3 className="font-bold text-gray-900 text-sm">Live Transparency</h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Instant live order status updates and interactive client and rider dashboards designed for all screen sizes.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Join the Movement CTA */}
          <section className="rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 p-8 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Ready to experience seamless delivery?</h3>
              <p className="text-xs sm:text-sm text-orange-100 mt-1">Join thousands of happy clients or start earning as an approved partner rider today.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/signup"
                className="bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-xl text-xs font-bold shadow transition"
              >
                Order Now
              </Link>
              <Link
                href="/contact"
                className="bg-black/40 hover:bg-black/60 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition border border-white/20"
              >
                Contact Us
              </Link>
            </div>
          </section>

        </div>

        <PublicFooter />
      </div>
    </div>
  );
}

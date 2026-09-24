
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "The Deliveries Hub",
};

export default function HomePage() {
  return (
    <>
      {/* Component-scoped hover styles (equivalent to the <style> block) */}
      <style>{`
        #service-cards > div,
        #workflow-cards > div,
        #benefit-cards > div {
          transition: transform 250ms ease, background-color 250ms ease, box-shadow 250ms ease;
        }

        #service-cards > div:hover,
        #workflow-cards > div:hover,
        #benefit-cards > div:hover {
          background-color: #fb923c;
          box-shadow: 0 12px 24px rgba(194, 65, 12, 0.28);
          transform: translateY(-6px);
        }
      `}</style>

      <div className="bg-gradient-to-b from-orange-500 to-orange-300 min-h-screen">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6 mb-10 overflow-hidden">

          {/* Nav */}
          <div className="flex justify-between items-center px-6 py-4">
            <Logo href="/" size="sm" showText={true} />

            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
              <Link href="/about" className="hover:text-orange-500 transition">About</Link>
              <Link href="/terms" className="hover:text-orange-500 transition">Terms</Link>
              <Link href="/privacy" className="hover:text-orange-500 transition">Privacy</Link>
              <Link href="/contact" className="hover:text-orange-500 transition">Contact</Link>
            </nav>

            <div className="space-x-3">
              <button className="bg-orange-500 text-white px-4 py-2 rounded-md">
                <Link href="/signup">Signup</Link>
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                <Link href="/login">Login</Link>
              </button>
            </div>
          </div>

          {/* Hero */}
          <div className="grid md:grid-cols-2 gap-6 items-center px-6 py-10">
            <div>
              <h2 className="text-4xl font-bold leading-snug">
                Fast & Reliable
                <br />
                Delivery at Your <br />
                Doorstep
              </h2>
              <p className="mt-4 text-gray-600">Food • Groceries • Medicine</p>
            </div>

            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/rider pic.png"
                alt="Delivery Rider"
                loading="lazy"
                decoding="async"
                className="w-full max-w-sm md:max-w-md lg:max-w-lg h-auto"
              />
            </div>
          </div>

          {/* Service cards */}
          <div id="service-cards" className="grid md:grid-cols-3 gap-6 px-6 py-6">
            <div className="border rounded-xl p-4 text-center shadow-sm">
              <div className="text-4xl mb-2">🍔</div>
              <h3 className="font-bold">Food Delivery</h3>
              <p className="text-sm text-gray-500">Fresh meals in minutes</p>
            </div>

            <div className="border rounded-xl p-4 text-center shadow-sm">
              <div className="text-4xl mb-2">🛒</div>
              <h3 className="font-bold">Grocery Delivery</h3>
              <p className="text-sm text-gray-500">Fresh groceries delivered</p>
            </div>

            <div className="border rounded-xl p-4 text-center shadow-sm">
              <div className="text-4xl mb-2">💊</div>
              <h3 className="font-bold">Medicine Delivery</h3>
              <p className="text-sm text-gray-500">Prescription medication</p>
            </div>
          </div>

          {/* How it works */}
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>

            <div id="workflow-cards" className="grid md:grid-cols-3 gap-6 px-6">
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <h3 className="font-semibold">Place Order</h3>
                <p className="text-sm text-gray-500">Choose items & location</p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">🛵</div>
                <h3 className="font-semibold">Rider Accepts</h3>
                <p className="text-sm text-gray-500">Nearby rider picks the order</p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">📦</div>
                <h3 className="font-semibold">Get Delivered</h3>
                <p className="text-sm text-gray-500">Real-time tracking</p>
              </div>
            </div>
          </div>

          {/* Benefit cards */}
          <div id="benefit-cards" className="grid md:grid-cols-4 gap-6 px-6 pb-10">
            <div className="border rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold">Fast Delivery</h4>
              <p className="text-sm text-gray-500">Quick and on-time services</p>
            </div>

            <div className="border rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl mb-2">🔐</div>
              <h4 className="font-semibold">Secure Payments</h4>
              <p className="text-sm text-gray-500">Safe & encrypted payments</p>
            </div>

            <div className="border rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl mb-2">📍</div>
              <h4 className="font-semibold">Real-time Tracking</h4>
              <p className="text-sm text-gray-500">Track your deliveries</p>
            </div>

            <div className="border rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl mb-2">👤</div>
              <h4 className="font-semibold">Trusted Riders</h4>
              <p className="text-sm text-gray-500">Verified & experienced riders</p>
            </div>
          </div>

          {/* Testimonials */}
          <section className="py-12 bg-orange-500">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-center text-white mb-8">
                What Our Customers Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-extrabold text-2xl mb-4 border-2 border-orange-100 shadow-inner">
                    AK
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-400 mb-2">★★★★★</div>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    &quot;Super fast grocery delivery! Got my items within 20 minutes. Highly recommended.&quot;
                  </p>
                  <h4 className="font-semibold text-gray-800 text-sm">- Ahmed Khan</h4>
                  <p className="text-xs text-gray-400">Karachi, Pakistan</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white font-extrabold text-2xl mb-4 border-2 border-rose-100 shadow-inner">
                    SA
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-400 mb-2">★★★★★</div>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    &quot;The medicine delivery feature saved me during an emergency late at night. Amazing service!&quot;
                  </p>
                  <h4 className="font-semibold text-gray-800 text-sm">- Sara Ali</h4>
                  <p className="text-xs text-gray-400">Lahore, Pakistan</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-2xl mb-4 border-2 border-blue-100 shadow-inner">
                    UT
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-400 mb-2">★★★★★</div>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    &quot;Real-time tracking is very accurate. The rider was polite and followed safety protocols.&quot;
                  </p>
                  <h4 className="font-semibold text-gray-800 text-sm">- Usman Tariq</h4>
                  <p className="text-xs text-gray-400">Islamabad, Pakistan</p>
                </div>

              </div>
            </div>
          </section>

          {/* Partner brands */}
          <section className="py-12 bg-white border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  Our Trusted Partners in Sheikhupura
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  We collaborate with the best local and national brands to serve you faster.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-center">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center h-24 hover:shadow-md transition-shadow grayscale hover:grayscale-0">
                  <span className="font-bold text-gray-700 text-lg tracking-wider">METRO</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center h-24 hover:shadow-md transition-shadow grayscale hover:grayscale-0">
                  <span className="font-bold text-red-600 text-lg tracking-wider">IMTIAZ</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center h-24 hover:shadow-md transition-shadow grayscale hover:grayscale-0">
                  <span className="font-bold text-emerald-600 text-lg tracking-wider">Servaid</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center h-24 hover:shadow-md transition-shadow grayscale hover:grayscale-0">
                  <span className="font-bold text-red-700 text-lg tracking-wider">KFC</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center h-24 hover:shadow-md transition-shadow grayscale hover:grayscale-0">
                  <span className="font-bold text-amber-500 text-lg tracking-wider">McDonald&apos;s</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-center h-24 hover:shadow-md transition-shadow grayscale hover:grayscale-0">
                  <span className="font-bold text-blue-800 text-lg tracking-wider">Carrefour</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA banner */}
          <section className="py-12 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white">
            <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Order Online with Deliveries Hub</h2>
                <p className="text-orange-100 text-sm">
                  Place and track your food, grocery, and medicine orders directly from your browser.
                </p>
              </div>
              <div className="hidden">
                <div className="border border-orange-300 bg-orange-600/30 px-4 py-2 rounded-lg text-sm font-medium">
                  No download required — order online anytime
                </div>
              </div>
              <div className="hidden">
                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-gray-800 transition">
                  <span>App Store</span>
                </button>
                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-gray-800 transition">
                  <span>▶ Google Play</span>
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-gray-300 py-10">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="mb-3">
                  <Logo href="/" size="sm" showText={true} textColor="white" />
                </div>
                <p className="text-sm text-gray-400">
                  Your ultimate partner for food, groceries, and medicine delivered right to your doorstep.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Careers & Drivers</Link></li>
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/contact" className="hover:text-white transition">Help Center</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">Safety & Fees</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
                </ul>
              </div>

              <div className="text-left">
                <h4 className="text-white font-semibold text-sm mb-3">Connect With Us</h4>
                <div className="flex justify-start space-x-4 text-xl">
                  <a href="#" aria-label="Facebook" className="hover:text-orange-400 transition">
                    <i className="fa fa-facebook" aria-hidden="true"></i>
                  </a>
                  <a href="#" aria-label="Instagram" className="hover:text-orange-400 transition">
                    <i className="fa fa-instagram" aria-hidden="true"></i>
                  </a>
                  <a href="#" aria-label="Twitter" className="hover:text-orange-400 transition">
                    <i className="fa fa-twitter" aria-hidden="true"></i>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="hover:text-orange-400 transition">
                    <i className="fa fa-linkedin" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 text-center pt-6 text-xs text-gray-500">
              © 2026 Deliveries Hub. All rights reserved.
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-orange-500 text-white p-1.5 rounded-md text-sm">🔒</div>
            <h3 className="text-white font-black text-lg tracking-tight">Deliveries Hub</h3>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Pakistan&apos;s trusted on-demand delivery platform for fresh food, daily groceries, and essential medicines.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-orange-400 font-semibold">
            <span>🛵 500+ Verified Riders</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition">Home</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition">About Us</Link>
            </li>
            <li>
              <Link href="/signup/signasrider" className="hover:text-orange-400 transition font-medium">Join as Rider</Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-orange-400 transition font-medium">Client Registration</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Legal & Support</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition">Contact & Help Center</Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition">Account Login</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Get in Touch</h4>
          <p className="text-xs text-gray-400 mb-2">Available 7 days a week for active order support & inquiries.</p>
          <div className="space-y-1.5 text-xs text-gray-300">
            <p><strong className="text-white">Email:</strong> support@deliverieshub.pk</p>
            <p><strong className="text-white">Helpline:</strong> +92 (300) 123-4567</p>
            <p><strong className="text-white">Operations:</strong> Lahore &amp; Islamabad, PK</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center pt-6 text-xs text-gray-500 max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-2">
        <p>© {new Date().getFullYear()} Deliveries Hub. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-gray-400">Terms</Link>
          <Link href="/privacy" className="hover:text-gray-400">Privacy</Link>
          <Link href="/contact" className="hover:text-gray-400">Support</Link>
        </div>
      </div>
    </footer>
  );
}

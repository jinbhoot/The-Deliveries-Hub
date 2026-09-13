import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

export default function NotFound() {
  return (
    <div className="bg-gradient-to-b from-orange-500 to-orange-300 min-h-screen py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[85vh]">
        <PublicHeader />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">??</div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-100 px-3 py-1 rounded-full mb-3">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            The delivery route or page you are looking for does not exist or has been moved.
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs"
            >
              Back to Home
            </Link>
            <Link
              href="/ClientDashboard"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-5 py-2.5 rounded-xl transition"
            >
              Client Dashboard
            </Link>
          </div>
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}


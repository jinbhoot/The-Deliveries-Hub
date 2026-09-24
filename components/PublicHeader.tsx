"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Logo from "@/components/Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact Us" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="flex items-center justify-between px-6 py-3.5">
        <Logo href="/" size="sm" showText={true} />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/terms" && pathname === "/terms-and-conditions") ||
              (item.href === "/privacy" && pathname === "/privacy-policy") ||
              (item.href === "/about" && pathname === "/about-us") ||
              (item.href === "/contact" && pathname === "/contact-us");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-orange-50 text-orange-600 font-bold"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
          >
            Signup
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition"
          aria-label="Toggle menu"
        >
          <span className="text-2xl font-bold">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Link
              href="/login"
              className="flex-1 text-center bg-blue-600 text-white py-2 rounded-xl text-sm font-bold"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center bg-orange-500 text-white py-2 rounded-xl text-sm font-bold"
            >
              Signup
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

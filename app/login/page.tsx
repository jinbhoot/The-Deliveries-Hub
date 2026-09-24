"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset Password State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      const role = result.data.role as "client" | "rider" | "admin";
      const destination =
        role === "client" ? "/ClientDashboard" : role === "rider" ? "/RiderDashboard" : "/adminDashboard";

      router.push(destination);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (!resetEmail.trim()) {
      setResetError("Please enter your registered email address.");
      return;
    }

    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetError("New password must be at least 6 characters long.");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail.trim(),
          newPassword: resetNewPassword,
          confirmPassword: resetConfirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setResetError(result.message || "Failed to reset password.");
        setResetLoading(false);
        return;
      }

      setResetSuccess("Password has been reset successfully! You can now log in.");
      setEmail(resetEmail.trim());
      setResetNewPassword("");
      setResetConfirmPassword("");
    } catch {
      setResetError("Network error. Could not connect to server.");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-sm w-full mx-auto relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <Logo href="/" size="xs" showText={true} />

          <div className="text-xs sm:text-sm text-gray-500 space-x-2 sm:space-x-3">
            <Link href="/" className="hover:text-orange-500 transition">Home</Link>
            <Link href="/about" className="hover:text-orange-500 transition">About</Link>
            <Link href="/contact" className="hover:text-orange-500 transition">Contact</Link>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <img
            src="/rider%20pic.png"
            alt="Delivery Rider"
            loading="lazy"
            decoding="async"
            className="w-36 h-auto object-contain"
          />
        </div>

        {!isResetOpen ? (
          /* =================== LOGIN FORM =================== */
          <>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              Welcome Back
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Sign in to your Client, Rider, or Admin account.
            </p>

            {resetSuccess && (
              <div role="status" className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800">
                ✅ {resetSuccess}
              </div>
            )}

            {error && (
              <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-orange-500 focus:outline-none transition"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm focus:border-orange-500 focus:outline-none transition"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs my-4">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetOpen(true);
                    setResetEmail(email);
                    setResetError("");
                    setResetSuccess("");
                  }}
                  className="text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-60 shadow cursor-pointer"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-5">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-orange-600 font-bold hover:underline">
                Signup as Client
              </Link>{" "}
              or{" "}
              <Link href="/signup/signasrider" className="text-orange-600 font-bold hover:underline">
                Join as Rider
              </Link>
            </p>
          </>
        ) : (
          /* =================== RESET PASSWORD FORM =================== */
          <>
            <h2 className="text-2xl font-bold mb-1 text-gray-900">
              Reset Password
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Enter your registered email and choose a new password.
            </p>

            {resetSuccess && (
              <div role="status" className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800">
                ✅ {resetSuccess}
              </div>
            )}

            {resetError && (
              <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-700">
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetSubmit}>
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@example.com"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none transition"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={resetNewPassword}
                      onChange={(event) => setResetNewPassword(event.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm focus:border-orange-500 focus:outline-none transition"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-3 text-xs font-semibold text-gray-500 hover:text-gray-700"
                    >
                      {showResetPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showResetPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={resetConfirmPassword}
                    onChange={(event) => setResetConfirmPassword(event.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none transition"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-60 shadow cursor-pointer text-sm"
                >
                  {resetLoading ? "Resetting Password..." : "Set New Password"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetOpen(false);
                    setResetError("");
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition text-xs cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}


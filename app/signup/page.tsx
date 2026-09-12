"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleClientSignup() {
    setError("");
    setSuccess("");

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms & Conditions and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div>
        <div className="bg-white rounded-3xl shadow-xl p-6 max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 text-white p-2 rounded-md">
                🔒
              </div>
              <span className="font-bold">Deliveries Hub</span>
            </div>

            <div className="text-sm text-gray-500 space-x-3">
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
          </div>

          <h2 className="text-2xl font-bold">Create Your Account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Food • Groceries • minutes
          </p>

          {error && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border rounded-lg px-4 py-3 pr-10"
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <input type="radio" />
              </span>
            </div>

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div className="flex gap-3 my-4">
            <button
              className="flex-1 border bg-orange-500  hover:bg-white hover:text-gray-500  text-white py-2 rounded-lg disabled:opacity-60"
              onClick={handleClientSignup}
              disabled={loading}
              type="button"
            >
              {loading ? "Creating..." : "Signup as Client"}
            </button>
            <button
              className="flex-1 border bg-orange-500  hover:bg-white hover:text-gray-500 text-white py-2 rounded-lg"
              onClick={() => (window.location.href = "/signup/signasrider")}
              type="button"
            >
              Signup as Rider
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm mb-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>
              I agree to Terms &amp; Conditions and Privacy Policy
            </span>
          </div>

          <button
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
            onClick={handleClientSignup}
            disabled={loading}
            type="button"
          >
            {loading ? "Please wait..." : "Signup"}
          </button>
        </div>
      </div>
    </div>
  );
}

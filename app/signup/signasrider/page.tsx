"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RiderSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/register/rider", {
        method: "POST",
        body: formData, // multipart/form-data, browser sets the boundary header
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(result.message || "Rider account created. Awaiting admin approval.");
      setLoading(false);
      event.currentTarget.reset();
      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 max-w-sm mx-auto w-full">

        {/* Top Header */}
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

        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-6">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Rider Sign Up
            </h1>
            <p className="text-gray-500 text-sm">
              Create your rider account
            </p>
          </div>

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

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                minLength={2}
                placeholder="Enter full name"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-sm font-medium mb-1">
                CNIC No
              </label>
              <input
                type="text"
                name="cnic"
                required
                pattern="\d{5}-\d{7}-\d{1}"
                title="Format: XXXXX-XXXXXXX-X"
                placeholder="XXXXX-XXXXXXX-X"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="example@email.com"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="********"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Address
              </label>
              <textarea
                name="address"
                required
                minLength={3}
                rows={2}
                placeholder="Enter complete address"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="w-full border rounded-lg px-3 py-2 bg-white"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Rider Account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-orange-500 font-semibold">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type RiderProfileData = {
  _id: string;
  cnic: string;
  address: string;
  status: "Pending" | "Approved" | "Blocked";
  online: boolean;
  profileImage?: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<RiderProfileData | null>(null);

  // Editable Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [online, setOnline] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwdNotice, setPwdNotice] = useState("");
  const [pwdError, setPwdError] = useState("");

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPwdNotice("");
    setPwdError("");

    if (!currentPassword) {
      setPwdError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPwdError(data.message || "Failed to update password.");
        return;
      }

      setPwdNotice("Your password has been changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPwdError("Network error. Could not connect to server.");
    } finally {
      setChangingPassword(false);
    }
  }

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/riders/me");
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setProfile(data.data);
          setFullName(data.data.user?.fullName || "");
          setPhone(data.data.user?.phone || "");
          setAddress(data.data.address || "");
          setProfileImage(data.data.profileImage || "");
          setOnline(Boolean(data.data.online));
        } else {
          setError(data.message || "Failed to load rider profile.");
        }
      } catch (err) {
        console.error("Error loading rider profile:", err);
        setError("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size should be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
        setNotice("New profile image selected. Click 'Save changes' to apply.");
      }
    };
    reader.readAsDataURL(file);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }
    if (!phone.trim()) {
      setError("Please provide a valid phone number.");
      return;
    }
    if (!address.trim() || address.trim().length < 3) {
      setError("Please provide a valid address.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/riders/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          profileImage,
          online,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to update profile.");
        setSaving(false);
        return;
      }

      setNotice("Profile updated successfully!");
      setProfile(data.data);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "RD";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile & Settings</h1>
        <p className="mt-1 text-orange-100">
          Update your personal details, photo, contact number, and account password.
        </p>
      </div>

      {notice && (
        <div role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {notice}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow">
          Loading profile...
        </div>
      ) : profile ? (
        <>
          {/* Main Profile Info Form */}
          <form onSubmit={saveProfile} className="grid gap-5 rounded-2xl bg-white p-6 shadow sm:grid-cols-2">
            {/* Photo & Status */}
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-500 font-bold text-white text-xl shadow-inner">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Rider profile"
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                  ) : (
                    getInitials(fullName || profile.user?.fullName)
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">{fullName || profile.user?.fullName}</p>
                  <label className="mt-1 inline-block cursor-pointer rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    profile.status === "Approved"
                      ? "bg-green-100 text-green-800"
                      : profile.status === "Blocked"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Status: {profile.status}
                </span>
              </div>
            </div>

            {/* Full Name (Editable) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700" htmlFor="rider-fullname">
                Full Name
              </label>
              <input
                id="rider-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Phone Number (Editable) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700" htmlFor="rider-phone">
                Phone Number
              </label>
              <input
                id="rider-phone"
                type="tel"
                required
                placeholder="e.g. 0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* CNIC (Protected / Read-only) */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                <span>CNIC Number</span>
                <span className="text-[10px] font-semibold text-gray-400">Locked</span>
              </label>
              <input
                disabled
                value={profile.cnic || ""}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-mono text-gray-600 outline-none cursor-not-allowed"
                title="CNIC cannot be changed after registration."
              />
            </div>

            {/* Email Address (Protected / Read-only) */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                <span>Email Address</span>
                <span className="text-[10px] font-semibold text-gray-400">Locked</span>
              </label>
              <input
                disabled
                value={profile.user?.email || ""}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600 outline-none cursor-not-allowed"
                title="Email address is linked to your login account."
              />
            </div>

            {/* Operating Area / Address (Editable) */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700" htmlFor="rider-address">
                Operating Area / Base Address
              </label>
              <textarea
                id="rider-address"
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Model Town, Lahore"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Online Availability Toggle */}
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-orange-50/60 border border-orange-200 p-4">
              <div>
                <p className="font-bold text-gray-900">Rider Availability</p>
                <p className="text-xs text-gray-600">Toggle whether you are currently online and available to receive orders.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={online}
                  onChange={(e) => setOnline(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
              </label>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto rounded-lg bg-orange-500 px-6 py-2.5 font-bold text-white hover:bg-orange-600 disabled:opacity-60 transition shadow cursor-pointer"
              >
                {saving ? "Saving changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>

          {/* Security & Password Change Card */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Security & Password</h2>
              <p className="text-xs text-gray-500">Update your account login password.</p>
            </div>

            {pwdNotice && (
              <div role="status" className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800">
                ✅ {pwdNotice}
              </div>
            )}

            {pwdError && (
              <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-700">
                {pwdError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="rounded text-orange-500"
                  />
                  Show Passwords
                </label>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition shadow cursor-pointer"
                >
                  {changingPassword ? "Updating Password..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  sender?: {
    fullName?: string;
    email?: string;
    role?: string;
  };
};

function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (seconds < 30) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case "ORDER_ACCEPTED":
      return "??";
    case "PAYMENT_REQUESTED":
      return "??";
    case "PAYMENT_RECEIVED":
      return "??";
    case "RIDER_APPROVED":
      return "??";
    case "RIDER_BLOCKED":
      return "??";
    case "ORDER_PICKED_UP":
      return "???";
    case "ORDER_ON_THE_WAY":
      return "??";
    case "ORDER_DELIVERED":
      return "??";
    case "ORDER_CANCELLED":
      return "?";
    case "NEW_ORDER":
      return "??";
    default:
      return "??";
  }
}

export default function NotificationBell({
  theme = "light",
  className = "",
}: {
  theme?: "light" | "dark" | "orange";
  className?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  const prevIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const fetched = json.data as NotificationItem[];
        setNotifications(fetched);
        setUnreadCount(json.unreadCount || 0);

        // Check for brand new incoming notifications to trigger live toast
        if (!isFirstLoadRef.current) {
          const newItems = fetched.filter((item) => !prevIdsRef.current.has(item._id) && !item.read);
          if (newItems.length > 0) {
            const latest = newItems[0];
            setActiveToast(latest);
            playChimeSound();

            // Native browser push notification if permitted
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(latest.title, {
                  body: latest.message,
                  icon: "/favicon.ico",
                });
              } catch {
                // Ignore browser notification error
              }
            }
          }
        }

        // Update tracking set
        prevIdsRef.current = new Set(fetched.map((n) => n._id));
        isFirstLoadRef.current = false;
      }
    } catch {
      // Silently ignore polling network errors
    }
  }

  // Polling interval
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 7000);
    return () => clearInterval(interval);
  }, []);

  // Request browser notification permission
  function requestPushPermission() {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }

  async function handleMarkAllAsRead() {
    setLoading(true);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleNotificationClick(notif: NotificationItem) {
    if (!notif.read) {
      fetch(`/api/notifications/${notif._id}`, { method: "PATCH" }).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  }

  // Toast Auto-dismiss
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          requestPushPermission();
        }}
        className={`relative p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
          theme === "orange"
            ? "bg-orange-600/20 text-orange-100 hover:bg-orange-600/40 hover:text-white"
            : theme === "dark"
            ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
        }`}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        title="Notifications"
      >
        <span className="text-lg leading-none select-none">??</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* In-App Floating Toast Alert */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-2xl shadow-2xl border-2 border-orange-500 p-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <span className="text-2xl p-2 bg-orange-100 rounded-xl">
              {getNotificationIcon(activeToast.type)}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 leading-tight">
                {activeToast.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {activeToast.message}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {activeToast.link && (
                  <button
                    type="button"
                    onClick={() => {
                      handleNotificationClick(activeToast);
                      setActiveToast(null);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition"
                  >
                    View Details ?
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  className="text-[11px] text-gray-400 hover:text-gray-600 font-medium px-2 py-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold"
            >
              ?
            </button>
          </div>
        </div>
      )}

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 text-left">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={loading}
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-bold transition disabled:opacity-50 cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                <span className="text-3xl block mb-2">??</span>
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-orange-50/50 transition cursor-pointer ${
                    !notif.read ? "bg-orange-50/25" : "bg-white"
                  }`}
                >
                  <span className="text-xl shrink-0 p-1.5 rounded-xl bg-gray-100">
                    {getNotificationIcon(notif.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-bold truncate ${!notif.read ? "text-gray-900" : "text-gray-700"}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-tight line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="size-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
              <span className="text-[10px] text-gray-400">
                Real-time updates enabled
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


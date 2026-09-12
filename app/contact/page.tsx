"use client";

import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

export default function ContactPage() {
  const contactChannels = [
    {
      icon: "📞",
      title: "Customer Helpline",
      value: "+92 (300) 123-4567",
      badge: "8:00 AM – 2:00 AM",
      badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
      description: "Live agent assistance daily for immediate general inquiries and customer support.",
      accentBorder: "hover:border-orange-500",
    },
    {
      icon: "💬",
      title: "WhatsApp Instant Chat",
      value: "+92 (321) 987-6543",
      badge: "Instant Messaging",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      description: "Fast messaging and real-time coordination for live delivery tracking and updates.",
      accentBorder: "hover:border-emerald-500",
    },
    {
      icon: "✉️",
      title: "Email Helpdesk",
      value: "support@deliverieshub.pk",
      badge: "24/7 Ticket Queue",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      description: "Comprehensive resolution for billing inquiries, corporate partnerships, and service feedback.",
      accentBorder: "hover:border-blue-500",
    },
    {
      icon: "🛵",
      title: "Rider Support Desk",
      value: "riders@deliverieshub.pk",
      badge: "Rider Operations",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
      description: "Dedicated assistance for onboarding, CNIC verification, fleet issues, and earnings settlement.",
      accentBorder: "hover:border-purple-500",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-orange-500 to-orange-300 min-h-screen py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[85vh]">
        <PublicHeader />

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white px-6 sm:px-12 py-12 text-center sm:text-left">
          <span className="inline-block rounded-full bg-white/20 backdrop-blur-xs px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
            24/7 Dedicated Support &amp; Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Contact &amp; Help Center
          </h1>
          <p className="mt-2 text-sm sm:text-base text-orange-100 max-w-2xl">
            Have a question about a delivery, rider onboarding, or general inquiries? Connect directly with our team through any of our official support channels below.
          </p>
        </div>

        {/* Main Content Area - 4 Support Channels */}
        <div className="flex-1 p-6 sm:p-12 text-gray-800 flex flex-col justify-center">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Official Communication Channels</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Reach out through our customer representatives, dispatch teams, or rider coordinators.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactChannels.map((channel, idx) => (
              <div
                key={idx}
                className={`rounded-3xl border border-gray-200 bg-gray-50/80 p-6 flex flex-col justify-between shadow-xs transition-all duration-200 hover:bg-white hover:shadow-lg ${channel.accentBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl p-2.5 rounded-2xl bg-white shadow-xs border border-gray-100">
                      {channel.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${channel.badgeColor}`}>
                      {channel.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-base mb-1">
                    {channel.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-bold text-orange-600 break-all mb-2">
                    {channel.value}
                  </p>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    {channel.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}

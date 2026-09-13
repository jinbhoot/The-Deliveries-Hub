// Deliveries Hub - Service Worker for Background Web Push Notifications

self.addEventListener("install", (event) => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: "Deliveries Hub",
        body: event.data.text(),
      };
    }
  }

  const title = data.title || "Deliveries Hub";
  const options = {
    body: data.body || data.message || "New notification received.",
    icon: data.icon || "/images.jpeg",
    badge: data.badge || "/images.jpeg",
    vibrate: [200, 100, 200],
    data: data.data || { url: data.url || "/ClientDashboard" },
    tag: data.tag || `deliveries-hub-${Date.now()}`,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    (event.notification.data && event.notification.data.url)
      ? event.notification.data.url
      : "/ClientDashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an open window exists on this origin, focus and navigate it
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client && targetUrl) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

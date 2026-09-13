import webpush from "web-push";
import { connectDB } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import mongoose from "mongoose";

let isVapidConfigured = false;

export function configureWebPush() {
  if (isVapidConfigured) return true;

  const subject = process.env.VAPID_SUBJECT || "mailto:support@deliverieshub.pk";
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn("VAPID keys are missing. Web push notifications are disabled.");
    return false;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    isVapidConfigured = true;
    return true;
  } catch (err) {
    console.error("Failed to configure WebPush VAPID details:", err);
    return false;
  }
}

export interface PushNotificationPayload {
  title: string;
  message: string;
  link?: string;
  icon?: string;
  badge?: string;
  type?: string;
}

export async function sendWebPushNotification(
  userId: string | mongoose.Types.ObjectId | Record<string, unknown>,
  payload: PushNotificationPayload
) {
  try {
    if (!configureWebPush()) return;

    await connectDB();
    const rawId =
      typeof userId === "object" && userId !== null && "_id" in userId
        ? (userId as { _id: mongoose.Types.ObjectId | string })._id
        : userId;

    const userObjectId =
      typeof rawId === "string" ? new mongoose.Types.ObjectId(rawId) : rawId;

    const subscriptions = await PushSubscription.find({ user: userObjectId });
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.message,
      icon: payload.icon || "/images.jpeg",
      badge: payload.badge || "/images.jpeg",
      data: {
        url: payload.link || "/ClientDashboard",
        type: payload.type,
      },
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscriptionObj = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };

        await webpush.sendNotification(pushSubscriptionObj, notificationPayload);
      } catch (err: any) {
        // 404 or 410 means subscription is expired or unsubscribed on browser side
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await PushSubscription.deleteOne({ _id: sub._id });
          } catch (deleteErr) {
            console.error("Failed to remove expired push subscription:", deleteErr);
          }
        } else {
          console.error("Error sending push notification to endpoint:", sub.endpoint, err);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.error("sendWebPushNotification failed:", error);
  }
}

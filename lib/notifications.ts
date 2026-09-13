import { connectDB } from "@/lib/db";
import Notification, { NotificationType } from "@/models/Notification";
import { sendWebPushNotification } from "@/lib/webPush";
import mongoose from "mongoose";

export interface CreateNotificationParams {
  recipient: string | mongoose.Types.ObjectId;
  sender?: string | mongoose.Types.ObjectId | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  orderId?: string | mongoose.Types.ObjectId | null;
}

export async function createNotification({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
  orderId = null,
}: CreateNotificationParams) {
  try {
    if (!recipient) return null;
    await connectDB();

    const recipientId =
      typeof recipient === "object" && recipient !== null && "_id" in recipient
        ? (recipient as { _id: mongoose.Types.ObjectId | string })._id
        : recipient;

    const senderId =
      typeof sender === "object" && sender !== null && "_id" in sender
        ? (sender as { _id: mongoose.Types.ObjectId | string })._id
        : sender;

    const notif = await Notification.create({
      recipient: typeof recipientId === "string" ? new mongoose.Types.ObjectId(recipientId) : recipientId,
      sender: senderId ? (typeof senderId === "string" ? new mongoose.Types.ObjectId(senderId) : senderId) : null,
      type,
      title,
      message,
      link,
      order: orderId ? (typeof orderId === "string" ? new mongoose.Types.ObjectId(orderId) : orderId) : null,
      read: false,
    });

    // Asynchronously trigger Web Push to user devices without blocking response
    sendWebPushNotification(recipientId, {
      title,
      message,
      link,
      type,
    }).catch((err) => {
      console.error("Background Web Push trigger failed:", err);
    });

    return notif;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}


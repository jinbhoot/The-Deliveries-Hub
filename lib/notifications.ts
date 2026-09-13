import { connectDB } from "@/lib/db";
import Notification, { NotificationType } from "@/models/Notification";
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

    const notif = await Notification.create({
      recipient: typeof recipient === "string" ? new mongoose.Types.ObjectId(recipient) : recipient,
      sender: sender ? (typeof sender === "string" ? new mongoose.Types.ObjectId(sender) : sender) : null,
      type,
      title,
      message,
      link,
      order: orderId ? (typeof orderId === "string" ? new mongoose.Types.ObjectId(orderId) : orderId) : null,
      read: false,
    });

    return notif;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}


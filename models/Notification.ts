import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType =
  | "ORDER_ACCEPTED"
  | "PAYMENT_REQUESTED"
  | "PAYMENT_RECEIVED"
  | "RIDER_APPROVED"
  | "RIDER_BLOCKED"
  | "ORDER_PICKED_UP"
  | "ORDER_ON_THE_WAY"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "NEW_ORDER"
  | "GENERAL";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  order?: mongoose.Types.ObjectId | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "ORDER_ACCEPTED",
        "PAYMENT_REQUESTED",
        "PAYMENT_RECEIVED",
        "RIDER_APPROVED",
        "RIDER_BLOCKED",
        "ORDER_PICKED_UP",
        "ORDER_ON_THE_WAY",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "NEW_ORDER",
        "GENERAL",
      ],
      default: "GENERAL",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for fast query of unread notifications by recipient
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;


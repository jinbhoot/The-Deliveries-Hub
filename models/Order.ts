import { Schema, models, model, Types, type Document } from "mongoose";
import "./User";
import "./Item";

export interface IOrderItem {
  item: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "Placed"
  | "Accepted"
  | "Picked Up"
  | "On the way"
  | "Delivered"
  | "Cancelled";

// Defines which status can move to which next status.
// Used by the order status update route to reject invalid jumps
// (e.g. going straight from "Placed" to "Delivered").
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  Placed: ["Accepted", "Cancelled"],
  Accepted: ["Picked Up", "Cancelled"],
  "Picked Up": ["On the way", "Cancelled"],
  "On the way": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

export interface IOrder extends Document {
  customer: Types.ObjectId;
  rider?: Types.ObjectId | null;
  items: IOrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  riderEarnings?: number;
  adminCommission?: number;
  deliveryAddress: string;
  status: OrderStatus;
  paymentMethod: "Card" | "COD";
  isPaid: boolean;
  billStatus?: "Pending" | "Requested" | "Paid";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rider: { type: Schema.Types.ObjectId, ref: "User", default: null },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [
        (arr: IOrderItem[]) => arr.length > 0,
        "Order must contain at least one item",
      ],
    },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    riderEarnings: { type: Number, default: 0 },
    adminCommission: { type: Number, default: 0 },
    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Placed", "Accepted", "Picked Up", "On the way", "Delivered", "Cancelled"],
      default: "Placed",
    },
    paymentMethod: { type: String, enum: ["COD", "Card"], default: "Card" },
    isPaid: { type: Boolean, default: false },
    billStatus: {
      type: String,
      enum: ["Pending", "Requested", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default models.Order || model<IOrder>("Order", OrderSchema);


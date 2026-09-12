import { Schema, models, model, Types, type Document } from "mongoose";
import "./Order";
import "./User";

export interface IPayment extends Document {
  order: Types.ObjectId;
  customer: Types.ObjectId;
  amount: number;
  subtotal?: number;
  deliveryFee?: number;
  riderEarnings?: number;
  adminCommission?: number;
  currency?: string;
  method: "COD" | "Card";
  status: "Pending" | "Paid" | "Failed";
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    riderEarnings: { type: Number, default: 0 },
    adminCommission: { type: Number, default: 0 },
    currency: { type: String, default: "pkr" },
    method: { type: String, enum: ["COD", "Card"], default: "COD" },
    status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    stripePaymentIntentId: { type: String, default: null },
  },
  { timestamps: true }
);

export default models.Payment || model<IPayment>("Payment", PaymentSchema);

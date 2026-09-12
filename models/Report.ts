import { Schema, models, model, Types, type Document } from "mongoose";
import "./User";
import "./Order";

export interface IReport extends Document {
  customer: Types.ObjectId;
  order?: Types.ObjectId | null;
  subject: string;
  message: string;
  status: "Open" | "In Review" | "Resolved";
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      minlength: [3, "Subject must be at least 3 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [5, "Message must be at least 5 characters"],
    },
    status: { type: String, enum: ["Open", "In Review", "Resolved"], default: "Open" },
  },
  { timestamps: true }
);

export default models.Report || model<IReport>("Report", ReportSchema);

import { Schema, models, model, Types, type Document } from "mongoose";
import "./User";

export interface IRider extends Document {
  user: Types.ObjectId;
  cnic: string;
  address: string;
  profileImage?: string;
  status: "Pending" | "Approved" | "Blocked";
  online: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RiderSchema = new Schema<IRider>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    cnic: {
      type: String,
      required: [true, "CNIC is required"],
      match: [/^\d{5}-\d{7}-\d{1}$/, "CNIC format should be XXXXX-XXXXXXX-X"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [3, "Address is too short"],
    },
    profileImage: {
      type: String, // stored as base64 data URL, small demo-scale images only
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Blocked"],
      default: "Pending",
    },
    online: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default models.Rider || model<IRider>("Rider", RiderSchema);

import { Schema, models, model, type Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: "client" | "rider" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never return password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["client", "rider", "admin"],
      default: "client",
    },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);

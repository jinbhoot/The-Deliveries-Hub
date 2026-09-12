import { Schema, models, model, Types, type Document } from "mongoose";
import "./Category";
import "./Subcategory";

export interface IItem extends Document {
  name: string;
  category: Types.ObjectId;
  subcategory?: Types.ObjectId | null;
  price: number;
  image?: string;
  description?: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [2, "Item name must be at least 2 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      default: null,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: { type: String, default: "" },
    description: { type: String, trim: true, default: "" },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Item || model<IItem>("Item", ItemSchema);


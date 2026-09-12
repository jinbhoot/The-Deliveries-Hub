import { Schema, models, model, Types, type Document } from "mongoose";
import "./Category";

export interface ISubcategory extends Document {
  name: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema = new Schema<ISubcategory>(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
      minlength: [2, "Subcategory name must be at least 2 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Parent category is required"],
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate subcategory names under the same category
SubcategorySchema.index({ name: 1, category: 1 }, { unique: true });

export default models.Subcategory || model<ISubcategory>("Subcategory", SubcategorySchema);

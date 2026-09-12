import { Schema, models, model, type Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
    },
  },
  { timestamps: true }
);

export default models.Category || model<ICategory>("Category", CategorySchema);

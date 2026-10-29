import { Schema, model, type Document } from "mongoose";

export type MenuCategory = "starters" | "mains" | "desserts" | "drinks" | "wine";
export type DietaryTag = "veg" | "vegan" | "gf";

export interface IMenuItem extends Document {
  nameEn: string;
  nameFr: string;
  descEn: string;
  descFr: string;
  price: number;
  category: MenuCategory;
  dietary: DietaryTag[];
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  image?: string;
  allergens?: string;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    nameEn: { type: String, required: true, trim: true },
    nameFr: { type: String, required: true, trim: true },
    descEn: { type: String, required: true },
    descFr: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["starters", "mains", "desserts", "drinks", "wine"],
    },
    dietary: [{ type: String, enum: ["veg", "vegan", "gf"] }],
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    image: { type: String },
    allergens: { type: String },
  },
  { timestamps: true },
);

menuItemSchema.index({ category: 1, sortOrder: 1 });
menuItemSchema.index({ isAvailable: 1 });

export const MenuItem = model<IMenuItem>("MenuItem", menuItemSchema);

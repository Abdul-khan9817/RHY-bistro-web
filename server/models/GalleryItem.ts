import { Schema, model, type Document } from "mongoose";

export type GalleryCategory = "food" | "ambiance" | "events";

export interface IGalleryItem extends Document {
  title?: string;
  imageUrl: string;
  category: GalleryCategory;
  alt: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const galleryItemSchema = new Schema<IGalleryItem>(
  {
    title: { type: String, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["food", "ambiance", "events"],
      default: "food",
    },
    alt: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

galleryItemSchema.index({ category: 1, sortOrder: 1 });

export const GalleryItem = model<IGalleryItem>("GalleryItem", galleryItemSchema);

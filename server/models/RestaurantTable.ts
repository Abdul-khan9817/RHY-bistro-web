import { Schema, model, type Document } from "mongoose";

export interface IRestaurantTable extends Document {
  name: string;           // e.g. "Table 1", "Terrace A"
  capacity: number;
  minCapacity: number;
  isActive: boolean;
  location?: string;      // e.g. "Indoor", "Terrace", "Private"
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantTableSchema = new Schema<IRestaurantTable>(
  {
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1, max: 30 },
    minCapacity: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true },
    location: { type: String, trim: true },
    description: { type: String },
  },
  { timestamps: true },
);

export const RestaurantTable = model<IRestaurantTable>("RestaurantTable", restaurantTableSchema);

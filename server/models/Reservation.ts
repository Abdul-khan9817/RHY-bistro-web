import { Schema, model, type Document } from "mongoose";

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "seated" | "completed" | "no-show";

export interface IPreOrderedItem {
  menuItemId: string;
  nameEn: string;
  nameFr: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface IReservation extends Document {
  ref: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;           // "YYYY-MM-DD"
  time: string;           // "HH:MM"
  requests?: string;
  preOrderedItems: IPreOrderedItem[];
  preOrderTotal: number;
  status: ReservationStatus;
  tableId?: Schema.Types.ObjectId;
  notes?: string;         // Internal admin notes
  source: "online" | "phone" | "walkin" | "admin";
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    ref: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    guests: { type: Number, required: true, min: 1, max: 50 },
    date: { type: String, required: true },
    time: { type: String, required: true },
    requests: { type: String },
    preOrderedItems: [
      {
        menuItemId: { type: String, required: true },
        nameEn: { type: String, required: true },
        nameFr: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, max: 20 },
        category: { type: String },
      },
    ],
    preOrderTotal: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "seated", "completed", "no-show"],
      default: "pending",
    },
    tableId: { type: Schema.Types.ObjectId, ref: "RestaurantTable" },
    notes: { type: String },
    source: {
      type: String,
      enum: ["online", "phone", "walkin", "admin"],
      default: "online",
    },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Compound index for double-booking prevention query
reservationSchema.index({ date: 1, time: 1, tableId: 1 });
reservationSchema.index({ date: 1, status: 1 });
reservationSchema.index({ email: 1 });
reservationSchema.index({ createdAt: -1 });

export const Reservation = model<IReservation>("Reservation", reservationSchema);

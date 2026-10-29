import { Schema, model, type Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: unknown;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const Setting = model<ISetting>("Setting", settingSchema);

// Default settings shape for type safety in the app
export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  maxGuestsPerSlot: number;
  maxAdvanceBookingDays: number;
  openingHours: {
    [day: string]: { open: string; close: string; closed: boolean };
  };
  bookingSlotDuration: number; // minutes
  currency: string;
  timezone: string;
  googleMapsUrl: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tripadvisor?: string;
  };
}

export const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantName: "RHY Bistro",
  tagline: "Restaurant Gourmet",
  phone: "+41 79 425 16 66",
  email: "info@rhybistro.ch",
  address: "Landstrasse 53",
  city: "5275 Etzgen",
  country: "Switzerland",
  maxGuestsPerSlot: 30,
  maxAdvanceBookingDays: 60,
  openingHours: {
    monday: { open: "11:00", close: "20:00", closed: true },
    tuesday: { open: "11:00", close: "20:00", closed: true },
    wednesday: { open: "11:00", close: "20:00", closed: false },
    thursday: { open: "11:00", close: "20:00", closed: false },
    friday: { open: "11:00", close: "22:00", closed: false },
    saturday: { open: "11:00", close: "22:00", closed: false },
    sunday: { open: "11:00", close: "20:00", closed: false },
  },
  bookingSlotDuration: 90,
  currency: "CHF",
  timezone: "Europe/Zurich",
  googleMapsUrl: "https://goo.gl/maps/vrw1AtRktNZsfEbi9",
  socialLinks: {},
};

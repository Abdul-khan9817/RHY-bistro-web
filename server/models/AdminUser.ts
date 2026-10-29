import { Schema, model, type Document } from "mongoose";

export interface IAdminUser extends Document {
  username: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: "admin" | "staff";
  lastLogin?: Date;
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
  resetPasswordAttempts?: number;
  createdAt: Date;
  updatedAt: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "admin" },
    lastLogin: { type: Date },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },
    resetPasswordAttempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const AdminUser = model<IAdminUser>("AdminUser", adminUserSchema);

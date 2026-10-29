import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRY = "8h";
// Minimum JWT_SECRET length requirement
const MIN_SECRET_LENGTH = 32;

function getJwtSecret(): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    if (process.env["NODE_ENV"] !== "production") {
      const fallback = (secret || "rhy-bistro-jwt-secret-development-only").padEnd(MIN_SECRET_LENGTH, "!");
      return fallback;
    }
    throw new Error(
      `JWT_SECRET must be set and at least ${MIN_SECRET_LENGTH} characters long in production.`,
    );
  }
  return secret;
}

export interface AdminJwtPayload {
  sub: string;       // Admin user _id
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: Omit<AdminJwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRY,
    algorithm: "HS256",
    issuer: "rhy-bistro-api",
    audience: "rhy-bistro-admin",
  });
}

export function verifyToken(token: string): AdminJwtPayload {
  return jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
    issuer: "rhy-bistro-api",
    audience: "rhy-bistro-admin",
  }) as AdminJwtPayload;
}

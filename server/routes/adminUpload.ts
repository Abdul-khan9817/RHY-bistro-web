import { Router, type IRouter } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/** Allowed MIME types — strictly checked against magic bytes below */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Magic-byte signatures for allowed image types */
const MAGIC_BYTES: Array<{ mime: string; offset: number; bytes: number[] }> = [
  { mime: "image/jpeg", offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png",  offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  { mime: "image/gif",  offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
];

function detectMimeFromBytes(buf: Buffer): string | null {
  for (const { offset, bytes } of MAGIC_BYTES) {
    if (buf.length >= offset + bytes.length) {
      const match = bytes.every((b, i) => buf[offset + i] === b);
      if (match) {
        if (offset === 0 && bytes[0] === 0x47) return "image/gif";
        if (offset === 0 && bytes[0] === 0x89) return "image/png";
        if (offset === 0 && bytes[0] === 0xff) return "image/jpeg";
        if (offset === 8) return "image/webp";
      }
    }
  }
  return null;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// POST /api/admin/upload
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { dataUrl } = req.body as { dataUrl?: string; filename?: string };

    if (!dataUrl || typeof dataUrl !== "string") {
      res.status(400).json({ success: false, error: "Please provide an image payload (dataUrl)" });
      return;
    }

    // Parse data URI: data:[<mediatype>];base64,<data>
    const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ success: false, error: "Invalid base64 image format" });
      return;
    }

    const claimedMime = matches[1]!.toLowerCase();
    const base64Data = matches[2]!;

    // Validate claimed MIME type before even decoding
    if (!ALLOWED_MIME_TYPES.has(claimedMime)) {
      res.status(400).json({ success: false, error: "Unsupported image type. Allowed: JPEG, PNG, WebP, GIF" });
      return;
    }

    // Decode buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Size check
    if (buffer.length > MAX_SIZE_BYTES) {
      res.status(400).json({ success: false, error: "Image file exceeds maximum 10 MB limit" });
      return;
    }

    // Magic-byte verification — prevents SVG/HTML injection disguised as images
    const detectedMime = detectMimeFromBytes(buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
      logger.warn({ claimedMime, detectedMime, ip: req.ip }, "Upload blocked: magic-byte mismatch");
      res.status(400).json({ success: false, error: "File content does not match its declared type" });
      return;
    }

    // Extension derived from verified MIME only — never trust the client filename
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg":  "jpg",
      "image/png":  "png",
      "image/webp": "webp",
      "image/gif":  "gif",
    };
    const ext = extMap[detectedMime] ?? "bin";

    // Random, non-guessable filename
    const uniqueName = `img_${Date.now()}_${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    logger.info({ publicUrl, size: buffer.length, mime: detectedMime }, "Admin uploaded image asset");

    res.json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
      size: buffer.length,
    });
  } catch (err) {
    logger.error({ err }, "Image upload processing error");
    res.status(500).json({ success: false, error: "Failed to upload image" });
  }
});

export default router;

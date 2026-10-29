import { Router, type IRouter } from "express";
import { z } from "zod";
import { GalleryItem } from "../models/GalleryItem.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const GalleryItemSchema = z.object({
  title: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL or path is required").trim(),
  category: z.enum(["food", "ambiance", "events"]).default("food"),
  alt: z.string().default(""),
  sortOrder: z.number().int().default(0),
});

// GET /api/admin/gallery
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { category } = req.query as { category?: string };
    const VALID_CATEGORIES = ["food", "ambiance", "events"] as const;
    const safeCategory = VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])
      ? category
      : undefined;
    const query = safeCategory ? { category: safeCategory } : {};
    const items = await GalleryItem.find(query as any).sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    logger.error({ err }, "Get admin gallery error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/admin/gallery
router.post("/", requireAdmin, async (req, res) => {
  const parse = GalleryItemSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  try {
    const item = await GalleryItem.create(parse.data);
    logger.info({ id: item._id, category: item.category }, "Gallery item created by admin");
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    logger.error({ err }, "Create gallery item error");
    res.status(500).json({ success: false, error: "Failed to create gallery item" });
  }
});

// PATCH /api/admin/gallery/:id
router.patch("/:id", requireAdmin, async (req, res) => {
  const parse = GalleryItemSchema.partial().safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  try {
    const item = await GalleryItem.findByIdAndUpdate(
      req.params["id"],
      { $set: parse.data },
      { new: true, runValidators: true },
    );

    if (!item) {
      res.status(404).json({ success: false, error: "Gallery item not found" });
      return;
    }

    logger.info({ id: item._id }, "Gallery item updated");
    res.json({ success: true, data: item });
  } catch (err) {
    logger.error({ err }, "Update gallery item error");
    res.status(500).json({ success: false, error: "Failed to update gallery item" });
  }
});

// DELETE /api/admin/gallery/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params["id"]);
    if (!item) {
      res.status(404).json({ success: false, error: "Gallery item not found" });
      return;
    }

    logger.info({ id: req.params["id"] }, "Gallery item deleted");
    res.json({ success: true, message: "Gallery item deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Delete gallery item error");
    res.status(500).json({ success: false, error: "Failed to delete gallery item" });
  }
});

export default router;

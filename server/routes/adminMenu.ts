import { Router, type IRouter } from "express";
import { z } from "zod";
import { MenuItem } from "../models/MenuItem.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const MenuItemSchema = z.object({
  nameEn: z.string().min(1).trim(),
  nameFr: z.string().min(1).trim(),
  descEn: z.string().default(""),
  descFr: z.string().default(""),
  price: z.number().min(0),
  category: z.enum(["starters", "mains", "desserts", "drinks", "wine"]),
  dietary: z.array(z.enum(["veg", "vegan", "gf"])).default([]),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  image: z.string().optional(),
  allergens: z.string().optional(),
});

// GET /api/admin/menu (returns all items, regardless of availability)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { category } = req.query as { category?: string };
    const query = category && category !== "all" ? { category } : {};
    const items = await MenuItem.find(query as any).sort({ category: 1, sortOrder: 1, nameEn: 1 }).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    logger.error({ err }, "Get admin menu error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/admin/menu
router.post("/", requireAdmin, async (req, res) => {
  const parse = MenuItemSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  try {
    const item = await MenuItem.create(parse.data);
    logger.info({ id: item._id, name: item.nameEn }, "Menu item created");
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    logger.error({ err }, "Create menu item error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/menu/:id
router.patch("/:id", requireAdmin, async (req, res) => {
  const parse = MenuItemSchema.partial().safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params["id"],
      { $set: parse.data },
      { new: true, runValidators: true },
    );

    if (!item) {
      res.status(404).json({ success: false, error: "Menu item not found" });
      return;
    }

    logger.info({ id: item._id }, "Menu item updated");
    res.json({ success: true, data: item });
  } catch (err) {
    logger.error({ err }, "Update menu item error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/admin/menu/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params["id"]);
    if (!item) {
      res.status(404).json({ success: false, error: "Menu item not found" });
      return;
    }

    logger.info({ id: req.params["id"] }, "Menu item deleted");
    res.json({ success: true, message: "Menu item deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Delete menu item error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

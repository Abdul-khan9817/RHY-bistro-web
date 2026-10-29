import { Router, type IRouter } from "express";
import { GalleryItem } from "../models/GalleryItem.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const DEFAULT_GALLERY = [
  { imageUrl: "/assets/image_1785084864495.png", category: "food", alt: "Raclette traditionnelle", title: "Raclette Valaisanne", sortOrder: 1 },
  { imageUrl: "/assets/image_1785084872921.png", category: "ambiance", alt: "Planche de charcuterie", title: "Planche Apéro & Fromages", sortOrder: 2 },
  { imageUrl: "/assets/image_1785084917216.png", category: "food", alt: "Fondue au fromage", title: "Fondue Moitié-Moitié", sortOrder: 3 },
  { imageUrl: "/assets/image_1785084845728.png", category: "food", alt: "Flammkuchen maison", title: "Flammkuchen Artisanal", sortOrder: 4 },
  { imageUrl: "/assets/image_1785084930701.png", category: "ambiance", alt: "Ambiance du bistro", title: "Ambiance RHY Bistro", sortOrder: 5 },
  { imageUrl: "/assets/image_1785084947299.png", category: "events", alt: "Événement spécial", title: "Soirées & Dégustations", sortOrder: 6 },
];

router.get("/", async (req, res) => {
  try {
    const { category } = req.query as { category?: string };
    // Validate category against allowed values to prevent unexpected data leakage
    const VALID_CATEGORIES = ["food", "ambiance", "events"] as const;
    const safeCategory = VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])
      ? category
      : undefined;
    const query = safeCategory ? { category: safeCategory } : {};
    
    let items = await GalleryItem.find(query as any).sort({ sortOrder: 1, createdAt: -1 }).lean();

    if (items.length === 0 && (!category || category === "all")) {
      // Seed default items if empty
      await GalleryItem.insertMany(DEFAULT_GALLERY);
      items = await GalleryItem.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
    }

    res.json({ success: true, data: items });
  } catch (err) {
    logger.error({ err }, "Get public gallery error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

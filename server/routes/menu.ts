import { Router, type IRouter } from "express";
import { MenuItem } from "../models/MenuItem.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

// GET /api/menu - Returns available menu items grouped or filtered by category
router.get("/", async (req, res) => {
  try {
    const { category } = req.query as { category?: string };
    const query: Record<string, unknown> = { isAvailable: true };
    if (category && category !== "all") {
      query["category"] = category;
    }

    const items = await MenuItem.find(query)
      .sort({ category: 1, sortOrder: 1, nameEn: 1 })
      .lean();

    res.json({ success: true, data: items });
  } catch (err) {
    logger.error({ err }, "Get public menu error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

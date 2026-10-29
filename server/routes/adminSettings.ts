import { Router, type IRouter } from "express";
import { z } from "zod";
import { Setting, DEFAULT_SETTINGS, type RestaurantSettings } from "../models/Setting.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const SETTINGS_KEY = "restaurant_profile";

/** Strict schema for settings PATCH — prevents arbitrary object injection */
const SettingsUpdateSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  tagline: z.string().max(500).trim().optional(),
  phone: z.string().max(30).trim().optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).trim().optional(),
  maxGuestsPerSlot: z.number().int().min(1).max(500).optional(),
  openingHours: z.record(
    z.object({
      open: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      close: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      closed: z.boolean().optional(),
    }),
  ).optional(),
}).strict();

// GET /api/admin/settings
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const record = await Setting.findOne({ key: SETTINGS_KEY }).lean();
    const settings = (record?.value as RestaurantSettings) || DEFAULT_SETTINGS;
    res.json({ success: true, data: settings });
  } catch (err) {
    logger.error({ err }, "Get settings error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/settings
router.patch("/", requireAdmin, async (req, res) => {
  // Validate — prevents prototype pollution and arbitrary key injection
  const parse = SettingsUpdateSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  try {
    const existing = await Setting.findOne({ key: SETTINGS_KEY }).lean();
    const current = (existing?.value as Record<string, unknown>) || DEFAULT_SETTINGS;
    const merged = { ...current, ...parse.data };

    const updated = await Setting.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { key: SETTINGS_KEY, value: merged },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    logger.info("Restaurant settings updated");
    res.json({ success: true, data: updated.value });
  } catch (err) {
    logger.error({ err }, "Update settings error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

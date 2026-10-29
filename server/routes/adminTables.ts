import { Router, type IRouter } from "express";
import { z } from "zod";
import { RestaurantTable } from "../models/RestaurantTable.js";
import { Reservation } from "../models/Reservation.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const TableSchema = z.object({
  name: z.string().min(1).trim(),
  capacity: z.number().int().min(1).max(30),
  minCapacity: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  location: z.string().optional().default("Indoor"),
  description: z.string().optional().default(""),
});

// GET /api/admin/tables
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const tables = await RestaurantTable.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: tables });
  } catch (err) {
    logger.error({ err }, "Get tables error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/admin/tables
router.post("/", requireAdmin, async (req, res) => {
  const parse = TableSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  try {
    const table = await RestaurantTable.create(parse.data);
    logger.info({ tableId: table._id, name: table.name }, "Table created");
    res.status(201).json({ success: true, data: table });
  } catch (err) {
    logger.error({ err }, "Create table error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/tables/:id
router.patch("/:id", requireAdmin, async (req, res) => {
  const parse = TableSchema.partial().safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  try {
    const table = await RestaurantTable.findByIdAndUpdate(
      req.params["id"],
      { $set: parse.data },
      { new: true, runValidators: true },
    );

    if (!table) {
      res.status(404).json({ success: false, error: "Table not found" });
      return;
    }

    logger.info({ tableId: table._id }, "Table updated");
    res.json({ success: true, data: table });
  } catch (err) {
    logger.error({ err }, "Update table error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/admin/tables/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params["id"];
    // Check if any upcoming reservation is assigned to this table
    const assignedBookings = await Reservation.countDocuments({
      tableId: id as any,
      date: { $gte: new Date().toISOString().slice(0, 10) },
      status: { $in: ["pending", "confirmed", "seated"] },
    });

    if (assignedBookings > 0) {
      res.status(400).json({
        success: false,
        error: `Cannot delete table: ${assignedBookings} upcoming active reservation(s) assigned. Reassign or cancel them first.`,
      });
      return;
    }

    const table = await RestaurantTable.findByIdAndDelete(id);
    if (!table) {
      res.status(404).json({ success: false, error: "Table not found" });
      return;
    }

    logger.info({ tableId: id }, "Table deleted");
    res.json({ success: true, message: "Table deleted successfully" });
  } catch (err) {
    logger.error({ err }, "Delete table error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

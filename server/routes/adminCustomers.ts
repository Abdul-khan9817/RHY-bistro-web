import { Router, type IRouter } from "express";
import { z } from "zod";
import { Reservation } from "../models/Reservation.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const SearchSchema = z.object({
  search: z.string().max(200).optional(),
});

// GET /api/admin/customers
router.get("/", requireAdmin, async (req, res) => {
  try {
    const parse = SearchSchema.safeParse(req.query);
    if (!parse.success) {
      res.status(400).json({ success: false, error: "Invalid search parameter" });
      return;
    }

    const { search } = parse.data;

    const pipeline: unknown[] = [];

    // Filtering BEFORE grouping is far more efficient (uses indexes on name/email/phone)
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: escaped, $options: "i" } },
            { email: { $regex: escaped, $options: "i" } },
            { phone: { $regex: escaped, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: "$email",
          name: { $first: "$name" },
          phone: { $first: "$phone" },
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          totalGuestsServed: {
            $sum: {
              $cond: [
                { $in: ["$status", ["confirmed", "seated", "completed"]] },
                "$guests",
                0,
              ],
            },
          },
          lastVisit: { $max: "$date" },
          firstVisit: { $min: "$date" },
        },
      },
      {
        $project: {
          _id: 0,
          email: "$_id",
          name: 1,
          phone: 1,
          totalBookings: 1,
          completedBookings: 1,
          cancelledBookings: 1,
          totalGuestsServed: 1,
          lastVisit: 1,
          firstVisit: 1,
        },
      },
      { $sort: { totalBookings: -1, lastVisit: -1 } },
    );

    const customers = await Reservation.aggregate(pipeline as any);
    res.json({ success: true, data: customers });
  } catch (err) {
    logger.error({ err }, "Get customers error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

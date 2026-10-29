import { Router, type IRouter } from "express";
import { Reservation } from "../models/Reservation.js";
import { RestaurantTable } from "../models/RestaurantTable.js";
import { MenuItem } from "../models/MenuItem.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

// GET /api/admin/dashboard/stats
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [
      todayBookings,
      pendingBookings,
      totalTables,
      activeTables,
      totalMenuItems,
      recentBookings,
      statusCounts,
      todayGuestsAgg,
    ] = await Promise.all([
      // Bookings for today
      Reservation.countDocuments({ date: today, status: { $ne: "cancelled" } }),
      // Pending confirmation bookings
      Reservation.countDocuments({ status: "pending" }),
      // Table counts
      RestaurantTable.countDocuments(),
      RestaurantTable.countDocuments({ isActive: true }),
      // Menu items
      MenuItem.countDocuments({ isAvailable: true }),
      // 5 most recent bookings
      Reservation.find()
        .populate("tableId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      // Status breakdown
      Reservation.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      // Total guests today
      Reservation.aggregate([
        { $match: { date: today, status: { $in: ["confirmed", "seated", "completed"] } } },
        { $group: { _id: null, totalGuests: { $sum: "$guests" } } },
      ]),
    ]);

    const statusMap = statusCounts.reduce<Record<string, number>>((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const totalGuestsToday = todayGuestsAgg[0]?.totalGuests ?? 0;

    res.json({
      success: true,
      data: {
        todayBookings,
        totalGuestsToday,
        pendingBookings,
        totalTables,
        activeTables,
        totalMenuItems,
        recentBookings,
        statusBreakdown: statusMap,
      },
    });
  } catch (err) {
    logger.error({ err }, "Get dashboard stats error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/admin/dashboard/trends - 14-day booking volume
router.get("/trends", requireAdmin, async (_req, res) => {
  try {
    // Generate dates for the last 14 days
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const startDate = days[0]!;
    const endDate = days[days.length - 1]!;

    const agg = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$date",
          bookings: { $sum: 1 },
          guests: { $sum: "$guests" },
        },
      },
    ]);

    const aggMap = new Map(agg.map((item) => [item._id, item]));

    const trendData = days.map((date) => {
      const found = aggMap.get(date);
      // Format as "MM/DD" or day name
      const dateObj = new Date(date);
      const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        date,
        label,
        bookings: found ? found.bookings : 0,
        guests: found ? found.guests : 0,
      };
    });

    res.json({ success: true, data: trendData });
  } catch (err) {
    logger.error({ err }, "Get dashboard trends error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { z } from "zod";
import { Reservation } from "../models/Reservation.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { sseRegistry } from "../lib/sse.js";
import { logger } from "../lib/logger.js";
import crypto from "node:crypto";

const router: IRouter = Router();

const UpdateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "seated", "completed", "no-show"]).optional(),
  tableId: z.string().optional().nullable(),
  notes: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  guests: z.number().int().min(1).max(50).optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const CreateBookingSchema = z.object({
  name: z.string().min(1).trim(),
  email: z.string().email().trim(),
  phone: z.string().min(1).trim(),
  guests: z.number().int().min(1).max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  requests: z.string().optional(),
  tableId: z.string().optional(),
  source: z.enum(["online", "phone", "walkin", "admin"]).default("admin"),
  status: z.enum(["pending", "confirmed", "cancelled", "seated", "completed", "no-show"]).default("confirmed"),
});

// SSE stream — GET /api/admin/bookings/stream
router.get("/stream", requireAdmin, (req, res) => {
  const clientId = crypto.randomUUID();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // For Nginx proxy buffering

  // Send initial ping so client knows stream is alive
  res.write(`event: connected\ndata: {"clientId":"${clientId}"}\n\n`);

  // Keepalive heartbeat every 25s
  const heartbeat = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 25_000);

  sseRegistry.addClient(clientId, res);
  logger.info({ clientId }, "Admin SSE client connected");

  req.on("close", () => {
    clearInterval(heartbeat);
    sseRegistry.removeClient(clientId);
    logger.info({ clientId }, "Admin SSE client disconnected");
  });
});

// GET /api/admin/bookings
router.get("/", requireAdmin, async (req, res) => {
  try {
    const {
      page = "1",
      limit = "25",
      status,
      date,
      dateFrom,
      dateTo,
      search,
      sort = "createdAt",
      order = "desc",
    } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};

    if (status && status !== "all") filter["status"] = status;
    if (date) filter["date"] = date;
    if (dateFrom || dateTo) {
      filter["date"] = {};
      if (dateFrom) (filter["date"] as Record<string, string>)["$gte"] = dateFrom;
      if (dateTo) (filter["date"] as Record<string, string>)["$lte"] = dateTo;
    }
    if (search && search.trim().length > 0) {
      // Escape regex metacharacters to prevent ReDoS
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter["$or"] = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
        { ref: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;

    const [bookings, total] = await Promise.all([
      Reservation.find(filter)
        .populate("tableId", "name location")
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Reservation.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error({ err }, "Get bookings error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/admin/bookings/:id
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const booking = await Reservation.findById(req.params["id"]).populate("tableId", "name location capacity");
    if (!booking) {
      res.status(404).json({ success: false, error: "Booking not found" });
      return;
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    logger.error({ err }, "Get booking error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/admin/bookings  — admin creates a manual booking
router.post("/", requireAdmin, async (req, res) => {
  const parse = CreateBookingSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  try {
    const ref = `RHY-${Date.now().toString(36).toUpperCase()}`;
    const booking = (await Reservation.create({ ...parse.data, ref } as any)) as any;
    
    sseRegistry.broadcast("NEW_BOOKING", booking.toObject ? booking.toObject() : booking);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    logger.error({ err }, "Create admin booking error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/bookings/:id
router.patch("/:id", requireAdmin, async (req, res) => {
  const parse = UpdateBookingSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  try {
    const booking = await Reservation.findByIdAndUpdate(
      req.params["id"],
      { $set: parse.data },
      { new: true, runValidators: true },
    ).populate("tableId", "name location");

    if (!booking) {
      res.status(404).json({ success: false, error: "Booking not found" });
      return;
    }

    // Broadcast update to all connected admin dashboards
    sseRegistry.broadcast("BOOKING_UPDATED", booking.toObject());

    logger.info({ id: req.params["id"], admin: req.admin?.username }, "Booking updated");
    res.json({ success: true, data: booking });
  } catch (err) {
    logger.error({ err }, "Update booking error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/admin/bookings/:id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const booking = await Reservation.findByIdAndDelete(req.params["id"]);
    if (!booking) {
      res.status(404).json({ success: false, error: "Booking not found" });
      return;
    }

    sseRegistry.broadcast("BOOKING_DELETED", { id: req.params["id"] });
    logger.info({ id: req.params["id"], admin: req.admin?.username }, "Booking deleted");
    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    logger.error({ err }, "Delete booking error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

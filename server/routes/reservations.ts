import { Router, type IRouter } from "express";
import { z } from "zod";
import { Reservation } from "../models/Reservation.js";
import { RestaurantTable } from "../models/RestaurantTable.js";
import { Setting, DEFAULT_SETTINGS, type RestaurantSettings } from "../models/Setting.js";
import { sseRegistry } from "../lib/sse.js";
import { sendBookingConfirmation, sendAdminNewBookingAlert } from "../lib/email.js";
import { publicBookingLimiter } from "../middlewares/rateLimiter.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const PreOrderedItemSchema = z.object({
  menuItemId: z.string().min(1),
  nameEn: z.string().min(1),
  nameFr: z.string().min(1),
  price: z.number().min(0),
  quantity: z.number().int().min(1).max(20),
  category: z.string().optional(),
});

const PublicReservationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  phone: z.string().min(6, "Please provide a valid phone number").trim(),
  guests: z.number().int().min(1, "Minimum 1 guest").max(20, "For groups over 20, please call us directly"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  requests: z.string().max(500).optional().default(""),
  preOrderedItems: z.array(PreOrderedItemSchema).max(40).optional().default([]),
});

// GET /api/reservations/availability?date=YYYY-MM-DD
router.get("/availability", async (req, res) => {
  try {
    const { date } = req.query as { date?: string };
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ success: false, error: "Valid date query parameter required (YYYY-MM-DD)" });
      return;
    }

    // Get day of week
    const dateObj = new Date(date + "T12:00:00Z");
    const dayName = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][dateObj.getUTCDay()]!;

    const settingRecord = await Setting.findOne({ key: "restaurant_profile" });
    const settings = (settingRecord?.value as RestaurantSettings) || DEFAULT_SETTINGS;

    const dayHours = settings.openingHours[dayName];
    if (dayHours?.closed) {
      res.json({
        success: true,
        isClosed: true,
        message: `RHY Bistro is closed on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}s.`,
        availableSlots: [],
      });
      return;
    }

    // Count existing reservations for this date grouped by time
    const existing = await Reservation.aggregate([
      {
        $match: {
          date,
          status: { $in: ["pending", "confirmed", "seated"] },
        },
      },
      {
        $group: {
          _id: "$time",
          bookedGuests: { $sum: "$guests" },
          bookingCount: { $sum: 1 },
        },
      },
    ]);

    const bookedMap = new Map(existing.map((e) => [e._id, e.bookedGuests]));
    const maxCapacity = settings.maxGuestsPerSlot || 30;

    // Standard lunch & dinner times
    const standardSlots = [
      "11:30", "12:00", "12:30", "13:00", "13:30",
      "18:30", "19:00", "19:30", "20:00", "20:30",
    ];

    const availableSlots = standardSlots.map((time) => {
      const booked = bookedMap.get(time) || 0;
      const remaining = Math.max(0, maxCapacity - booked);
      return {
        time,
        available: remaining > 0,
        remainingCapacity: remaining,
      };
    });

    res.json({
      success: true,
      isClosed: false,
      date,
      availableSlots,
    });
  } catch (err) {
    logger.error({ err }, "Availability check error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/reservations/lookup/:ref
router.get("/lookup/:ref", async (req, res) => {
  try {
    const booking = await Reservation.findOne({ ref: req.params["ref"]?.toUpperCase() })
      .select("ref name date time guests status requests preOrderedItems preOrderTotal")
      .lean();

    if (!booking) {
      res.status(404).json({ success: false, error: "Reservation not found" });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    logger.error({ err }, "Lookup booking error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/reservations - Customer booking submission
router.post("/", publicBookingLimiter, async (req, res) => {
  const parse = PublicReservationSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
    return;
  }

  const { name, email, phone, guests, date, time, requests, preOrderedItems } = parse.data;
  const preOrderTotal = preOrderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    // 1. Verify restaurant is open on that day
    const dateObj = new Date(date + "T12:00:00Z");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateObj < today) {
      res.status(400).json({ success: false, error: "Cannot book a table in the past" });
      return;
    }

    const dayName = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][dateObj.getUTCDay()]!;

    const settingRecord = await Setting.findOne({ key: "restaurant_profile" });
    const settings = (settingRecord?.value as RestaurantSettings) || DEFAULT_SETTINGS;

    if (settings.openingHours[dayName]?.closed) {
      res.status(400).json({
        success: false,
        error: `We are closed on ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}s. Please choose another day.`,
      });
      return;
    }

    // 2. Double-booking check: count total booked guests for this slot
    const slotAgg = await Reservation.aggregate([
      {
        $match: {
          date,
          time,
          status: { $in: ["pending", "confirmed", "seated"] },
        },
      },
      {
        $group: {
          _id: null,
          totalGuests: { $sum: "$guests" },
        },
      },
    ]);

    const alreadyBooked = slotAgg[0]?.totalGuests || 0;
    const slotLimit = settings.maxGuestsPerSlot || 30;

    if (alreadyBooked + guests > slotLimit) {
      res.status(409).json({
        success: false,
        error: `Sorry, we are fully booked at ${time} on this date. Please select another time or call us.`,
      });
      return;
    }

    // 3. Find an available table that fits the guest count (optional auto-assignment)
    const bookedTableIds = await Reservation.distinct("tableId", {
      date,
      time,
      status: { $in: ["pending", "confirmed", "seated"] },
      tableId: { $ne: null },
    });

    const candidateTable = (await RestaurantTable.findOne({
      _id: { $nin: bookedTableIds as any },
      isActive: true,
      capacity: { $gte: guests },
    } as any).sort({ capacity: 1 })) as any;

    // 4. Generate unique readable reference
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timeSuffix = Date.now().toString(36).slice(-3).toUpperCase();
    const ref = `RHY-${randomSuffix}-${timeSuffix}`;

    // 5. Create reservation
    const booking = (await Reservation.create({
      ref,
      name,
      email,
      phone,
      guests,
      date,
      time,
      requests,
      preOrderedItems,
      preOrderTotal,
      status: "confirmed",
      tableId: candidateTable?._id,
      source: "online",
    } as any)) as any;

    const populatedBooking = await Reservation.findById(booking._id)
      .populate("tableId", "name location")
      .lean();

    // 6. Broadcast to all active admin dashboards in real time via SSE!
    sseRegistry.broadcast("NEW_BOOKING", populatedBooking);

    // 7. Fire-and-forget email notifications (customer confirmation + admin alert)
    sendBookingConfirmation({
      name,
      email,
      ref,
      date,
      time,
      guests,
      requests,
      preOrderedItems,
      preOrderTotal,
    }).catch((e) =>
      logger.error({ err: e }, "Async email confirmation error"),
    );
    sendAdminNewBookingAlert({ name, ref, date, time, guests, phone }).catch((e) =>
      logger.error({ err: e }, "Async admin alert email error"),
    );

    logger.info({ ref, name, guests, date, time }, "New reservation created");

    res.status(201).json({
      success: true,
      ref,
      data: {
        id: booking._id,
        ref,
        name,
        email,
        date,
        time,
        guests,
        status: booking.status,
      },
      message: "Reservation confirmed successfully!",
    });
  } catch (err) {
    logger.error({ err }, "Public reservation creation error");
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

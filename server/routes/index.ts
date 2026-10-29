import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import adminAuthRouter from "./adminAuth.js";
import adminBookingsRouter from "./adminBookings.js";
import adminTablesRouter from "./adminTables.js";
import adminMenuRouter from "./adminMenu.js";
import adminSettingsRouter from "./adminSettings.js";
import adminDashboardRouter from "./adminDashboard.js";
import adminCustomersRouter from "./adminCustomers.js";
import adminGalleryRouter from "./adminGallery.js";
import adminUploadRouter from "./adminUpload.js";
import reservationsRouter from "./reservations.js";
import menuRouter from "./menu.js";
import galleryRouter from "./gallery.js";
import { publicApiLimiter } from "../middlewares/rateLimiter.js";

const router: IRouter = Router();

// Health check (no rate limit)
router.use(healthRouter);

// Public API endpoints — apply broad rate limiter
router.use("/reservations", publicApiLimiter, reservationsRouter);
router.use("/menu", publicApiLimiter, menuRouter);
router.use("/gallery", publicApiLimiter, galleryRouter);

// Admin Authentication (auth routes have their own per-route limiters)
router.use("/admin", adminAuthRouter);

// Admin Protected Modules (protected inside the routers with requireAdmin)
router.use("/admin/bookings", adminBookingsRouter);
router.use("/admin/tables", adminTablesRouter);
router.use("/admin/menu", adminMenuRouter);
router.use("/admin/settings", adminSettingsRouter);
router.use("/admin/dashboard", adminDashboardRouter);
router.use("/admin/customers", adminCustomersRouter);
router.use("/admin/gallery", adminGalleryRouter);
router.use("/admin/upload", adminUploadRouter);

export default router;

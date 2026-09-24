import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  createService,
  deleteAppointment,
  deleteService,
  getAppointments,
  getInquiries,
  getPayments,
  getServices,
  getStats,
  getUsers,
  updateAppointmentStatus,
  updateService,
  updateUser,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getStats);

router.get("/appointments", getAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);
router.delete("/appointments/:id", deleteAppointment);

router.get("/payments", getPayments);

router.get("/services", getServices);
router.post("/services", createService);
router.patch("/services/:id", updateService);
router.delete("/services/:id", deleteService);

router.get("/users", getUsers);
router.patch("/users/:id", updateUser);

router.get("/inquiries", getInquiries);

export default router;

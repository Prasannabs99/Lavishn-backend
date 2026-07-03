import { Router } from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
} from "../controllers/appointment.controller.js";
import {
  createAppointmentValidation,
  updateAppointmentStatusValidation,
} from "../validators/appointment.validator.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/", createAppointmentValidation, validate, createAppointment);
router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.patch(
  "/:id/status",
  updateAppointmentStatusValidation,
  validate,
  updateAppointmentStatus,
);
router.delete("/:id", requireAdmin, deleteAppointment);

export default router;

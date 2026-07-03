import { body } from "express-validator";

export const createAppointmentValidation = [
  body("patientName")
    .trim()
    .notEmpty()
    .withMessage("Patient name is required")
    .isLength({ max: 120 }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isLength({ max: 30 }),
  body("hospital").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  body("service").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  body("preferredDate")
    .notEmpty()
    .withMessage("Preferred date is required")
    .isISO8601()
    .withMessage("Preferred date must be a valid date"),
  body("preferredTime")
    .trim()
    .notEmpty()
    .withMessage("Preferred time is required")
    .isLength({ max: 20 }),
  body("notes").optional({ values: "falsy" }).trim().isLength({ max: 2000 }),
];

export const updateAppointmentStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "confirmed", "cancelled", "completed"])
    .withMessage("Invalid status"),
];

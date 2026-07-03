import { body } from "express-validator";

export const contactValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
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
  body("subject").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 5000 }),
];

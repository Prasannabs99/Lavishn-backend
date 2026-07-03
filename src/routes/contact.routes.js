import { Router } from "express";
import { submitContact } from "../controllers/contact.controller.js";
import { contactValidation } from "../validators/contact.validator.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/", contactValidation, validate, submitContact);

export default router;

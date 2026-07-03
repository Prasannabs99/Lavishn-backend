import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import {
  registerValidation,
  loginValidation,
} from "../validators/auth.validator.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", authenticate, getMe);

export default router;

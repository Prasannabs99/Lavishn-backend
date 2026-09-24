import express from "express";
import { getServices, getServiceBySlug } from "../controllers/service.controller.js";

const router = express.Router();

router.get("/", getServices);
router.get("/:slug", getServiceBySlug);

export default router;

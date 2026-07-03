import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { seedAdminIfNeeded } from "./utils/seedAdmin.js";
import contactRoutes from "./routes/contact.routes.js";
import authRoutes from "./routes/auth.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

let isInitialized = false;

app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!isInitialized) {
      await seedAdminIfNeeded();
      isInitialized = true;
    }
    next();
  } catch (err) {
    next(err);
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Lavishn Health Care API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}

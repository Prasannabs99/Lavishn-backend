import { env } from "../config/env.js";
import { User } from "../models/User.js";

export async function seedAdminIfNeeded() {
  const { email, password, name } = env.adminSeed;

  if (!email || !password) {
    return;
  }

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    return;
  }

  await User.create({
    name,
    email,
    password,
    role: "admin",
  });

  console.log(`Seeded admin user: ${email}`);
}

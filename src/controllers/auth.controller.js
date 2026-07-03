import { User } from "../models/User.js";
import { signToken } from "../middleware/auth.js";

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: formatUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: formatUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res) {
  res.json({
    success: true,
    data: {
      user: formatUser(req.user),
    },
  });
}

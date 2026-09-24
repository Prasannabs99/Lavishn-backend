import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    priceInPaise: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
      maxlength: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Service = mongoose.model("Service", serviceSchema);

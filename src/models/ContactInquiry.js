import mongoose from "mongoose";

const contactInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
    collection: "contact_inquiries",
  },
);

export const ContactInquiry = mongoose.model(
  "ContactInquiry",
  contactInquirySchema,
);

import { ContactInquiry } from "../models/ContactInquiry.js";
import { sendContactNotification } from "../utils/email.js";

export async function submitContact(req, res, next) {
  try {
    const { name, email, phone, subject, message } = req.body;

    const inquiry = await ContactInquiry.create({
      name,
      email,
      phone,
      subject: subject || "",
      message,
    });

    sendContactNotification(inquiry).catch((err) => {
      console.error("Contact email notification failed:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent successfully.",
      data: {
        id: inquiry._id,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

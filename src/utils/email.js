import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter;

function getTransporter() {
  if (!env.smtp.host) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth:
        env.smtp.user && env.smtp.pass
          ? { user: env.smtp.user, pass: env.smtp.pass }
          : undefined,
    });
  }

  return transporter;
}

export async function sendContactNotification(inquiry) {
  const mailer = getTransporter();
  if (!mailer) {
    return;
  }

  const { name, email, phone, subject, message } = inquiry;

  await mailer.sendMail({
    from: env.smtp.user || env.contactNotifyEmail,
    to: env.contactNotifyEmail,
    replyTo: email,
    subject: `[Lavishn Contact] ${subject || "New inquiry"} — ${name}`,
    text: [
      "New contact form submission",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Subject: ${subject || "(none)"}`,
      "",
      "Message:",
      message,
    ].join("\n"),
  });
}

import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

const TOKEN = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

export const sendMail = async (to, subject, message) => {
  try {
    const info = await transporter.sendMail({
      from: 'RanKro <[EMAIL_ADDRESS]>',
      to,
      subject,
      html: message,
      category: "Transactional",
    });

    console.log("✅ Mail sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mail error:", error.message);
    throw error;
  }
};
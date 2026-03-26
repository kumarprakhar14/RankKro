import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

const TOKEN = process.env.SMTP_PASS;

// if (!TOKEN) {
//   throw new Error("SMTP_PASS environment variable is required");
// }

const transporter = nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

export const sendMail = async (to, subject, message) => {
  try {
    const info = await transporter.sendMail({
      from: 'RanKro <rankro@unique-deals.in>',
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
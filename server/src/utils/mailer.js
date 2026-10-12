import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (to, subject, message, options = {}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "RanKro <rankro@unique-deals.in>",
      to,
      subject,
      html: message,
      ...(options.idempotencyKey && { idempotencyKey: options.idempotencyKey }),
      ...(options.tags && { tags: options.tags }),
      ...(options.attachments && { attachments: options.attachments }),
    });

    if (error) {
      console.error("❌ Resend error:", error.message);
      throw new Error(`Resend email delivery failed: ${error.message}`);
    }

    console.log("✅ Mail sent:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Mail error:", error.message);
    throw error;
  }
};
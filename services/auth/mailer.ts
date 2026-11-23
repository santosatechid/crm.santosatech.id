import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";

const transporter = host
  ? nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;

export async function sendMail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!transporter) {
    // ponytail: no SMTP configured — surface the OTP in dev logs instead of failing signup.
    console.warn(`[mailer] SMTP_HOST unset, skipping ${subject} to ${to}: ${text}`);
    return;
  }
  await transporter.sendMail({ from, to, subject, text });
}

import "server-only";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

type SendEmailResult = { sent: boolean; reason?: string };

/**
 * Resend HTTP API dipilih supaya tidak menambah dependency.
 * Tanpa RESEND_API_KEY, fitur tetap jalan tetapi email tidak dikirim:
 * UI menampilkan link agar bisa dibagikan manual.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { sent: false, reason: "Email belum dikonfigurasi (RESEND_API_KEY/EMAIL_FROM)." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      return { sent: false, reason: `Provider email menolak (${response.status}).` };
    }

    return { sent: true };
  } catch {
    return { sent: false, reason: "Gagal menghubungi provider email." };
  }
}

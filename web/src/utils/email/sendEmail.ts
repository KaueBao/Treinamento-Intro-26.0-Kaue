import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@example.com";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY. Configure it before sending emails.");
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export async function sendEmail(to: string, subject: string, body: string) {
  const resend = getResendClient();

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    text: body,
  });
}

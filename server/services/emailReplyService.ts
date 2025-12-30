import { Resend } from "resend";
import { config } from "dotenv";

config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendReply = async (fromEmail: string, toEmail: string, subject: string, body: string) => {
  if (fromEmail !== process.env.PRO_PAGE_CONTACT_EMAIL) {
    throw new Error("Invalid from email address.");
  }
  try {
    const response = await resend.sendEmail({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: body
    });
    logEmail({ fromEmail, toEmail, subject, body, status: "sent" });
    return { success: true, messageId: response.id };
  } catch (error) {
    logEmail({ fromEmail, toEmail, subject, body, status: "failed", error: error.message });
    return { success: false, error: error.message };
  }
};

const logEmail = (emailLog: any) => {
  // Implement logging logic here
};

export { sendReply };
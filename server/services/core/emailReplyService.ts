import { Resend } from 'resend';
import { config } from 'dotenv';

config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendReplyEmail = async (options: { to: string, from: string, subject: string, body: string }) => {
  try {
    const response = await resend.sendEmail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.body
    });
    return { success: true, messageId: response.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { sendReplyEmail };
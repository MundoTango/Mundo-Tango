import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@mundotango.com';

export class NotificationService {
  async sendApprovalRequest(adminEmail: string, userId: number, reason: string, username: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: adminEmail,
        subject: 'New God Level Access Request',
        html: `
          <h2>New God Level Access Request</h2>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Reason:</strong></p>
          <p>${reason}</p>
          <p>Please review this request in the admin dashboard.</p>
        `
      });
    } catch (error) {
      console.error('[Notification] Error sending approval request:', error);
    }
  }

  async sendApprovalConfirmation(userEmail: string, username: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: 'God Level Access Approved!',
        html: `
          <h2>Congratulations ${username}!</h2>
          <p>Your God Level access request has been approved.</p>
          <p>You now have access to premium features including:</p>
          <ul>
            <li>AI Video Generation (5 videos per month)</li>
            <li>Premium Voice Chat (5 sessions per month)</li>
            <li>OpenAI Realtime Voice</li>
          </ul>
          <p>Your quota resets on the 1st of each month.</p>
          <p><a href="${process.env.APP_URL}/god-level">Visit your God Level Dashboard</a></p>
        `
      });
    } catch (error) {
      console.error('[Notification] Error sending approval confirmation:', error);
    }
  }

  async sendRejectionNotice(userEmail: string, username: string, reason: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: 'God Level Access Request Update',
        html: `
          <h2>God Level Access Request Update</h2>
          <p>Hello ${username},</p>
          <p>Thank you for your interest in God Level access. Unfortunately, we are unable to approve your request at this time.</p>
          <p><strong>Reason:</strong></p>
          <p>${reason}</p>
          <p>You are welcome to reapply in the future.</p>
        `
      });
    } catch (error) {
      console.error('[Notification] Error sending rejection notice:', error);
    }
  }

  async sendQuotaWarning(userEmail: string, username: string, quotaType: string, percentUsed: number): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `God Level Quota Warning: ${quotaType} at ${percentUsed}%`,
        html: `
          <h2>Quota Warning</h2>
          <p>Hello ${username},</p>
          <p>You have used ${percentUsed}% of your monthly ${quotaType} quota.</p>
          <p>Your quota will reset on the 1st of next month.</p>
          <p><a href="${process.env.APP_URL}/god-level">View your quota status</a></p>
        `
      });
    } catch (error) {
      console.error('[Notification] Error sending quota warning:', error);
    }
  }

  async sendQuotaExceeded(userEmail: string, username: string, quotaType: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `God Level Quota Exceeded: ${quotaType}`,
        html: `
          <h2>Quota Exceeded</h2>
          <p>Hello ${username},</p>
          <p>You have reached your monthly limit for ${quotaType}.</p>
          <p>Your quota will reset on the 1st of next month.</p>
          <p>If you need additional quota, please contact support.</p>
          <p><a href="${process.env.APP_URL}/god-level">View your quota status</a></p>
        `
      });
    } catch (error) {
      console.error('[Notification] Error sending quota exceeded notice:', error);
    }
  }
}

export const notificationService = new NotificationService();

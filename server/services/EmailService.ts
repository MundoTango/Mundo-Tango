import { Resend } from 'resend';
import { db } from '@shared/db';
import { emailQueue, emailPreferences, emailLogs } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  // Check if user can receive emails (rate limiting)
  static async canSendEmail(userId: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sentToday = await db.select({ count: sql<number>`count(*)` })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.userId, userId),
        gte(emailLogs.sentAt, today)
      ));
    
    return (sentToday[0]?.count || 0) < 5; // Max 5 emails per day
  }
  
  // Check if user has preference enabled
  static async hasPreference(userId: number, preferenceKey: string): Promise<boolean> {
    const prefs = await db.query.emailPreferences.findFirst({
      where: eq(emailPreferences.userId, userId)
    });
    
    if (!prefs || !prefs.emailsEnabled) return false;
    return prefs[preferenceKey as keyof typeof prefs] !== false;
  }
  
  // Queue email for sending
  static async queueEmail(
    userId: number,
    toEmail: string,
    templateName: string,
    subject: string,
    templateData: any
  ) {
    // Check preferences
    const hasPreference = await this.hasPreference(userId, templateName);
    if (!hasPreference) {
      console.log(`User ${userId} has disabled ${templateName} emails`);
      return;
    }
    
    // Check rate limit
    const canSend = await this.canSendEmail(userId);
    if (!canSend) {
      console.log(`User ${userId} has reached daily email limit`);
      return;
    }
    
    await db.insert(emailQueue).values({
      userId,
      toEmail,
      templateName,
      subject,
      templateData,
      status: 'pending'
    });
  }
  
  // Send email from queue
  static async sendQueuedEmails() {
    const pending = await db.query.emailQueue.findMany({
      where: and(
        eq(emailQueue.status, 'pending'),
        sql`${emailQueue.attempts} < ${emailQueue.maxAttempts}`
      ),
      limit: 10
    });
    
    for (const email of pending) {
      try {
        // Update status to sending
        await db.update(emailQueue)
          .set({ status: 'sending', attempts: email.attempts + 1 })
          .where(eq(emailQueue.id, email.id));
        
        // Send via Resend
        const html = this.renderTemplate(email.templateName, email.templateData);
        
        await resend.emails.send({
          from: 'Mundo Tango <notifications@mundotango.life>',
          to: email.toEmail,
          subject: email.subject,
          html: html
        });
        
        // Mark as sent
        await db.update(emailQueue)
          .set({ status: 'sent', sentAt: new Date() })
          .where(eq(emailQueue.id, email.id));
        
        // Log the send
        await db.insert(emailLogs).values({
          userId: email.userId,
          emailType: email.templateName,
          sentAt: new Date()
        });
        
        console.log(`Sent email ${email.id} to ${email.toEmail}`);
      } catch (error: any) {
        console.error(`Failed to send email ${email.id}:`, error);
        
        await db.update(emailQueue)
          .set({ 
            status: 'failed', 
            failedAt: new Date(),
            errorMessage: error.message 
          })
          .where(eq(emailQueue.id, email.id));
      }
    }
  }
  
  // Email template rendering
  static renderTemplate(templateName: string, data: any): string {
    const templates: Record<string, (data: any) => string> = {
      welcome: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Mundo Tango!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>We're excited to have you join our global tango community.</p>
              <p>Complete your profile to start connecting with dancers around the world.</p>
              <a href="${data.profileUrl}" class="button">Complete Your Profile</a>
            </div>
          </div>
        </body>
        </html>
      `,
      
      eventReminders: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .event-details { background: #f7f7f7; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗓️ Event Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Your event is coming up soon!</p>
              <div class="event-details">
                <h3>${data.eventName}</h3>
                <p><strong>When:</strong> ${data.startTime}</p>
                <p><strong>Where:</strong> ${data.location}</p>
              </div>
              <a href="${data.eventUrl}" class="button">View Event Details</a>
            </div>
          </div>
        </body>
        </html>
      `,
      
      newMessages: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Message</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>You have a new message from <strong>${data.senderName}</strong>.</p>
              <a href="${data.messageUrl}" class="button">View Message</a>
            </div>
          </div>
        </body>
        </html>
      `,
      
      friendRequests: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤝 New Friend Request</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p><strong>${data.requesterName}</strong> wants to connect with you on Mundo Tango.</p>
              <a href="${data.profileUrl}" class="button">View Profile</a>
            </div>
          </div>
        </body>
        </html>
      `,
      
      postReactions: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❤️ Someone reacted to your post</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p><strong>${data.reactorName}</strong> reacted to your post.</p>
              <a href="${data.postUrl}" class="button">View Post</a>
            </div>
          </div>
        </body>
        </html>
      `,
      
      housingBookings: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .booking-details { background: #f7f7f7; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Housing Booking Confirmation</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Your booking has been confirmed!</p>
              <div class="booking-details">
                <h3>${data.houseName}</h3>
                <p><strong>Check-in:</strong> ${data.checkIn}</p>
                <p><strong>Check-out:</strong> ${data.checkOut}</p>
              </div>
              <a href="${data.bookingUrl}" class="button">View Booking Details</a>
            </div>
          </div>
        </body>
        </html>
      `,
      
      subscriptionUpdates: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Subscription Renewal Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Your <strong>${data.tierName}</strong> subscription will renew on ${data.renewalDate}.</p>
              <a href="${data.billingUrl}" class="button">Manage Subscription</a>
            </div>
          </div>
        </body>
        </html>
      `,
      
      weeklyDigest: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: white; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
            .stat-label { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Weekly Tango Digest</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Here's what happened in the tango community this week:</p>
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">${data.newEvents}</div>
                  <div class="stat-label">New Events</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${data.newMembers}</div>
                  <div class="stat-label">New Members</div>
                </div>
                <div class="stat">
                  <div class="stat-number">${data.newPosts}</div>
                  <div class="stat-label">New Posts</div>
                </div>
              </div>
              <a href="${data.appUrl}" class="button">Visit Mundo Tango</a>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    return templates[templateName]?.(data) || 'Email template not found';
  }
  
  // Helper: Send welcome email
  static async sendWelcomeEmail(userId: number, email: string, name: string) {
    const appUrl = process.env.APP_URL || 'http://localhost:5000';
    await this.queueEmail(userId, email, 'welcome', 'Welcome to Mundo Tango!', {
      name,
      profileUrl: `${appUrl}/profile/${userId}`
    });
  }
  
  // Helper: Send event reminder
  static async sendEventReminder(userId: number, email: string, event: any) {
    const appUrl = process.env.APP_URL || 'http://localhost:5000';
    await this.queueEmail(userId, email, 'eventReminders', `Reminder: ${event.title}`, {
      name: event.user?.displayName || event.user?.name || 'Tango Dancer',
      eventName: event.title,
      startTime: new Date(event.startDateTime).toLocaleString(),
      location: event.location,
      eventUrl: `${appUrl}/events/${event.id}`
    });
  }
}

// Cron job: Send queued emails every minute
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    EmailService.sendQueuedEmails().catch(err => {
      console.error('Failed to process email queue:', err);
    });
  }, 60 * 1000);
  
  console.log('✅ Email queue processor started (runs every 60 seconds)');
}

import { Resend } from 'resend';
import { db } from '@shared/db';
import { emailQueue, emailPreferences, emailLogs } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getAppUrl } from '../utils/getAppUrl';

// Resend integration using Replit connector
// Reference: Resend connector (connection:conn_resend_01KD7MY1R1YM7PJRHZQJAFXCA6)
let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    // Fallback to environment variable for local development
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      return { apiKey, fromEmail: 'Mundo Tango <noreply@mundotango.life>' };
    }
    throw new Error('Resend not configured: No Replit connector or RESEND_API_KEY');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    // Fallback to environment variable
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      return { apiKey, fromEmail: 'Mundo Tango <noreply@mundotango.life>' };
    }
    throw new Error('Resend not connected');
  }
  return { 
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email || 'Mundo Tango <noreply@mundotango.life>' 
  };
}

// WARNING: Never cache this client. Access tokens expire.
let loggedTestDomainWarning = false;

async function getResendClient(): Promise<{ client: Resend; fromEmail: string } | null> {
  try {
    const { apiKey, fromEmail } = await getCredentials();
    
    // Use Resend's test address if custom domain isn't verified yet
    // This allows emails to work during development/testing
    // Production should use verified custom domain
    const isDomainVerified = process.env.RESEND_DOMAIN_VERIFIED === 'true';
    const effectiveFromEmail = isDomainVerified 
      ? fromEmail 
      : 'Mundo Tango <onboarding@resend.dev>';
    
    if (!isDomainVerified && !loggedTestDomainWarning) {
      console.log('[EmailService] Using Resend test domain (set RESEND_DOMAIN_VERIFIED=true when domain is verified)');
      loggedTestDomainWarning = true;
    }
    
    return {
      client: new Resend(apiKey),
      fromEmail: effectiveFromEmail
    };
  } catch (error) {
    console.warn('[EmailService] Resend not configured:', error);
    return null;
  }
}

console.log('[EmailService] Using Replit connector for Resend with env fallback');

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
    const resendClient = await getResendClient();
    if (!resendClient) {
      console.log('[EmailService] Resend not configured - skipping queue processing');
      return;
    }
    
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
          .set({ status: 'sending', attempts: (email.attempts ?? 0) + 1 })
          .where(eq(emailQueue.id, email.id));
        
        // Send via Resend
        const html = this.renderTemplate(email.templateName, email.templateData);
        
        await resendClient.client.emails.send({
          from: resendClient.fromEmail,
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
      `,
      
      passwordReset: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: white; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 28px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>We received a request to reset your password for your Mundo Tango account.</p>
              <p>Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${data.resetUrl}" class="button">Reset My Password</a>
              </div>
              <div class="warning">
                <strong>This link expires in 1 hour.</strong><br>
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${data.resetUrl}</p>
            </div>
            <div class="footer">
              <p>This email was sent by Mundo Tango. If you have questions, contact our support team.</p>
              <p>Mundo Tango. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      
      emailVerification: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: white; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 28px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px; margin: 20px 0; color: #0c5460; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Welcome to Mundo Tango! Please verify your email address to complete your registration and unlock all features.</p>
              <div style="text-align: center;">
                <a href="${data.verifyUrl}" class="button">Verify My Email</a>
              </div>
              <div class="info">
                <strong>This link expires in 24 hours.</strong><br>
                If you didn't create an account on Mundo Tango, you can safely ignore this email.
              </div>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${data.verifyUrl}</p>
            </div>
            <div class="footer">
              <p>This email was sent by Mundo Tango. If you have questions, contact our support team.</p>
              <p>Mundo Tango. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      
      emailVerificationCode: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: white; border-radius: 0 0 8px 8px; }
            .code-box { background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: monospace; }
            .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px; margin: 20px 0; color: #0c5460; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Verification Code</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Welcome to Mundo Tango! Enter the following 6-digit code to verify your email and complete your registration:</p>
              <div class="code-box">
                <div class="code">${data.code}</div>
              </div>
              <div class="info">
                <strong>This code expires in 24 hours.</strong><br>
                If you didn't create an account on Mundo Tango, you can safely ignore this email.
              </div>
            </div>
            <div class="footer">
              <p>This email was sent by Mundo Tango. If you have questions, contact our support team.</p>
              <p>Mundo Tango. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      
      waitlistInvite: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 40px; background: white; border-radius: 0 0 8px 8px; }
            .invite-code { background: #f8f9fa; border: 3px solid #667eea; padding: 25px; text-align: center; margin: 30px 0; border-radius: 10px; }
            .code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #667eea; font-family: monospace; }
            .button { display: inline-block; padding: 16px 32px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 25px 0; font-weight: bold; font-size: 18px; }
            .highlight { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Mundo Tango Invite is Here!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Great news! You've been selected to join Mundo Tango - the global community where tango dancers connect, discover events, and share their passion for tango.</p>
              
              <div class="highlight">
                <strong>Special Offer:</strong> Use the invite code below to join with exclusive tango community benefits!
              </div>
              
              <div class="invite-code">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Exclusive Invite Code:</p>
                <div class="code">${data.code}</div>
              </div>
              
              <div style="text-align: center;">
                <a href="${data.signupUrl}" class="button">Join Mundo Tango Now</a>
              </div>
              
              <p style="margin-top: 30px;">This code grants you:</p>
              <ul style="line-height: 2;">
                <li>Access to our global tango community</li>
                <li>Discover events worldwide</li>
                <li>Connect with dancers globally</li>
                <li>Access to tango housing marketplace</li>
                <li>Free access to all community features</li>
              </ul>
              
              <p>Simply click the button above and enter your code <strong>${data.code}</strong> during registration.</p>
              
              <p style="margin-top: 30px;">See you on the dance floor!</p>
              <p>The Mundo Tango Team</p>
            </div>
            <div class="footer">
              <p>This email was sent by Mundo Tango. If you have questions, contact our support team.</p>
              <p>Mundo Tango. All rights reserved.</p>
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
  
  // Helper: Send password reset by admin email (direct send - admin action)
  static async sendPasswordResetByAdmin(email: string, name: string, tempPassword: string): Promise<boolean> {
    try {
      const appUrl = getAppUrl();
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0a1929;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0a1929 0%, #1a365d 100%); padding: 40px 20px;">
            <div style="background: rgba(20, 40, 60, 0.9); border-radius: 16px; padding: 32px; border: 1px solid rgba(45, 212, 191, 0.2);">
              <h1 style="color: #2dd4bf; margin: 0 0 24px 0; font-size: 28px; font-weight: 600;">Password Reset</h1>
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Hello ${name},
              </p>
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                An administrator has reset your password. Your new temporary password is:
              </p>
              <div style="background: rgba(45, 212, 191, 0.1); border: 1px solid rgba(45, 212, 191, 0.3); border-radius: 8px; padding: 16px; text-align: center; margin: 0 0 24px 0;">
                <code style="color: #2dd4bf; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${tempPassword}</code>
              </div>
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Please log in with this temporary password and change it immediately for security.
              </p>
              <a href="${appUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%); color: #0a1929; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Login Now
              </a>
              <p style="color: #94a3b8; font-size: 14px; margin: 24px 0 0 0;">
                If you did not expect this email, please contact support immediately.
              </p>
            </div>
            <p style="color: #64748b; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
              Mundo Tango - Connect with the Global Tango Community
            </p>
          </div>
        </body>
        </html>
      `;
      
      const resendClient = await getResendClient();
      if (!resendClient) {
        console.log(`[EmailService] Admin password reset email would be sent to ${email} (Resend not configured)`);
        console.log(`[EmailService] Temp password: ${tempPassword}`);
        return true;
      }
      
      const result = await resendClient.client.emails.send({
        from: resendClient.fromEmail,
        to: email,
        subject: 'Your Password Has Been Reset - Mundo Tango',
        html: html
      });
      
      console.log(`[EmailService] Admin password reset email sent to ${email}`, result);
      return true;
    } catch (error: any) {
      console.error(`[EmailService] Failed to send admin password reset email to ${email}:`, error);
      return false;
    }
  }

  // Helper: Send password reset email (direct send, not queued - time-sensitive)
  static async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    try {
      const appUrl = getAppUrl();
      const resetUrl = `${appUrl}/reset-password/${resetToken}`;
      
      const html = this.renderTemplate('passwordReset', {
        name: name || 'Tango Dancer',
        resetUrl
      });
      
      const resendClient = await getResendClient();
      if (!resendClient) {
        console.log(`[EmailService] Password reset email would be sent to ${email} (Resend not configured)`);
        console.log(`[EmailService] Reset URL: ${resetUrl}`);
        return true; // Return true so the forgot-password endpoint still responds successfully
      }
      
      const result = await resendClient.client.emails.send({
        from: resendClient.fromEmail,
        to: email,
        subject: 'Reset Your Mundo Tango Password',
        html: html
      });
      
      console.log(`[EmailService] Password reset email sent to ${email}`, result);
      return true;
    } catch (error: any) {
      console.error(`[EmailService] Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }
  
  // Helper: Send email verification email (direct send, not queued - time-sensitive)
  static async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<boolean> {
    try {
      const appUrl = getAppUrl();
      const verifyUrl = `${appUrl}/verify-email/${verificationToken}`;
      
      const html = this.renderTemplate('emailVerification', {
        name: name || 'Tango Dancer',
        verifyUrl
      });
      
      const resendClient = await getResendClient();
      if (!resendClient) {
        console.log(`[EmailService] Verification email would be sent to ${email} (Resend not configured)`);
        console.log(`[EmailService] Verify URL: ${verifyUrl}`);
        return true; // Return true so the registration endpoint still responds successfully
      }
      
      console.log(`[EmailService] Sending verification email to ${email} from ${resendClient.fromEmail}`);
      const result = await resendClient.client.emails.send({
        from: resendClient.fromEmail,
        to: email,
        subject: 'Verify Your Email - Mundo Tango',
        html: html
      });
      
      console.log(`[EmailService] Verification email sent to ${email}`, JSON.stringify(result));
      return true;
    } catch (error: any) {
      console.error(`[EmailService] Failed to send verification email to ${email}:`, error?.message || error);
      console.error(`[EmailService] Full error details:`, JSON.stringify(error, null, 2));
      return false;
    }
  }
  
  // Helper: Log email attempt to database for debugging
  private static async logEmailAttempt(
    userId: number | undefined,
    toEmail: string,
    emailType: string,
    status: 'sent' | 'failed',
    externalId: string | null,
    errorMessage: string | null
  ): Promise<void> {
    try {
      await db.insert(emailLogs).values({
        userId: userId || null,
        emailType,
        toEmail,
        status,
        externalId,
        errorMessage,
      });
      console.log(`[EmailService] 📝 Logged email attempt: ${emailType} to ${toEmail} - ${status}`);
    } catch (logError) {
      // Don't fail the email send if logging fails
      console.error(`[EmailService] Failed to log email attempt:`, logError);
    }
  }

  // Helper: Send email verification with 6-digit code (direct send, not queued - time-sensitive)
  // Now includes database logging for debugging delivery issues
  static async sendVerificationCodeEmail(email: string, name: string, verificationCode: string, userId?: number): Promise<boolean> {
    const startTime = Date.now();
    const emailDomain = email.split('@')[1];

    try {
      const html = this.renderTemplate('emailVerificationCode', {
        name: name || 'Tango Dancer',
        code: verificationCode
      });

      const resendClient = await getResendClient();
      if (!resendClient) {
        console.warn(`[EmailService] ⚠️ Resend not configured - verification code NOT sent to ${email}`);
        console.warn(`[EmailService] Verification Code (DEV ONLY): ${verificationCode}`);
        await this.logEmailAttempt(userId, email, 'verification_code', 'failed', null, 'Resend not configured');
        return false;
      }

      console.log(`[EmailService] 📧 Sending verification code email to ${email} (domain: ${emailDomain}) from ${resendClient.fromEmail}`);

      const result = await resendClient.client.emails.send({
        from: resendClient.fromEmail,
        to: email,
        subject: 'Your Verification Code - Mundo Tango',
        html: html
      });

      const duration = Date.now() - startTime;

      if (result.error) {
        console.error(`[EmailService] ❌ Resend API error for ${email}:`, JSON.stringify(result.error));
        await this.logEmailAttempt(userId, email, 'verification_code', 'failed', null, JSON.stringify(result.error));
        return false;
      }

      console.log(`[EmailService] ✅ Verification code email SENT to ${email} in ${duration}ms | ID: ${result.data?.id || 'unknown'}`);
      console.log(`[EmailService] 📋 Email details: to=${email}, domain=${emailDomain}, resendId=${result.data?.id}`);

      // Log successful send to database
      await this.logEmailAttempt(userId, email, 'verification_code', 'sent', result.data?.id || null, null);

      // Log potential delivery issues based on email domain
      const commonIssuesDomains = ['yahoo.com', 'aol.com', 'hotmail.com', 'outlook.com'];
      if (commonIssuesDomains.some(d => emailDomain?.includes(d))) {
        console.log(`[EmailService] ℹ️ Note: ${emailDomain} may have stricter spam filters. If not received, check spam folder.`);
      }

      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[EmailService] ❌ FAILED to send verification code email to ${email} after ${duration}ms`);
      console.error(`[EmailService] Error message: ${error?.message || 'Unknown error'}`);
      console.error(`[EmailService] Error code: ${error?.statusCode || error?.code || 'N/A'}`);
      console.error(`[EmailService] Full error:`, JSON.stringify(error, null, 2));
      await this.logEmailAttempt(userId, email, 'verification_code', 'failed', null, error?.message || 'Unknown error');
      return false;
    }
  }
  
  // Helper: Send waitlist invite email with TANGO code (direct send, not queued)
  static async sendWaitlistInvite(email: string, name: string): Promise<boolean> {
    try {
      const appUrl = getAppUrl();
      const signupUrl = `${appUrl}/signup?code=tango`;
      
      const html = this.renderTemplate('waitlistInvite', {
        name: name || 'Tango Dancer',
        code: 'TANGO',
        signupUrl
      });
      
      const resendClient = await getResendClient();
      if (!resendClient) {
        console.log(`[EmailService] Waitlist invite would be sent to ${email} (Resend not configured)`);
        console.log(`[EmailService] Signup URL: ${signupUrl}`);
        return true;
      }
      
      console.log(`[EmailService] Sending waitlist invite to ${email} from ${resendClient.fromEmail}`);
      const result = await resendClient.client.emails.send({
        from: resendClient.fromEmail,
        to: email,
        subject: 'Your Mundo Tango Invite - Join the Global Tango Community!',
        html: html
      });
      
      console.log(`[EmailService] Waitlist invite sent to ${email}`, JSON.stringify(result));
      return true;
    } catch (error: any) {
      console.error(`[EmailService] Failed to send waitlist invite to ${email}:`, error?.message || error);
      return false;
    }
  }
  
  // Helper: Send onboarding reminder email (direct send, not queued)
  // MB.MD Pattern 67 - Action tool for Mr. Blue to resolve user issues
  static async sendOnboardingReminderEmail(email: string, name: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const appUrl = getAppUrl();
      const profileUrl = `${appUrl}/onboarding`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Complete Your Tango Journey</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your profile is waiting for you</p>
            </div>
            <div style="padding: 30px; background: #1e293b; border-radius: 0 0 12px 12px;">
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                We noticed you haven't completed your Mundo Tango profile yet. Complete your onboarding to:
              </p>
              <ul style="color: #94a3b8; font-size: 14px; line-height: 1.8;">
                <li>Connect with dancers worldwide</li>
                <li>Discover tango events near you</li>
                <li>Join the global tango community</li>
                <li>Find teachers and classes</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${profileUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Complete My Profile
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px; text-align: center;">
                This email was sent by Mr. Blue, your Mundo Tango AI assistant.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const resendClient = await getResendClient();
      if (!resendClient) {
        console.log(`[EmailService] Onboarding reminder would be sent to ${email} (Resend not configured)`);
        return false;
      }
      
      console.log(`[EmailService] 📧 Sending onboarding reminder to ${email}`);
      const result = await resendClient.client.emails.send({
        from: resendClient.fromEmail,
        to: email,
        subject: 'Complete Your Tango Profile - Mundo Tango',
        html: html
      });
      
      const duration = Date.now() - startTime;
      
      if (result.error) {
        console.error(`[EmailService] ❌ Failed to send onboarding reminder to ${email}:`, result.error);
        return false;
      }
      
      console.log(`[EmailService] ✅ Onboarding reminder sent to ${email} in ${duration}ms | ID: ${result.data?.id}`);
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[EmailService] ❌ FAILED to send onboarding reminder to ${email} after ${duration}ms:`, error?.message);
      return false;
    }
  }
  
  // Helper: Send feedback response email (direct send, not queued)
  static async sendFeedbackResponseEmail(
    email: string, 
    name: string, 
    feedbackTitle: string,
    status: 'approved' | 'rejected' | 'resolved',
    adminNotes?: string
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const appUrl = getAppUrl();
      const statusMessages = {
        approved: 'Your feedback has been reviewed and approved. Our team is now working on addressing your request.',
        rejected: 'After careful review, we were unable to proceed with your request at this time.',
        resolved: 'Great news! Your feedback has been addressed and the issue has been resolved.'
      };
      
      const statusColors = {
        approved: '#10B981',
        rejected: '#EF4444', 
        resolved: '#3B82F6'
      };
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; border: 1px solid #334155;">
                  <tr>
                    <td style="padding: 40px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 12px 24px; border-radius: 12px;">
                          <span style="color: white; font-weight: bold; font-size: 24px;">MT</span>
                        </div>
                        <h1 style="color: white; margin-top: 16px; margin-bottom: 0; font-size: 28px;">Mundo Tango</h1>
                      </div>
                      
                      <div style="background-color: #1e293b; border-radius: 12px; padding: 24px; border-left: 4px solid ${statusColors[status]};">
                        <h2 style="color: white; margin: 0 0 16px 0; font-size: 20px;">Feedback Update</h2>
                        <p style="color: #94a3b8; margin: 0 0 8px 0;">Hi ${name || 'Tango Dancer'},</p>
                        <p style="color: #e2e8f0; margin: 0 0 16px 0;">${statusMessages[status]}</p>
                        
                        <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0;">
                          <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Your Feedback</p>
                          <p style="color: white; margin: 0; font-weight: 500;">${feedbackTitle}</p>
                          <p style="color: ${statusColors[status]}; margin: 8px 0 0 0; font-weight: 500; text-transform: capitalize;">${status}</p>
                        </div>
                        
                        ${adminNotes ? `
                        <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0;">
                          <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Admin Response</p>
                          <p style="color: #e2e8f0; margin: 0;">${adminNotes}</p>
                        </div>
                        ` : ''}
                      </div>
                      
                      <div style="text-align: center; margin-top: 24px;">
                        <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                          Visit Mundo Tango
                        </a>
                      </div>
                      
                      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155;">
                        <p style="color: #64748b; margin: 0; font-size: 12px;">
                          Thank you for helping us improve Mundo Tango!
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
      
      const resendClient = await getResendClient();
      if (!resendClient) {
        console.log(`[EmailService] 📧 Feedback response email would be sent to ${email} (Resend not configured)`);
        return true;
      }
      
      console.log(`[EmailService] 📧 Sending feedback response email to ${email}...`);
      
      const result = await resendClient.client.emails.send({
        from: resendClient.fromEmail,
        to: email,
        subject: `Your Feedback Has Been ${status.charAt(0).toUpperCase() + status.slice(1)} - Mundo Tango`,
        html: html
      });
      
      const duration = Date.now() - startTime;
      
      if (result.error) {
        console.error(`[EmailService] ❌ Resend API error for ${email}:`, JSON.stringify(result.error));
        return false;
      }
      
      console.log(`[EmailService] ✅ Feedback response email SENT to ${email} in ${duration}ms | ID: ${result.data?.id || 'unknown'}`);
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[EmailService] ❌ FAILED to send feedback response email to ${email} after ${duration}ms`);
      console.error(`[EmailService] Error: ${error?.message || 'Unknown error'}`);
      return false;
    }
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

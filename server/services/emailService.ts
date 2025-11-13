import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export class EmailService {
  /**
   * Send email verification link
   */
  static async sendVerificationEmail(email: string, token: string): Promise<{ success: boolean; error?: any }> {
    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY not configured - email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const verificationUrl = `${process.env.REPL_DEPLOYMENT_URL || 'http://localhost:5000'}/verify-email?token=${token}`;

      const { data, error } = await resend.emails.send({
        from: 'Mundo Tango <noreply@mundotango.life>',
        to: [email],
        subject: 'Verify Your Email - Mundo Tango 💃',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%); padding: 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9fafb; }
                .button { 
                  display: inline-block; 
                  padding: 12px 30px; 
                  background: #0EA5E9; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  margin: 20px 0;
                }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to Mundo Tango!</h1>
                </div>
                <div class="content">
                  <p>Hi there!</p>
                  <p>Thank you for joining the global tango community. Please verify your email address to get started:</p>
                  <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </div>
                  <p style="color: #666; font-size: 14px;">
                    Or copy and paste this link into your browser:<br>
                    <span style="word-break: break-all;">${verificationUrl}</span>
                  </p>
                  <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    If you didn't create this account, you can safely ignore this email.
                  </p>
                </div>
                <div class="footer">
                  <p>© 2025 Mundo Tango. All rights reserved.</p>
                  <p>Connecting the global tango community.</p>
                </div>
              </div>
            </body>
          </html>
        `
      });

      if (error) throw error;
      console.log('✅ Verification email sent to:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error };
    }
  }

  /**
   * Send password reset link
   */
  static async sendPasswordReset(email: string, token: string): Promise<{ success: boolean; error?: any }> {
    if (!resend) {
      console.warn('⚠️ RESEND_API_KEY not configured - email not sent');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const resetUrl = `${process.env.REPL_DEPLOYMENT_URL || 'http://localhost:5000'}/reset-password?token=${token}`;

      const { data, error } = await resend.emails.send({
        from: 'Mundo Tango <noreply@mundotango.life>',
        to: [email],
        subject: 'Reset Your Password - Mundo Tango',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%); padding: 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9fafb; }
                .button { 
                  display: inline-block; 
                  padding: 12px 30px; 
                  background: #EF4444; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  margin: 20px 0;
                }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p>We received a request to reset your password. Click the button below to create a new password:</p>
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                  </div>
                  <p style="color: #666; font-size: 14px;">
                    Or copy and paste this link into your browser:<br>
                    <span style="word-break: break-all;">${resetUrl}</span>
                  </p>
                  <p style="color: #EF4444; font-size: 14px; margin-top: 30px;">
                    ⚠️ This link expires in 1 hour for security.
                  </p>
                  <p style="color: #666; font-size: 12px;">
                    If you didn't request this, you can safely ignore this email. Your password won't change.
                  </p>
                </div>
                <div class="footer">
                  <p>© 2025 Mundo Tango. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      });

      if (error) throw error;
      console.log('✅ Password reset email sent to:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error };
    }
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; error?: any }> {
    if (!resend) return { success: false, error: 'Email service not configured' };

    try {
      const { data, error } = await resend.emails.send({
        from: 'Mundo Tango <welcome@mundotango.life>',
        to: [email],
        subject: 'Welcome to Mundo Tango! 💃🕺',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%); padding: 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9fafb; }
                .button { 
                  display: inline-block; 
                  padding: 12px 30px; 
                  background: #0EA5E9; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 6px; 
                  margin: 20px 0;
                }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome ${name}! 💃🕺</h1>
                </div>
                <div class="content">
                  <p>Welcome to Mundo Tango - the global tango community!</p>
                  <p>You're now part of a passionate community of dancers, teachers, and tango lovers from around the world.</p>
                  <h3>Get Started:</h3>
                  <ul>
                    <li>🎭 Complete your profile</li>
                    <li>📅 Discover local events and milongas</li>
                    <li>👥 Connect with dancers in your area</li>
                    <li>🎵 Explore our music library</li>
                    <li>🤖 Chat with Mr. Blue AI for help</li>
                  </ul>
                  <div style="text-align: center;">
                    <a href="${process.env.REPL_DEPLOYMENT_URL || 'http://localhost:5000'}/dashboard" class="button">
                      Get Started
                    </a>
                  </div>
                </div>
                <div class="footer">
                  <p>© 2025 Mundo Tango. All rights reserved.</p>
                  <p>Happy dancing! 💃🕺</p>
                </div>
              </div>
            </body>
          </html>
        `
      });

      if (error) throw error;
      console.log('✅ Welcome email sent to:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Welcome email error:', error);
      return { success: false, error };
    }
  }

  /**
   * Send God Level subscription confirmation
   */
  static async sendGodLevelConfirmation(email: string, name: string): Promise<{ success: boolean; error?: any }> {
    if (!resend) return { success: false, error: 'Email service not configured' };

    try {
      const { data, error } = await resend.emails.send({
        from: 'Mundo Tango <premium@mundotango.life>',
        to: [email],
        subject: '🎉 Welcome to God Level - Mundo Tango',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9fafb; }
                .feature { padding: 15px; margin: 10px 0; background: white; border-left: 4px solid #8B5CF6; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Welcome to God Level!</h1>
                </div>
                <div class="content">
                  <p>Hi ${name},</p>
                  <p>Congratulations! You're now a <strong>God Level</strong> member with access to our most advanced features:</p>
                  
                  <div class="feature">
                    <strong>🎬 AI Video Avatars (D-ID)</strong>
                    <p>Create marketing videos with your AI avatar - upload a photo and generate professional videos!</p>
                  </div>
                  
                  <div class="feature">
                    <strong>🎤 Voice Cloning (ElevenLabs)</strong>
                    <p>Clone your voice for personalized audio content and marketing materials.</p>
                  </div>
                  
                  <div class="feature">
                    <strong>🤖 Life CEO AI System</strong>
                    <p>Access to 16 specialized AI agents for business intelligence and automation.</p>
                  </div>
                  
                  <div class="feature">
                    <strong>⚡ Priority Support</strong>
                    <p>Get VIP support and early access to new features.</p>
                  </div>
                  
                  <p>Ready to unleash the full power of Mundo Tango?</p>
                  
                  <div style="text-align: center;">
                    <a href="${process.env.REPL_DEPLOYMENT_URL || 'http://localhost:5000'}/dashboard/god-level" 
                       style="display: inline-block; padding: 12px 30px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                      Explore God Level Features
                    </a>
                  </div>
                </div>
                <div class="footer">
                  <p>© 2025 Mundo Tango. All rights reserved.</p>
                  <p>You're now part of the elite! 🚀</p>
                </div>
              </div>
            </body>
          </html>
        `
      });

      if (error) throw error;
      console.log('✅ God Level confirmation sent to:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ God Level email error:', error);
      return { success: false, error };
    }
  }
}

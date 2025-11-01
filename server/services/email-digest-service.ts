/**
 * EMAIL DIGEST SERVICE
 * Sends periodic email digests of notifications
 */

import { storage } from "../storage";

interface DigestFrequency {
  userId: number;
  frequency: "daily" | "weekly" | "never";
  lastSent: Date;
}

export class EmailDigestService {
  private digestPreferences: Map<number, DigestFrequency> = new Map();

  async sendDailyDigest() {
    console.log("[Email Digest] Starting daily digest send...");
    
    const users = await storage.getAllUsers();
    
    for (const user of users) {
      const pref = this.digestPreferences.get(user.id);
      
      if (!pref || pref.frequency === "never") continue;
      if (pref.frequency !== "daily") continue;

      const notifications = await storage.getUnreadNotifications(user.id);
      
      if (notifications.length === 0) continue;

      await this.sendDigestEmail(user, notifications, "daily");
      
      this.digestPreferences.set(user.id, {
        ...pref,
        lastSent: new Date(),
      });
    }
    
    console.log("[Email Digest] Daily digest complete");
  }

  async sendWeeklyDigest() {
    console.log("[Email Digest] Starting weekly digest send...");
    
    const users = await storage.getAllUsers();
    
    for (const user of users) {
      const pref = this.digestPreferences.get(user.id);
      
      if (!pref || pref.frequency === "never") continue;
      if (pref.frequency !== "weekly") continue;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const notifications = await storage.getNotificationsSince(user.id, oneWeekAgo);
      
      if (notifications.length === 0) continue;

      await this.sendDigestEmail(user, notifications, "weekly");
      
      this.digestPreferences.set(user.id, {
        ...pref,
        lastSent: new Date(),
      });
    }
    
    console.log("[Email Digest] Weekly digest complete");
  }

  private async sendDigestEmail(user: any, notifications: any[], frequency: string) {
    console.log(`[Email Digest] Sending ${frequency} digest to ${user.email} (${notifications.length} notifications)`);
    
    const digestHtml = this.generateDigestHTML(user, notifications, frequency);
    
    console.log(`[Email Digest] Would send email to ${user.email}:`, {
      subject: `Your ${frequency} Mundo Tango digest`,
      notificationCount: notifications.length,
    });
  }

  private generateDigestHTML(user: any, notifications: any[], frequency: string): string {
    const groupedNotifications = this.groupNotificationsByType(notifications);
    
    let html = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Your ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Digest</h1>
          <p>Hi ${user.name},</p>
          <p>Here's what you missed on Mundo Tango:</p>
    `;

    for (const [type, notifs] of Object.entries(groupedNotifications)) {
      html += `
        <h2>${this.getTypeLabel(type as string)} (${(notifs as any[]).length})</h2>
        <ul>
      `;
      
      for (const notif of notifs as any[]) {
        html += `
          <li>
            <strong>${notif.title}</strong>
            <p>${notif.message}</p>
          </li>
        `;
      }
      
      html += `</ul>`;
    }

    html += `
          <p>
            <a href="https://mundotango.app/notifications" style="background: #B91C3B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View All Notifications
            </a>
          </p>
        </body>
      </html>
    `;

    return html;
  }

  private groupNotificationsByType(notifications: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    for (const notif of notifications) {
      if (!grouped[notif.type]) {
        grouped[notif.type] = [];
      }
      grouped[notif.type].push(notif);
    }
    
    return grouped;
  }

  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      friend_request: "Friend Requests",
      post_like: "Post Likes",
      post_comment: "Comments",
      mention: "Mentions",
      event_invitation: "Event Invitations",
    };
    
    return labels[type] || type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }

  setUserPreference(userId: number, frequency: "daily" | "weekly" | "never") {
    this.digestPreferences.set(userId, {
      userId,
      frequency,
      lastSent: new Date(),
    });
  }
}

export const emailDigestService = new EmailDigestService();

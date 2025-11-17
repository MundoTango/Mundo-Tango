import { db } from '../db';
import { virtualEmails, virtualEmailLogs, users } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface CreateVirtualEmailParams {
  userId: number;
  label: string;
  forwardTo?: string;
}

interface VirtualEmail {
  id: number;
  userId: number;
  virtualEmail: string;
  label: string;
  forwardTo: string;
  isActive: boolean;
  emailCount: number;
  spamCount: number;
  createdAt: Date;
}

export class VirtualEmailService {
  private domain = 'mt-mail.mundotango.life';

  async createVirtualEmail(params: CreateVirtualEmailParams): Promise<VirtualEmail> {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, params.userId))
      .limit(1)
      .then(rows => rows[0]);

    if (!user) {
      throw new Error('User not found');
    }

    const randomId = nanoid(10).toLowerCase();
    const virtualEmail = `${randomId}@${this.domain}`;

    const [email] = await db.insert(virtualEmails).values({
      userId: params.userId,
      virtualEmail,
      label: params.label,
      forwardTo: params.forwardTo || user.email,
      isActive: true,
      emailCount: 0,
      spamCount: 0
    }).returning();

    return {
      ...email,
      isActive: email.isActive ?? true,
      emailCount: email.emailCount ?? 0,
      spamCount: email.spamCount ?? 0
    } as VirtualEmail;
  }

  async handleIncomingEmail(params: {
    to: string;
    from: string;
    subject: string;
    body: string;
  }): Promise<void> {
    const virtualEmail = await db.select()
      .from(virtualEmails)
      .where(eq(virtualEmails.virtualEmail, params.to))
      .limit(1)
      .then(rows => rows[0]);

    if (!virtualEmail || !virtualEmail.isActive) {
      return;
    }

    const isSpam = await this.detectSpam(params);

    if (isSpam) {
      await db.update(virtualEmails)
        .set({ spamCount: sql`spam_count + 1` })
        .where(eq(virtualEmails.id, virtualEmail.id));

      if (virtualEmail.spamCount >= 4) {
        await this.disableVirtualEmail(virtualEmail.id);
      }

      await db.insert(virtualEmailLogs).values({
        virtualEmailId: virtualEmail.id,
        from: params.from,
        subject: params.subject,
        isSpam: true,
        receivedAt: new Date()
      });

      return;
    }

    await db.update(virtualEmails)
      .set({ emailCount: sql`email_count + 1` })
      .where(eq(virtualEmails.id, virtualEmail.id));

    await db.insert(virtualEmailLogs).values({
      virtualEmailId: virtualEmail.id,
      from: params.from,
      subject: params.subject,
      isSpam: false,
      receivedAt: new Date()
    });

    console.log(`Email forwarded from ${params.from} to ${virtualEmail.forwardTo}`);
  }

  async disableVirtualEmail(emailId: number): Promise<void> {
    await db.update(virtualEmails)
      .set({ 
        isActive: false,
        disabledAt: new Date()
      })
      .where(eq(virtualEmails.id, emailId));
  }

  async enableVirtualEmail(emailId: number): Promise<void> {
    await db.update(virtualEmails)
      .set({ 
        isActive: true,
        disabledAt: null
      })
      .where(eq(virtualEmails.id, emailId));
  }

  async deleteVirtualEmail(emailId: number, userId: number): Promise<void> {
    const email = await db.query.virtualEmails.findFirst({
      where: and(
        eq(virtualEmails.id, emailId),
        eq(virtualEmails.userId, userId)
      )
    });

    if (!email) {
      throw new Error('Virtual email not found or unauthorized');
    }

    await db.delete(virtualEmails)
      .where(eq(virtualEmails.id, emailId));
  }

  private async detectSpam(email: { from: string; subject: string; body: string }): Promise<boolean> {
    const spamIndicators = [
      /viagra/i,
      /casino/i,
      /lottery/i,
      /winner/i,
      /congratulations/i,
      /click here now/i,
      /limited time/i,
      /act now/i,
      /free money/i
    ];

    const text = `${email.subject} ${email.body}`.toLowerCase();
    return spamIndicators.some(pattern => pattern.test(text));
  }

  async getUserVirtualEmails(userId: number): Promise<VirtualEmail[]> {
    const emails = await db.select()
      .from(virtualEmails)
      .where(eq(virtualEmails.userId, userId));
    
    return emails.map(email => ({
      ...email,
      isActive: email.isActive ?? true,
      emailCount: email.emailCount ?? 0,
      spamCount: email.spamCount ?? 0
    })) as VirtualEmail[];
  }
}

import { Worker, Job, Queue } from 'bullmq';
import { getRedisClient } from '../cache/redis-cache';
import { jobDuration, jobTotal } from '../monitoring/prometheus';
import { db } from '@shared/db';
import { 
  scheduledMessages, 
  messageAutomations, 
  connectedChannels,
  externalMessages 
} from '@shared/schema';
import { eq, and, lte, sql } from 'drizzle-orm';
import { sendEmail } from '../lib/gmail-client';
import { facebookOAuthService } from '../services/facebook/FacebookOAuthService';
import { decrypt } from '../utils/encryption';

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface ScheduledMessageJob {
  messageId: number;
  userId: number;
  channel: string;
  to: string;
  subject?: string;
  body: string;
  scheduledFor: Date;
}

interface AutomationJob {
  automationId: number;
  userId: number;
  automationType: string;
  trigger: any;
  action: any;
  channel: string;
}

const messagingQueue = new Queue('messaging-queue', {
  connection: getRedisClient(),
});

export async function scheduleMessage(messageId: number, scheduledFor: Date): Promise<void> {
  const delay = scheduledFor.getTime() - Date.now();
  if (delay <= 0) {
    console.log(`[Messaging Worker] Message ${messageId} scheduled for past, sending immediately`);
  }
  
  await messagingQueue.add(
    'send-scheduled-message',
    { messageId },
    { 
      delay: Math.max(0, delay),
      jobId: `scheduled-message-${messageId}`,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
  
  console.log(`[Messaging Worker] Scheduled message ${messageId} for ${scheduledFor.toISOString()}`);
}

export async function registerAutomation(automationId: number): Promise<void> {
  const [automation] = await db
    .select()
    .from(messageAutomations)
    .where(eq(messageAutomations.id, automationId));
  
  if (!automation) {
    console.error(`[Messaging Worker] Automation ${automationId} not found`);
    return;
  }

  if (automation.automationType === 'scheduled') {
    const schedule = automation.trigger as any;
    if (schedule?.cron) {
      await messagingQueue.add(
        'run-automation',
        { automationId },
        {
          repeat: { pattern: schedule.cron },
          jobId: `automation-${automationId}`,
        }
      );
      console.log(`[Messaging Worker] Registered cron automation ${automationId}: ${schedule.cron}`);
    }
  } else if (automation.automationType === 'auto_reply') {
    console.log(`[Messaging Worker] Registered auto-reply automation ${automationId}`);
  }
}

export async function unregisterAutomation(automationId: number): Promise<void> {
  const jobId = `automation-${automationId}`;
  
  try {
    const repeatableJobs = await messagingQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.id === jobId || job.key?.includes(jobId)) {
        await messagingQueue.removeRepeatableByKey(job.key);
        console.log(`[Messaging Worker] Removed repeatable job for automation ${automationId}`);
      }
    }
    
    const job = await messagingQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`[Messaging Worker] Removed job for automation ${automationId}`);
    }
  } catch (error) {
    console.error(`[Messaging Worker] Error unregistering automation ${automationId}:`, error);
  }
}

async function processScheduledMessage(messageId: number): Promise<void> {
  const [scheduled] = await db
    .select()
    .from(scheduledMessages)
    .where(eq(scheduledMessages.id, messageId));

  if (!scheduled) {
    console.error(`[Messaging Worker] Scheduled message ${messageId} not found`);
    return;
  }

  if (scheduled.status === 'sent' || scheduled.status === 'cancelled') {
    console.log(`[Messaging Worker] Message ${messageId} already ${scheduled.status}`);
    return;
  }

  const { channel, to, subject, body, userId } = scheduled;
  let success = false;
  let error: string | null = null;

  try {
    if (channel === 'gmail') {
      const result = await sendEmail(to, subject || 'Message from Mundo Tango', body);
      console.log(`[Messaging Worker] Gmail message sent: ${result.id}`);
      success = true;
    } else if (channel === 'facebook' || channel === 'instagram' || channel === 'whatsapp') {
      const [channelConnection] = await db
        .select()
        .from(connectedChannels)
        .where(
          and(
            eq(connectedChannels.userId, userId),
            eq(connectedChannels.channel, channel),
            eq(connectedChannels.isActive, true)
          )
        );

      if (!channelConnection?.accessToken) {
        throw new Error(`${channel} channel not properly configured`);
      }

      const decryptedToken = decrypt(channelConnection.accessToken);

      if (channel === 'facebook') {
        const result = await facebookOAuthService.sendMessage(decryptedToken, {
          recipientPSID: to,
          message: body,
          messagingType: 'MESSAGE_TAG',
        });
        if (result.success) {
          success = true;
          console.log(`[Messaging Worker] Facebook message sent: ${result.messageId}`);
        } else {
          throw new Error(result.error || 'Failed to send Facebook message');
        }
      } else if (channel === 'instagram') {
        const response = await fetch(`${GRAPH_API_BASE}/me/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: to },
            message: { text: body },
            access_token: decryptedToken,
          }),
        });
        if (response.ok) {
          success = true;
          console.log(`[Messaging Worker] Instagram message sent`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to send Instagram message');
        }
      } else if (channel === 'whatsapp') {
        const phoneId = channelConnection.accountId;
        const response = await fetch(`${GRAPH_API_BASE}/${phoneId}/messages`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${decryptedToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to,
            type: 'text',
            text: { body },
          }),
        });
        if (response.ok) {
          success = true;
          console.log(`[Messaging Worker] WhatsApp message sent`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to send WhatsApp message');
        }
      }
    } else if (channel === 'mt') {
      console.log(`[Messaging Worker] MT internal message - no external delivery needed`);
      success = true;
    }
  } catch (err: any) {
    error = err.message || 'Unknown error';
    console.error(`[Messaging Worker] Error sending scheduled message ${messageId}:`, err);
  }

  await db
    .update(scheduledMessages)
    .set({
      status: success ? 'sent' : 'failed',
      sentAt: success ? new Date() : null,
      error: error,
    })
    .where(eq(scheduledMessages.id, messageId));
}

async function processAutomation(automationId: number): Promise<void> {
  const [automation] = await db
    .select()
    .from(messageAutomations)
    .where(
      and(
        eq(messageAutomations.id, automationId),
        eq(messageAutomations.isActive, true)
      )
    );

  if (!automation) {
    console.log(`[Messaging Worker] Automation ${automationId} not found or inactive`);
    return;
  }

  console.log(`[Messaging Worker] Processing automation ${automationId}: ${automation.name}`);

  const action = automation.action as any;
  if (action?.type === 'send_message' && action.templateId) {
    console.log(`[Messaging Worker] Would send template ${action.templateId}`);
  }

  await db
    .update(messageAutomations)
    .set({ lastTriggeredAt: new Date() })
    .where(eq(messageAutomations.id, automationId));
}

const messagingWorker = new Worker(
  'messaging-queue',
  async (job: Job) => {
    const start = Date.now();
    const jobType = job.name;
    
    try {
      console.log(`[Messaging Worker] Processing job ${job.id}: ${jobType}`);
      
      if (jobType === 'send-scheduled-message') {
        await processScheduledMessage(job.data.messageId);
      } else if (jobType === 'run-automation') {
        await processAutomation(job.data.automationId);
      } else if (jobType === 'check-pending-messages') {
        const pendingMessages = await db
          .select()
          .from(scheduledMessages)
          .where(
            and(
              eq(scheduledMessages.status, 'pending'),
              lte(scheduledMessages.scheduledFor, new Date())
            )
          );
        
        for (const msg of pendingMessages) {
          await processScheduledMessage(msg.id);
        }
        
        console.log(`[Messaging Worker] Processed ${pendingMessages.length} pending messages`);
      }
      
      const duration = (Date.now() - start) / 1000;
      jobDuration.observe({ job_type: `messaging-${jobType}`, status: 'success' }, duration);
      jobTotal.inc({ job_type: `messaging-${jobType}`, status: 'success' });
      
      return { success: true, processedAt: new Date().toISOString() };
    } catch (error: any) {
      const duration = (Date.now() - start) / 1000;
      jobDuration.observe({ job_type: `messaging-${jobType}`, status: 'failed' }, duration);
      jobTotal.inc({ job_type: `messaging-${jobType}`, status: 'failed' });
      
      console.error(`[Messaging Worker] Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: getRedisClient(),
    concurrency: 3,
  }
);

messagingWorker.on('completed', (job) => {
  console.log(`[Messaging Worker] Job ${job.id} completed`);
});

messagingWorker.on('failed', (job, err) => {
  console.error(`[Messaging Worker] Job ${job?.id} failed:`, err);
});

messagingQueue.add(
  'check-pending-messages',
  {},
  {
    repeat: { pattern: '*/5 * * * *' },
    jobId: 'check-pending-messages',
  }
).catch(err => {
  console.error('[Messaging Worker] Failed to schedule pending message check:', err);
});

export { messagingWorker, messagingQueue };

import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../cache/redis-cache';
import { jobDuration, jobTotal } from '../monitoring/prometheus';

/**
 * Email Worker
 * Processes email sending jobs in background
 */

interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

const emailWorker = new Worker(
  'email-queue',
  async (job: Job<EmailJob>) => {
    const start = Date.now();
    
    try {
      console.log(`Processing email job ${job.id} to ${job.data.to}`);
      
      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      await sendEmail(job.data);
      
      const duration = (Date.now() - start) / 1000;
      jobDuration.observe({ job_type: 'email', status: 'success' }, duration);
      jobTotal.inc({ job_type: 'email', status: 'success' });
      
      return { success: true, sentAt: new Date().toISOString() };
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      jobDuration.observe({ job_type: 'email', status: 'failed' }, duration);
      jobTotal.inc({ job_type: 'email', status: 'failed' });
      
      console.error('Email job failed:', error);
      throw error;
    }
  },
  {
    connection: getRedisClient(),
    concurrency: 5,
  }
);

async function sendEmail(data: EmailJob): Promise<void> {
  // Simulate email sending
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  console.log(`Email sent to ${data.to}: ${data.subject}`);
  
  // TODO: Replace with actual email service
  /*
  const msg = {
    to: data.to,
    from: 'noreply@mundotango.life',
    subject: data.subject,
    html: renderTemplate(data.template, data.data),
  };
  
  await emailService.send(msg);
  */
}

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err);
});

export { emailWorker };

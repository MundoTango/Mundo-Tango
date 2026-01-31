import { db } from '../db';
import { users, outreachSequences, outreachSteps } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { calculateYearsInRole, getMaxExperienceYears } from '@shared/utils/roleExperience';

interface GenerateOutreachParams {
  candidateId: number;
  opportunityDescription: string;
  tone: 'formal' | 'casual' | 'enthusiastic';
  channel: 'email' | 'linkedin' | 'messenger';
  targetRole?: string;
}

interface OutreachMessage {
  subject: string;
  body: string;
  channel: string;
  variables: Record<string, string>;
}

export class AIOutreachGenerator {
  async generateOutreach(params: GenerateOutreachParams): Promise<OutreachMessage> {
    const candidate = await db.select()
      .from(users)
      .where(eq(users.id, params.candidateId))
      .limit(1)
      .then(rows => rows[0]);

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const candidateExperience = params.targetRole
      ? calculateYearsInRole(candidate, params.targetRole)
      : getMaxExperienceYears(candidate);

    const message = this.generatePersonalizedMessage({
      candidateName: candidate.name,
      candidateBio: candidate.bio || '',
      candidateExperience,
      candidateCity: candidate.city || '',
      opportunityDescription: params.opportunityDescription,
      tone: params.tone,
      targetRole: params.targetRole
    });

    return {
      subject: message.subject,
      body: message.body,
      channel: params.channel,
      variables: {
        name: candidate.name,
        city: candidate.city || '',
        experience: candidateExperience.toString(),
        role: params.targetRole || ''
      }
    };
  }

  private generatePersonalizedMessage(context: {
    candidateName: string;
    candidateBio: string;
    candidateExperience: number;
    candidateCity: string;
    opportunityDescription: string;
    tone: 'formal' | 'casual' | 'enthusiastic';
    targetRole?: string;
  }): { subject: string; body: string } {
    const roleLabel = context.targetRole ? this.formatRoleLabel(context.targetRole) : null;
    const experiencePhrase = roleLabel
      ? `${context.candidateExperience} years as a ${roleLabel}`
      : `${context.candidateExperience} years of tango experience`;

    const subjects = {
      formal: `Opportunity: ${context.opportunityDescription.slice(0, 50)}`,
      casual: `Hey ${context.candidateName}, exciting opportunity!`,
      enthusiastic: `🎉 ${context.candidateName}, you'd be perfect for this!`
    };

    const greetings = {
      formal: `Dear ${context.candidateName},`,
      casual: `Hi ${context.candidateName},`,
      enthusiastic: `Hey ${context.candidateName}!`
    };

    const intros = {
      formal: `I came across your profile and was impressed by your ${experiencePhrase}${context.candidateCity ? ` in ${context.candidateCity}` : ''}.`,
      casual: `I've been looking at profiles and yours really stood out! ${experiencePhrase} is impressive.`,
      enthusiastic: `Your profile caught my eye immediately! With ${experiencePhrase}, you have exactly what we're looking for!`
    };

    const closings = {
      formal: 'I look forward to hearing from you.\n\nBest regards',
      casual: 'Would love to chat more about this!\n\nCheers',
      enthusiastic: 'Can\'t wait to hear what you think!\n\nLooking forward to it'
    };

    const body = `${greetings[context.tone]}

${intros[context.tone]}

${context.opportunityDescription}

Would you be interested in a 15-minute call to discuss this opportunity?

${closings[context.tone]}`;

    return {
      subject: subjects[context.tone],
      body
    };
  }

  async createFollowUpSequence(params: {
    userId: number;
    candidateId: number;
    opportunityDescription: string;
    initialMessage: OutreachMessage;
  }): Promise<number> {
    const [sequence] = await db.insert(outreachSequences).values({
      userId: params.userId,
      candidateId: params.candidateId,
      opportunityDescription: params.opportunityDescription,
      status: 'active',
      currentStep: 1
    }).returning();

    const steps = [
      {
        stepNumber: 1,
        delayDays: 0,
        subject: params.initialMessage.subject,
        body: params.initialMessage.body,
        channel: params.initialMessage.channel,
        status: 'sent' as const
      },
      {
        stepNumber: 2,
        delayDays: 3,
        subject: 'Following up: ' + params.initialMessage.subject,
        body: this.generateFollowUpMessage(1, params.opportunityDescription),
        channel: params.initialMessage.channel,
        status: 'pending' as const
      },
      {
        stepNumber: 3,
        delayDays: 7,
        subject: 'Quick check-in',
        body: this.generateFollowUpMessage(2, params.opportunityDescription),
        channel: params.initialMessage.channel,
        status: 'pending' as const
      }
    ];

    for (const step of steps) {
      await db.insert(outreachSteps).values({
        sequenceId: sequence.id,
        ...step
      });
    }

    return sequence.id;
  }

  private generateFollowUpMessage(stepNumber: number, opportunity: string): string {
    if (stepNumber === 1) {
      return `Hi again,

I wanted to follow up on my previous message about ${opportunity.slice(0, 100)}.

I understand you're busy, but I thought this opportunity might be a great fit for your background.

Would you have 10 minutes this week for a quick call?

Best regards`;
    } else {
      return `Hi,

I hope this message finds you well. I'm reaching out one last time about the opportunity I mentioned.

If you're not interested, no worries at all! Just let me know so I can stop bothering you 😊

Otherwise, I'd still love to chat briefly about how this could be a good fit.

Thanks for your time!`;
    }
  }

  private formatRoleLabel(role: string): string {
    const roleLabels: Record<string, string> = {
      leader: 'leader',
      follower: 'follower',
      teacher: 'teacher',
      dj: 'DJ',
      organizer: 'organizer',
      musician: 'musician',
      performer: 'performer',
      choreographer: 'choreographer',
      venue_owner: 'venue owner',
      photographer: 'photographer',
      videographer: 'videographer',
      host: 'host',
      promoter: 'promoter',
      judge: 'judge',
      student: 'student',
      milonguero: 'milonguero',
      tanguera: 'tanguera',
      both_roles: 'both leader and follower',
      ambassador: 'ambassador'
    };
    return roleLabels[role] || role;
  }
}

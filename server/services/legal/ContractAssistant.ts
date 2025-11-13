import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';
import { db } from '@shared/db';
import { 
  legalDocuments, 
  documentInstances,
  legalClauses,
  users,
  events,
  type SelectLegalClause 
} from '@shared/schema';
import { eq, and, or, inArray } from 'drizzle-orm';

export interface ClauseRecommendation {
  clauseType: string;
  title: string;
  content: string;
  reason: string;
  priority: 'required' | 'recommended' | 'optional';
  jurisdiction?: string;
  industry?: string;
  alternatives?: string[];
}

export interface AutoFillResult {
  variables: Record<string, string>;
  filledContent: string;
  missingVariables: string[];
  suggestions: Array<{
    variable: string;
    suggestedValue: string;
    source: string;
  }>;
}

export interface NegotiationAdvice {
  negotiableTerms: Array<{
    clause: string;
    currentTerm: string;
    suggestedAlternatives: string[];
    rationale: string;
  }>;
  oneSidedClauses: Array<{
    clause: string;
    favoredParty: string;
    recommendation: string;
  }>;
  fairCompromises: string[];
}

export interface TemplateComparison {
  templateA: {
    id: number;
    title: string;
    clauses: string[];
  };
  templateB: {
    id: number;
    title: string;
    clauses: string[];
  };
  differences: Array<{
    clauseType: string;
    inA: boolean;
    inB: boolean;
    contentA?: string;
    contentB?: string;
    recommendation: string;
  }>;
  strengths: {
    templateA: string[];
    templateB: string[];
  };
  weaknesses: {
    templateA: string[];
    templateB: string[];
  };
  recommendation: string;
}

export interface SignatureWorkflowOptimization {
  recommendedFlow: 'sequential' | 'parallel' | 'hybrid';
  signers: Array<{
    order: number;
    role: string;
    email?: string;
    reasonForOrder: string;
  }>;
  estimatedCompletionTime: string;
  instructions: string[];
}

export class ContractAssistant {
  private orchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.orchestrator = new RateLimitedAIOrchestrator();
  }

  async suggestClauses(params: {
    category: string;
    jurisdiction?: string;
    industry?: string;
    context?: string;
    existingClauses?: string[];
  }): Promise<ClauseRecommendation[]> {
    const { category, jurisdiction, industry, context, existingClauses = [] } = params;

    // Fetch relevant clauses from database
    const dbClauses = await db.query.legalClauses.findMany({
      where: and(
        eq(legalClauses.category, category),
        jurisdiction ? eq(legalClauses.jurisdiction, jurisdiction) : undefined,
        industry ? eq(legalClauses.industry, industry) : undefined
      )
    });

    // Build AI prompt for context-aware suggestions
    const prompt = `Analyze this legal document scenario and suggest appropriate clauses:

Category: ${category}
Jurisdiction: ${jurisdiction || 'General'}
Industry: ${industry || 'General'}
Context: ${context || 'Standard contract'}

Existing clauses: ${existingClauses.join(', ')}

Available clauses from database:
${dbClauses.map(c => `- ${c.clauseType}: ${c.title}`).join('\n')}

Provide:
1. Required clauses (must have)
2. Recommended clauses (should have)
3. Optional clauses (nice to have)
4. Specific recommendations based on jurisdiction and industry

Return as JSON with structure:
{
  "recommendations": [
    {
      "clauseType": "string",
      "title": "string",
      "reason": "string",
      "priority": "required|recommended|optional",
      "alternativeOptions": ["string"]
    }
  ]
}`;

    const aiResponse = await this.orchestrator.smartRoute({
      prompt,
      systemPrompt: 'You are a legal contract expert specializing in clause recommendations.',
    }, {
      useCase: 'reasoning',
      priority: 'quality'
    });

    let parsedRecommendations: any;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedRecommendations = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[ContractAssistant] Failed to parse AI response:', error);
      parsedRecommendations = { recommendations: [] };
    }

    // Enrich with database clause content
    const recommendations: ClauseRecommendation[] = [];
    
    for (const rec of parsedRecommendations.recommendations || []) {
      const dbClause = dbClauses.find(c => c.clauseType === rec.clauseType);
      
      recommendations.push({
        clauseType: rec.clauseType,
        title: rec.title || dbClause?.title || rec.clauseType,
        content: dbClause?.content || '',
        reason: rec.reason,
        priority: rec.priority || 'optional',
        jurisdiction: jurisdiction || dbClause?.jurisdiction,
        industry: industry || dbClause?.industry,
        alternatives: rec.alternativeOptions
      });
    }

    return recommendations;
  }

  async autoFillVariables(params: {
    content: string;
    userId?: number;
    eventId?: number;
    providedValues?: Record<string, string>;
  }): Promise<AutoFillResult> {
    const { content, userId, eventId, providedValues = {} } = params;

    // Extract variables from content ({{variable_name}} pattern)
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const foundVariables: string[] = [];
    let match;
    while ((match = variableRegex.exec(content)) !== null) {
      foundVariables.push(match[1].trim());
    }

    const variables: Record<string, string> = { ...providedValues };
    const missingVariables: string[] = [];
    const suggestions: Array<{ variable: string; suggestedValue: string; source: string }> = [];

    // Fetch user data if userId provided
    let userData: any = null;
    if (userId) {
      userData = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
    }

    // Fetch event data if eventId provided
    let eventData: any = null;
    if (eventId) {
      eventData = await db.query.events.findFirst({
        where: eq(events.id, eventId)
      });
    }

    // Auto-fill known variables
    for (const variable of foundVariables) {
      if (variables[variable]) continue; // Already provided

      const lowerVar = variable.toLowerCase();

      // User data mapping
      if (userData) {
        if (lowerVar.includes('participant_name') || lowerVar.includes('name')) {
          variables[variable] = userData.name;
          suggestions.push({ variable, suggestedValue: userData.name, source: 'user_profile' });
          continue;
        }
        if (lowerVar.includes('email')) {
          variables[variable] = userData.email;
          suggestions.push({ variable, suggestedValue: userData.email, source: 'user_profile' });
          continue;
        }
        if (lowerVar.includes('city') || lowerVar.includes('location')) {
          variables[variable] = `${userData.city}, ${userData.country}`;
          suggestions.push({ variable, suggestedValue: `${userData.city}, ${userData.country}`, source: 'user_profile' });
          continue;
        }
      }

      // Event data mapping
      if (eventData) {
        if (lowerVar.includes('event_name')) {
          variables[variable] = eventData.title;
          suggestions.push({ variable, suggestedValue: eventData.title, source: 'event_data' });
          continue;
        }
        if (lowerVar.includes('event_date')) {
          variables[variable] = new Date(eventData.startDate).toLocaleDateString();
          suggestions.push({ variable, suggestedValue: new Date(eventData.startDate).toLocaleDateString(), source: 'event_data' });
          continue;
        }
        if (lowerVar.includes('venue')) {
          variables[variable] = eventData.venueName || eventData.location;
          suggestions.push({ variable, suggestedValue: eventData.venueName || eventData.location, source: 'event_data' });
          continue;
        }
      }

      // Date calculations
      if (lowerVar.includes('today') || lowerVar.includes('current_date')) {
        variables[variable] = new Date().toLocaleDateString();
        suggestions.push({ variable, suggestedValue: new Date().toLocaleDateString(), source: 'calculated' });
        continue;
      }

      // Mark as missing
      missingVariables.push(variable);
    }

    // Fill content with variables
    let filledContent = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      filledContent = filledContent.replace(regex, value);
    }

    return {
      variables,
      filledContent,
      missingVariables,
      suggestions
    };
  }

  async provideNegotiationAdvice(params: {
    documentContent: string;
    partyRole: 'provider' | 'recipient';
  }): Promise<NegotiationAdvice> {
    const { documentContent, partyRole } = params;

    const prompt = `Analyze this contract from the perspective of the ${partyRole} and provide negotiation advice:

Contract Content:
${documentContent}

Provide:
1. Negotiable terms (what can be reasonably negotiated)
2. One-sided clauses (terms that heavily favor one party)
3. Fair compromise suggestions
4. Red flags and high-risk terms
5. Alternative language for unfavorable clauses

Return as JSON:
{
  "negotiableTerms": [
    {
      "clause": "string",
      "currentTerm": "string",
      "suggestedAlternatives": ["string"],
      "rationale": "string"
    }
  ],
  "oneSidedClauses": [
    {
      "clause": "string",
      "favoredParty": "provider|recipient",
      "recommendation": "string"
    }
  ],
  "fairCompromises": ["string"]
}`;

    const aiResponse = await this.orchestrator.smartRoute({
      prompt,
      systemPrompt: 'You are a legal contract negotiation expert. Provide balanced, fair advice.',
    }, {
      useCase: 'reasoning',
      priority: 'quality'
    });

    let parsed: any;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[ContractAssistant] Failed to parse negotiation advice:', error);
      parsed = {
        negotiableTerms: [],
        oneSidedClauses: [],
        fairCompromises: []
      };
    }

    return {
      negotiableTerms: parsed.negotiableTerms || [],
      oneSidedClauses: parsed.oneSidedClauses || [],
      fairCompromises: parsed.fairCompromises || []
    };
  }

  async compareTemplates(params: {
    templateIdA: number;
    templateIdB: number;
  }): Promise<TemplateComparison> {
    const { templateIdA, templateIdB } = params;

    // Fetch both templates
    const [templateA, templateB] = await Promise.all([
      db.query.legalDocuments.findFirst({ where: eq(legalDocuments.id, templateIdA) }),
      db.query.legalDocuments.findFirst({ where: eq(legalDocuments.id, templateIdB) })
    ]);

    if (!templateA || !templateB) {
      throw new Error('One or both templates not found');
    }

    const prompt = `Compare these two legal contract templates and provide a detailed analysis:

Template A: ${templateA.title}
Category: ${templateA.category}
Content: ${templateA.templateContent.substring(0, 2000)}...

Template B: ${templateB.title}
Category: ${templateB.category}
Content: ${templateB.templateContent.substring(0, 2000)}...

Provide:
1. Key differences in clauses
2. Strengths of each template
3. Weaknesses of each template
4. Which template is more comprehensive
5. Which template is more balanced
6. Recommendation for which to use and when

Return as JSON:
{
  "differences": [
    {
      "clauseType": "string",
      "inA": boolean,
      "inB": boolean,
      "contentA": "string",
      "contentB": "string",
      "recommendation": "string"
    }
  ],
  "strengths": {
    "templateA": ["string"],
    "templateB": ["string"]
  },
  "weaknesses": {
    "templateA": ["string"],
    "templateB": ["string"]
  },
  "recommendation": "string"
}`;

    const aiResponse = await this.orchestrator.smartRoute({
      prompt,
      systemPrompt: 'You are a legal contract comparison expert. Provide objective, detailed analysis.',
    }, {
      useCase: 'reasoning',
      priority: 'quality'
    });

    let parsed: any;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[ContractAssistant] Failed to parse template comparison:', error);
      parsed = {
        differences: [],
        strengths: { templateA: [], templateB: [] },
        weaknesses: { templateA: [], templateB: [] },
        recommendation: 'Unable to provide comparison at this time.'
      };
    }

    return {
      templateA: {
        id: templateA.id,
        title: templateA.title,
        clauses: [] // Could be populated by extracting from content
      },
      templateB: {
        id: templateB.id,
        title: templateB.title,
        clauses: []
      },
      differences: parsed.differences || [],
      strengths: parsed.strengths || { templateA: [], templateB: [] },
      weaknesses: parsed.weaknesses || { templateA: [], templateB: [] },
      recommendation: parsed.recommendation || ''
    };
  }

  async optimizeSignatureWorkflow(params: {
    signers: Array<{ role: string; email?: string }>;
    documentType: string;
    urgency?: 'low' | 'medium' | 'high';
  }): Promise<SignatureWorkflowOptimization> {
    const { signers, documentType, urgency = 'medium' } = params;

    const prompt = `Optimize the signature workflow for this document:

Document Type: ${documentType}
Urgency: ${urgency}
Signers: ${signers.map(s => s.role).join(', ')}

Determine:
1. Best signing order (sequential, parallel, or hybrid)
2. Logical sequence if sequential
3. Which signers can sign in parallel
4. Estimated completion time
5. Clear instructions for each signer

Return as JSON:
{
  "recommendedFlow": "sequential|parallel|hybrid",
  "signers": [
    {
      "order": number,
      "role": "string",
      "reasonForOrder": "string"
    }
  ],
  "estimatedCompletionTime": "string",
  "instructions": ["string"]
}`;

    const aiResponse = await this.orchestrator.smartRoute({
      prompt,
      systemPrompt: 'You are a document signing workflow optimization expert.',
    }, {
      useCase: 'chat',
      priority: 'speed'
    });

    let parsed: any;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[ContractAssistant] Failed to parse workflow optimization:', error);
      parsed = {
        recommendedFlow: 'sequential',
        signers: signers.map((s, i) => ({
          order: i + 1,
          role: s.role,
          reasonForOrder: 'Standard signing order'
        })),
        estimatedCompletionTime: '2-3 business days',
        instructions: ['Send signing invitations', 'Follow up on pending signatures']
      };
    }

    return {
      recommendedFlow: parsed.recommendedFlow || 'sequential',
      signers: (parsed.signers || []).map((s: any, i: number) => ({
        order: s.order || i + 1,
        role: s.role,
        email: signers[i]?.email,
        reasonForOrder: s.reasonForOrder || 'Standard order'
      })),
      estimatedCompletionTime: parsed.estimatedCompletionTime || '2-3 business days',
      instructions: parsed.instructions || []
    };
  }

  async recommendExpirationDate(params: {
    documentType: string;
    startDate?: Date;
    jurisdiction?: string;
    industry?: string;
  }): Promise<{ recommendedDate: Date; reason: string; alternatives: Array<{ date: Date; reason: string }> }> {
    const { documentType, startDate = new Date(), jurisdiction, industry } = params;

    const prompt = `Recommend an appropriate expiration date for this legal document:

Document Type: ${documentType}
Start Date: ${startDate.toLocaleDateString()}
Jurisdiction: ${jurisdiction || 'General'}
Industry: ${industry || 'General'}

Consider:
1. Legal requirements
2. Industry standards
3. Common practice
4. Risk factors

Provide recommended expiration date and 2-3 alternatives with rationale.

Return as JSON:
{
  "recommendedMonths": number,
  "reason": "string",
  "alternatives": [
    {
      "months": number,
      "reason": "string"
    }
  ]
}`;

    const aiResponse = await this.orchestrator.smartRoute({
      prompt,
      systemPrompt: 'You are a legal contract expiration expert.',
    }, {
      useCase: 'chat',
      priority: 'speed'
    });

    let parsed: any;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('[ContractAssistant] Failed to parse expiration recommendation:', error);
      parsed = {
        recommendedMonths: 12,
        reason: 'Standard 1-year term',
        alternatives: [
          { months: 6, reason: 'Short-term option' },
          { months: 24, reason: 'Long-term option' }
        ]
      };
    }

    const recommendedDate = new Date(startDate);
    recommendedDate.setMonth(recommendedDate.getMonth() + (parsed.recommendedMonths || 12));

    const alternatives = (parsed.alternatives || []).map((alt: any) => {
      const altDate = new Date(startDate);
      altDate.setMonth(altDate.getMonth() + alt.months);
      return {
        date: altDate,
        reason: alt.reason
      };
    });

    return {
      recommendedDate,
      reason: parsed.reason || 'Standard term',
      alternatives
    };
  }
}

export const contractAssistant = new ContractAssistant();

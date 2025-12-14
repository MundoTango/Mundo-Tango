/**
 * Mr. Blue AI Response Analyzer
 * MB.MD Pattern: Iterative Playwright Debugging Methodology
 * 
 * Utilities for analyzing AI responses to determine if they are:
 * - Personalized (using resume/context data)
 * - Generic/fallback (boilerplate responses)
 */

export interface AnalysisResult {
  isPersonalized: boolean;
  confidenceScore: number;
  keywords: string[];
  failureReason?: string;
  debugRecommendations: string[];
}

export interface NetworkTraceEntry {
  url: string;
  method: string;
  payload?: {
    message?: string;
    systemPrompt?: string;
    context?: any;
  };
  response?: {
    status: number;
    body: any;
  };
  timestamp: string;
}

const RESUME_KEYWORDS = [
  'react', 'typescript', 'node', 'frontend', 'backend',
  'javascript', 'python', 'experience', 'project', 'developer',
  'engineer', 'skill', 'portfolio', 'github', 'contribution',
  'api', 'database', 'cloud', 'aws', 'docker'
];

const GENERIC_FALLBACK_PATTERNS = [
  /hi there.*background/i,
  /what.*technical skill.*most confident/i,
  /noticed.*interesting experience/i,
  /what technologies.*enjoy/i,
  /could not generate/i,
  /encountered an issue/i,
  /please try again/i,
  /tell me more about/i,
  /what would you say/i
];

const PERSONALIZED_INDICATORS = [
  /i see.*mentioned/i,
  /your experience with/i,
  /you listed/i,
  /according to your resume/i,
  /your background in/i,
  /i noticed you/i,
  /your work at/i,
  /the project you/i
];

export function analyzeAIResponse(
  response: string, 
  resumeContent?: string
): AnalysisResult {
  const lowerResponse = response.toLowerCase();
  
  const matchedKeywords = RESUME_KEYWORDS.filter(kw => lowerResponse.includes(kw));
  
  let isGenericFallback = false;
  let matchedGenericPattern: string | null = null;
  
  for (const pattern of GENERIC_FALLBACK_PATTERNS) {
    if (pattern.test(response)) {
      isGenericFallback = true;
      matchedGenericPattern = pattern.toString();
      break;
    }
  }
  
  let hasPersonalizedIndicators = false;
  for (const pattern of PERSONALIZED_INDICATORS) {
    if (pattern.test(response)) {
      hasPersonalizedIndicators = true;
      break;
    }
  }
  
  const hasResumeSpecificContent = resumeContent 
    ? resumeContent.toLowerCase().split(/\s+/)
        .filter(word => word.length > 5)
        .some(word => lowerResponse.includes(word))
    : false;
  
  let confidenceScore = 0;
  
  if (matchedKeywords.length >= 4) confidenceScore += 25;
  else if (matchedKeywords.length >= 2) confidenceScore += 15;
  
  if (hasPersonalizedIndicators) confidenceScore += 35;
  if (hasResumeSpecificContent) confidenceScore += 30;
  if (!isGenericFallback) confidenceScore += 10;
  
  const isPersonalized = !isGenericFallback && 
    (hasPersonalizedIndicators || hasResumeSpecificContent || matchedKeywords.length >= 3);
  
  const debugRecommendations: string[] = [];
  
  if (isGenericFallback) {
    debugRecommendations.push('Response matches a generic fallback pattern');
    debugRecommendations.push('Check if GROQ_API_KEY is set and valid');
    debugRecommendations.push('Verify systemPrompt is being passed in API request');
  }
  
  if (!hasPersonalizedIndicators && !isGenericFallback) {
    debugRecommendations.push('Response lacks personalization indicators');
    debugRecommendations.push('Check if resume content is being included in systemPrompt');
  }
  
  if (matchedKeywords.length < 2) {
    debugRecommendations.push('Very few technical keywords detected');
    debugRecommendations.push('Resume may not have been parsed correctly');
  }
  
  return {
    isPersonalized,
    confidenceScore,
    keywords: matchedKeywords,
    failureReason: isGenericFallback 
      ? `Matched generic pattern: ${matchedGenericPattern}`
      : !isPersonalized 
        ? 'Low confidence - no personalization indicators found'
        : undefined,
    debugRecommendations
  };
}

export function analyzeNetworkTrace(traces: NetworkTraceEntry[]): {
  systemPromptSent: boolean;
  apiCallsMade: number;
  errors: string[];
  recommendations: string[];
} {
  const mrBlueCalls = traces.filter(t => t.url.includes('/api/mrblue/chat'));
  const apiCallsMade = mrBlueCalls.length;
  const systemPromptSent = mrBlueCalls.some(t => 
    t.payload?.systemPrompt && t.payload.systemPrompt.length > 100
  );
  
  const errors: string[] = [];
  const recommendations: string[] = [];
  
  if (apiCallsMade === 0) {
    errors.push('No API calls to /api/mrblue/chat detected');
    recommendations.push('Check if user is authenticated');
    recommendations.push('Verify interview page loaded correctly');
    recommendations.push('Check browser console for JavaScript errors');
  }
  
  if (apiCallsMade > 0 && !systemPromptSent) {
    errors.push('API calls made but systemPrompt is missing or too short');
    recommendations.push('Check generateResumeQuestion in TalentMatchInterviewPage.tsx');
    recommendations.push('Verify resume data is being passed to systemPrompt');
  }
  
  const failedCalls = mrBlueCalls.filter(t => t.response && t.response.status >= 400);
  if (failedCalls.length > 0) {
    errors.push(`${failedCalls.length} API calls returned errors`);
    recommendations.push('Check server logs for error details');
    recommendations.push('Verify GROQ_API_KEY is configured');
  }
  
  return {
    systemPromptSent,
    apiCallsMade,
    errors,
    recommendations
  };
}

export function generateDebugReport(
  responseAnalysis: AnalysisResult,
  networkAnalysis: ReturnType<typeof analyzeNetworkTrace>
): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(60));
  lines.push('MR. BLUE AI DEBUGGING REPORT');
  lines.push('='.repeat(60));
  lines.push('');
  
  lines.push('## Response Analysis');
  lines.push(`Personalized: ${responseAnalysis.isPersonalized ? '✅ YES' : '❌ NO'}`);
  lines.push(`Confidence: ${responseAnalysis.confidenceScore}%`);
  lines.push(`Keywords: ${responseAnalysis.keywords.join(', ') || 'none'}`);
  if (responseAnalysis.failureReason) {
    lines.push(`Failure: ${responseAnalysis.failureReason}`);
  }
  lines.push('');
  
  lines.push('## Network Analysis');
  lines.push(`API Calls Made: ${networkAnalysis.apiCallsMade}`);
  lines.push(`systemPrompt Sent: ${networkAnalysis.systemPromptSent ? '✅ YES' : '❌ NO'}`);
  
  if (networkAnalysis.errors.length > 0) {
    lines.push('');
    lines.push('### Errors:');
    networkAnalysis.errors.forEach(e => lines.push(`  - ${e}`));
  }
  
  const allRecommendations = [
    ...responseAnalysis.debugRecommendations,
    ...networkAnalysis.recommendations
  ];
  
  if (allRecommendations.length > 0) {
    lines.push('');
    lines.push('## Recommendations:');
    [...new Set(allRecommendations)].forEach((r, i) => {
      lines.push(`${i + 1}. ${r}`);
    });
  }
  
  lines.push('');
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}

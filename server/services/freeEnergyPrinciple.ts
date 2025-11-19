/**
 * FREE ENERGY PRINCIPLE (FEP) ENGINE
 * 
 * Implements Karl Friston's Free Energy Principle for AI response selection.
 * Minimizes prediction error (surprise) + epistemic uncertainty (information gain).
 * 
 * MB.MD Protocol v9.2: Simultaneously, Recursively, Critically
 * Quality Target: 95-99/100
 */

import { z } from "zod";

export const ResponseCandidateSchema = z.object({
  response: z.string(),
  action: z.string().optional(),
  confidence: z.number().min(0).max(1),
  estimatedUtility: z.number(),
  epistemicValue: z.number(),
});

export type ResponseCandidate = z.infer<typeof ResponseCandidateSchema>;

export const BeliefStateSchema = z.object({
  userIntent: z.string(),
  currentContext: z.record(z.any()),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    timestamp: z.date(),
  })),
  uncertaintyLevel: z.number().min(0).max(1),
});

export type BeliefState = z.infer<typeof BeliefStateSchema>;

/**
 * Expected Free Energy (EFE) Calculation
 * 
 * EFE = Pragmatic Value (reward) - Epistemic Value (information gain)
 * 
 * Lower EFE = Better action (balance between utility and exploration)
 */
export class FreeEnergyPrinciple {
  /**
   * Calculate Expected Free Energy for a response candidate
   * 
   * @param candidate - Response to evaluate
   * @param beliefState - Current understanding of user/context
   * @returns Expected Free Energy (lower is better)
   */
  calculateExpectedFreeEnergy(
    candidate: ResponseCandidate,
    beliefState: BeliefState
  ): number {
    // Pragmatic value: How useful is this response?
    const pragmaticValue = this.calculatePragmaticValue(candidate, beliefState);
    
    // Epistemic value: How much uncertainty does this reduce?
    const epistemicValue = this.calculateEpistemicValue(candidate, beliefState);
    
    // Expected Free Energy = -Pragmatic + Epistemic
    // (We want high utility and low uncertainty)
    const efe = -pragmaticValue + (beliefState.uncertaintyLevel * epistemicValue);
    
    return efe;
  }

  /**
   * Pragmatic Value: Reward-based utility
   * 
   * Factors:
   * - Task completion likelihood
   * - User satisfaction prediction
   * - Code quality (if applicable)
   */
  private calculatePragmaticValue(
    candidate: ResponseCandidate,
    beliefState: BeliefState
  ): number {
    let value = 0;
    
    // Base utility from candidate's estimated utility
    value += candidate.estimatedUtility * 0.4;
    
    // Confidence weighting (higher confidence = higher pragmatic value)
    value += candidate.confidence * 0.3;
    
    // Context alignment (does response match user intent?)
    const intentAlignment = this.calculateIntentAlignment(
      candidate.response,
      beliefState.userIntent
    );
    value += intentAlignment * 0.3;
    
    return Math.min(value, 1.0);
  }

  /**
   * Epistemic Value: Information gain / uncertainty reduction
   * 
   * Factors:
   * - Clarification questions
   * - Exploration actions
   * - Testing/validation steps
   */
  private calculateEpistemicValue(
    candidate: ResponseCandidate,
    beliefState: BeliefState
  ): number {
    let value = 0;
    
    // Base epistemic value from candidate
    value += candidate.epistemicValue * 0.5;
    
    // Clarification questions reduce uncertainty
    const hasClarificationQuestion = /\?/.test(candidate.response);
    if (hasClarificationQuestion) {
      value += 0.2;
    }
    
    // Testing/validation actions provide information
    const hasValidationAction = candidate.action?.includes("test") || 
                                 candidate.action?.includes("verify");
    if (hasValidationAction) {
      value += 0.3;
    }
    
    return Math.min(value, 1.0);
  }

  /**
   * Calculate alignment between response and user intent
   * 
   * Uses simple keyword matching (can be enhanced with embeddings)
   */
  private calculateIntentAlignment(
    response: string,
    intent: string
  ): number {
    const intentKeywords = intent.toLowerCase().split(/\s+/);
    const responseKeywords = response.toLowerCase().split(/\s+/);
    
    const matches = intentKeywords.filter(keyword => 
      responseKeywords.some(rk => rk.includes(keyword))
    ).length;
    
    return intentKeywords.length > 0 
      ? matches / intentKeywords.length 
      : 0.5;
  }

  /**
   * Select best response from candidates using FEP
   * 
   * @param candidates - Array of possible responses
   * @param beliefState - Current belief state
   * @returns Best response (lowest EFE)
   */
  selectBestResponse(
    candidates: ResponseCandidate[],
    beliefState: BeliefState
  ): ResponseCandidate {
    if (candidates.length === 0) {
      throw new Error("No response candidates provided");
    }

    let bestCandidate = candidates[0];
    let lowestEFE = this.calculateExpectedFreeEnergy(candidates[0], beliefState);

    for (let i = 1; i < candidates.length; i++) {
      const efe = this.calculateExpectedFreeEnergy(candidates[i], beliefState);
      
      if (efe < lowestEFE) {
        lowestEFE = efe;
        bestCandidate = candidates[i];
      }
    }

    console.log(`[FEP] Selected response with EFE: ${lowestEFE.toFixed(3)}`);
    return bestCandidate;
  }

  /**
   * Calculate prediction error (surprise)
   * 
   * Used for active inference loop
   * 
   * @param expected - Predicted outcome
   * @param actual - Observed outcome
   * @returns Prediction error (0-1, lower is better)
   */
  calculatePredictionError(
    expected: Record<string, any>,
    actual: Record<string, any>
  ): number {
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    let totalError = 0;
    let count = 0;

    for (const key of keys) {
      const exp = expected[key];
      const act = actual[key];
      
      if (typeof exp === 'number' && typeof act === 'number') {
        totalError += Math.abs(exp - act) / Math.max(Math.abs(exp), Math.abs(act), 1);
        count++;
      } else if (exp !== act) {
        totalError += 1;
        count++;
      }
    }

    return count > 0 ? totalError / count : 0;
  }
}

/**
 * Example Usage:
 * 
 * const fep = new FreeEnergyPrinciple();
 * 
 * const candidates: ResponseCandidate[] = [
 *   {
 *     response: "I'll fix the email validation with AbortController.",
 *     action: "modify_code",
 *     confidence: 0.9,
 *     estimatedUtility: 0.8,
 *     epistemicValue: 0.3,
 *   },
 *   {
 *     response: "Should I add retry logic to the email validation?",
 *     action: "ask_clarification",
 *     confidence: 0.7,
 *     estimatedUtility: 0.5,
 *     epistemicValue: 0.7,
 *   }
 * ];
 * 
 * const beliefState: BeliefState = {
 *   userIntent: "fix email validation race condition",
 *   currentContext: { page: "/register", mode: "vibecoding" },
 *   conversationHistory: [],
 *   uncertaintyLevel: 0.4,
 * };
 * 
 * const best = fep.selectBestResponse(candidates, beliefState);
 * console.log(best.response);
 */

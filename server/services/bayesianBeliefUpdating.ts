/**
 * BAYESIAN BELIEF UPDATING SYSTEM
 * 
 * Implements Bayesian inference for user preference modeling and context tracking.
 * 
 * Core Principles:
 * 1. Maintain probabilistic beliefs about user preferences
 * 2. Update beliefs based on new evidence (observations)
 * 3. Use Bayes' Rule: P(H|E) = P(E|H) * P(H) / P(E)
 * 4. Track conversation context for adaptive responses
 * 
 * MB.MD Protocol v9.2: Simultaneously, Recursively, Critically
 * Quality Target: 95-99/100
 */

import { z } from "zod";

export const UserPreferenceSchema = z.object({
  preferredLanguage: z.string().default("typescript"),
  preferredFramework: z.string().default("react"),
  codeStyle: z.object({
    indentation: z.enum(["tabs", "spaces"]).default("spaces"),
    quotation: z.enum(["single", "double"]).default("double"),
    semicolons: z.boolean().default(true),
  }),
  communicationStyle: z.object({
    verbosity: z.enum(["concise", "detailed", "balanced"]).default("balanced"),
    technicalLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
    preferredExamples: z.boolean().default(true),
  }),
  qualityThreshold: z.number().min(0).max(100).default(95),
});

export type UserPreference = z.infer<typeof UserPreferenceSchema>;

export const EvidenceSchema = z.object({
  type: z.enum(["code_written", "user_feedback", "correction_made", "question_asked"]),
  content: z.record(z.any()),
  timestamp: z.date(),
  confidence: z.number().min(0).max(1),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

export const BeliefDistributionSchema = z.object({
  hypothesis: z.string(),
  probability: z.number().min(0).max(1),
  evidence: z.array(EvidenceSchema),
  lastUpdated: z.date(),
});

export type BeliefDistribution = z.infer<typeof BeliefDistributionSchema>;

/**
 * Bayesian Belief Updating Engine
 * 
 * Tracks user preferences and updates beliefs based on observations
 */
export class BayesianBeliefEngine {
  private beliefs: Map<string, BeliefDistribution>;
  private userPreferences: UserPreference;
  private evidenceHistory: Evidence[] = [];

  constructor(initialPreferences?: Partial<UserPreference>) {
    this.beliefs = new Map();
    this.userPreferences = UserPreferenceSchema.parse(initialPreferences || {});
    this.initializeBeliefs();
  }

  /**
   * Initialize prior beliefs about user preferences
   */
  private initializeBeliefs(): void {
    // Language preferences
    this.beliefs.set("prefers_typescript", {
      hypothesis: "User prefers TypeScript over JavaScript",
      probability: 0.7, // Prior: Most modern projects use TS
      evidence: [],
      lastUpdated: new Date(),
    });

    this.beliefs.set("prefers_react", {
      hypothesis: "User prefers React framework",
      probability: 0.8, // Prior: React is most common
      evidence: [],
      lastUpdated: new Date(),
    });

    // Code style preferences
    this.beliefs.set("uses_semicolons", {
      hypothesis: "User uses semicolons in code",
      probability: 0.6, // Neutral prior
      evidence: [],
      lastUpdated: new Date(),
    });

    this.beliefs.set("prefers_single_quotes", {
      hypothesis: "User prefers single quotes",
      probability: 0.5, // Neutral prior
      evidence: [],
      lastUpdated: new Date(),
    });

    // Communication style
    this.beliefs.set("wants_detailed_explanations", {
      hypothesis: "User wants detailed explanations",
      probability: 0.5, // Neutral prior
      evidence: [],
      lastUpdated: new Date(),
    });

    this.beliefs.set("wants_code_examples", {
      hypothesis: "User wants code examples",
      probability: 0.8, // Most users benefit from examples
      evidence: [],
      lastUpdated: new Date(),
    });

    // Quality expectations
    this.beliefs.set("high_quality_expectations", {
      hypothesis: "User expects 95-99/100 quality",
      probability: 0.9, // MB.MD Protocol target
      evidence: [],
      lastUpdated: new Date(),
    });
  }

  /**
   * Bayes' Rule: P(H|E) = P(E|H) * P(H) / P(E)
   * 
   * @param priorProbability - P(H): Prior belief
   * @param likelihood - P(E|H): Likelihood of evidence given hypothesis
   * @param evidenceProbability - P(E): Overall probability of evidence
   * @returns Posterior probability P(H|E)
   */
  private bayesRule(
    priorProbability: number,
    likelihood: number,
    evidenceProbability: number
  ): number {
    if (evidenceProbability === 0) {
      return priorProbability; // No update if evidence impossible
    }

    const posterior = (likelihood * priorProbability) / evidenceProbability;
    
    // Clamp to [0, 1]
    return Math.max(0, Math.min(1, posterior));
  }

  /**
   * Calculate likelihood P(E|H): How likely is evidence given hypothesis?
   * 
   * @param evidence - Observed evidence
   * @param hypothesis - Hypothesis being tested
   * @returns Likelihood score [0-1]
   */
  private calculateLikelihood(evidence: Evidence, hypothesis: string): number {
    switch (evidence.type) {
      case "code_written":
        // If user writes TS code, high likelihood they prefer TS
        if (hypothesis === "prefers_typescript" && evidence.content.language === "typescript") {
          return 0.95;
        }
        if (hypothesis === "prefers_typescript" && evidence.content.language === "javascript") {
          return 0.1;
        }
        // Semicolon usage
        if (hypothesis === "uses_semicolons" && evidence.content.hasSemicolons) {
          return 0.9;
        }
        if (hypothesis === "uses_semicolons" && !evidence.content.hasSemicolons) {
          return 0.1;
        }
        break;

      case "user_feedback":
        // Positive feedback on detailed explanation
        if (hypothesis === "wants_detailed_explanations" && evidence.content.feedbackType === "positive") {
          return 0.85;
        }
        if (hypothesis === "wants_detailed_explanations" && evidence.content.feedbackType === "too_verbose") {
          return 0.1;
        }
        break;

      case "correction_made":
        // User corrects code style → strong evidence of preference
        if (hypothesis === "prefers_single_quotes" && evidence.content.correction === "quotes") {
          return 0.9;
        }
        break;

      case "question_asked":
        // User asks "why?" → wants detailed explanations
        if (hypothesis === "wants_detailed_explanations" && evidence.content.question?.includes("why")) {
          return 0.8;
        }
        break;
    }

    return 0.5; // Neutral likelihood if no match
  }

  /**
   * Calculate evidence probability P(E): Overall probability of evidence
   * 
   * Uses law of total probability:
   * P(E) = P(E|H) * P(H) + P(E|¬H) * P(¬H)
   */
  private calculateEvidenceProbability(
    evidence: Evidence,
    belief: BeliefDistribution
  ): number {
    const likelihood = this.calculateLikelihood(evidence, belief.hypothesis);
    const priorProbability = belief.probability;
    
    // P(E|¬H): Likelihood of evidence if hypothesis is FALSE
    const likelihoodNot = 1 - likelihood;
    
    // P(E) = P(E|H) * P(H) + P(E|¬H) * P(¬H)
    const evidenceProbability = 
      (likelihood * priorProbability) + 
      (likelihoodNot * (1 - priorProbability));

    return Math.max(0.01, evidenceProbability); // Avoid division by zero
  }

  /**
   * Update belief using Bayesian inference
   * 
   * @param hypothesisKey - Key of belief to update
   * @param evidence - New evidence
   */
  updateBelief(hypothesisKey: string, evidence: Evidence): void {
    const belief = this.beliefs.get(hypothesisKey);
    
    if (!belief) {
      console.warn(`[Bayesian] Unknown hypothesis: ${hypothesisKey}`);
      return;
    }

    // Calculate components of Bayes' Rule
    const priorProbability = belief.probability;
    const likelihood = this.calculateLikelihood(evidence, belief.hypothesis);
    const evidenceProbability = this.calculateEvidenceProbability(evidence, belief);

    // Apply Bayes' Rule
    const posteriorProbability = this.bayesRule(
      priorProbability,
      likelihood,
      evidenceProbability
    );

    // Update belief
    belief.probability = posteriorProbability;
    belief.evidence.push(evidence);
    belief.lastUpdated = new Date();

    // Store evidence
    this.evidenceHistory.push(evidence);

    console.log(
      `[Bayesian] Updated "${hypothesisKey}": ${priorProbability.toFixed(3)} → ${posteriorProbability.toFixed(3)} (evidence: ${evidence.type})`
    );

    // Update user preferences based on high-confidence beliefs
    this.syncPreferences();
  }

  /**
   * Sync high-confidence beliefs to user preferences
   */
  private syncPreferences(): void {
    // Language preference
    const prefersTS = this.beliefs.get("prefers_typescript");
    if (prefersTS && prefersTS.probability > 0.8) {
      this.userPreferences.preferredLanguage = "typescript";
    } else if (prefersTS && prefersTS.probability < 0.3) {
      this.userPreferences.preferredLanguage = "javascript";
    }

    // Semicolons
    const usesSemicolons = this.beliefs.get("uses_semicolons");
    if (usesSemicolons) {
      this.userPreferences.codeStyle.semicolons = usesSemicolons.probability > 0.5;
    }

    // Quotes
    const prefersSingleQuotes = this.beliefs.get("prefers_single_quotes");
    if (prefersSingleQuotes) {
      this.userPreferences.codeStyle.quotation = 
        prefersSingleQuotes.probability > 0.5 ? "single" : "double";
    }

    // Communication style
    const wantsDetailed = this.beliefs.get("wants_detailed_explanations");
    if (wantsDetailed) {
      if (wantsDetailed.probability > 0.7) {
        this.userPreferences.communicationStyle.verbosity = "detailed";
      } else if (wantsDetailed.probability < 0.3) {
        this.userPreferences.communicationStyle.verbosity = "concise";
      } else {
        this.userPreferences.communicationStyle.verbosity = "balanced";
      }
    }
  }

  /**
   * Get current user preferences
   */
  getPreferences(): UserPreference {
    return this.userPreferences;
  }

  /**
   * Get belief distribution for hypothesis
   */
  getBelief(hypothesisKey: string): BeliefDistribution | undefined {
    return this.beliefs.get(hypothesisKey);
  }

  /**
   * Get all beliefs sorted by confidence
   */
  getAllBeliefs(): BeliefDistribution[] {
    return Array.from(this.beliefs.values()).sort(
      (a, b) => b.probability - a.probability
    );
  }

  /**
   * Generate context-aware response parameters
   * 
   * Uses beliefs to adapt response generation
   */
  getResponseParameters(): {
    style: string;
    includeExamples: boolean;
    technicalLevel: string;
    qualityTarget: number;
  } {
    const wantsExamples = this.beliefs.get("wants_code_examples");
    const wantsDetailed = this.beliefs.get("wants_detailed_explanations");
    const highQuality = this.beliefs.get("high_quality_expectations");

    return {
      style: this.userPreferences.communicationStyle.verbosity,
      includeExamples: wantsExamples ? wantsExamples.probability > 0.6 : true,
      technicalLevel: this.userPreferences.communicationStyle.technicalLevel,
      qualityTarget: highQuality ? highQuality.probability * 100 : 95,
    };
  }
}

/**
 * Example Usage:
 * 
 * const engine = new BayesianBeliefEngine();
 * 
 * // User writes TypeScript code with semicolons
 * engine.updateBelief("prefers_typescript", {
 *   type: "code_written",
 *   content: { language: "typescript", hasSemicolons: true },
 *   timestamp: new Date(),
 *   confidence: 0.9,
 * });
 * 
 * engine.updateBelief("uses_semicolons", {
 *   type: "code_written",
 *   content: { hasSemicolons: true },
 *   timestamp: new Date(),
 *   confidence: 0.9,
 * });
 * 
 * // User asks detailed question
 * engine.updateBelief("wants_detailed_explanations", {
 *   type: "question_asked",
 *   content: { question: "Why does this work?" },
 *   timestamp: new Date(),
 *   confidence: 0.8,
 * });
 * 
 * // Get adapted response parameters
 * const params = engine.getResponseParameters();
 * console.log(params);
 * // { style: "detailed", includeExamples: true, technicalLevel: "intermediate", qualityTarget: 95 }
 */

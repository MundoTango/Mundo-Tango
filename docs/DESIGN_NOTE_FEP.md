# Design Note: Free Energy Principle Implementation

> Expert Lens: Aleksandra Płochocka, PhD (Applied Math & AI Rigor)
> Last Updated: December 7, 2025
> Status: Theory-to-Implementation Mapping

## Purpose

This document maps theoretical Free Energy Principle (FEP) and Active Inference concepts to their **concrete implementations** in Mundo Tango's codebase. Per Aleksandra's remediation guidance, we separate aspirational language from what is actually coded.

---

## FEP Concepts → Implementation Mapping

### 1. Surprisal / Surprise Score

**Theory**: In FEP, "surprise" is the negative log probability of an observation given the agent's generative model. High surprise indicates the world differs from expectations.

**Implementation**: `server/services/PageAuditService.ts`

```typescript
// Actual code pattern:
calculateSurpriseScore(page: PageAudit): number {
  const errorWeight = 0.4;
  const warningWeight = 0.2;
  const missingWeight = 0.3;
  const performanceWeight = 0.1;
  
  return (
    page.errors.length * errorWeight +
    page.warnings.length * warningWeight +
    page.missingElements.length * missingWeight +
    (page.loadTime > 3000 ? 1 : 0) * performanceWeight
  );
}
```

**Metric**: `page_audit_surprise_score` (Prometheus gauge)
**Dashboard**: Grafana → Agent Activity → Surprise Heatmap

---

### 2. Prediction Error

**Theory**: The difference between predicted and actual observations. Minimizing prediction error is the core FEP objective.

**Implementation**: `server/services/PredictivePreCheckService.ts`

```typescript
// Actual code pattern:
async assessRisk(change: CodeChange): Promise<RiskAssessment> {
  const prediction = await this.predictImpact(change);
  const historical = await this.getHistoricalImpact(change.type);
  
  return {
    predictionError: Math.abs(prediction.severity - historical.avgSeverity),
    confidence: historical.sampleSize / 100,
    recommendedAction: this.selectAction(prediction.severity)
  };
}
```

**Metric**: `prediction_error_magnitude` (histogram)
**Experiment**: Compare predicted vs actual rollback rates

---

### 3. Expected Free Energy (EFE)

**Theory**: The quantity agents minimize when selecting actions, balancing exploitation (goal-seeking) and exploration (information-seeking).

**Implementation**: `server/services/SelfHealingService.ts`

```typescript
// Actual code pattern:
selectRemediationAction(issue: Issue): Action {
  const actions = this.getAvailableActions(issue);
  
  return actions.reduce((best, action) => {
    const exploitValue = this.estimateSuccessProb(action);
    const exploreValue = this.estimateInfoGain(action);
    const efe = -exploitValue - 0.3 * exploreValue; // Lower is better
    
    return efe < best.efe ? { action, efe } : best;
  }, { action: null, efe: Infinity }).action;
}
```

**Metric**: `efe_action_selection` (counter by action type)
**A/B Test**: Compare EFE-based selection vs random selection

---

### 4. Generative Model / World Model

**Theory**: The internal model the agent uses to predict observations and select actions.

**Implementation**: `server/services/mrblue-context-service.ts` + LanceDB

```typescript
// Actual code pattern:
// World model = vector embeddings of codebase + user preferences
const worldModel = {
  codebaseEmbeddings: await lancedb.table('code_summaries'),
  userPreferences: await lancedb.table('user_prefs'),
  taskPatterns: await lancedb.table('workflow_patterns')
};
```

**Metric**: `world_model_freshness_seconds` (time since last update)
**Validation**: Model accuracy on held-out code navigation tasks

---

### 5. Active Inference Loop

**Theory**: Perceive → Predict → Act → Update cycle that minimizes free energy.

**Implementation**: `server/services/autonomous-engine.ts`

```typescript
// Actual code pattern:
async runInferenceLoop() {
  while (this.isRunning) {
    // PERCEIVE: Gather current state
    const state = await this.perceiveState();
    
    // PREDICT: What should happen?
    const prediction = await this.worldModel.predict(state);
    
    // ACT: Select action to minimize surprise
    const action = this.selectAction(state, prediction);
    await this.executeAction(action);
    
    // UPDATE: Learn from outcome
    await this.updateWorldModel(state, action, outcome);
  }
}
```

**Metric**: `inference_loop_iterations_total`, `inference_loop_duration_seconds`

---

## Testable Hypotheses

Per Aleksandra's guidance, each FEP concept has at least one testable hypothesis:

| Concept | Hypothesis | Success Metric | Status |
|---------|-----------|----------------|--------|
| Surprise Score | Higher surprise → longer resolution time | r² > 0.5 | TODO |
| Prediction Error | Pre-check reduces rollback rate by 50% | A/B test | TODO |
| EFE | EFE-based actions outperform random by 2x | Success rate | TODO |
| World Model | Fresher model → better action selection | Correlation | TODO |
| Active Inference | Loop reduces total surprise per session | Trend | TODO |

---

## What is NOT Implemented (Aspirational)

The following FEP concepts are mentioned in mb.md but **not yet in code**:

1. **Bayesian Model Comparison** - No formal model selection
2. **Hierarchical Predictive Processing** - Flat agent hierarchy, not truly predictive
3. **Precision Weighting** - No dynamic attention modulation
4. **Markov Blanket Decomposition** - Agents don't have formal boundaries

These are candidates for future research, not production features.

---

## Experiments Log

| Date | Experiment | Result | Action Taken |
|------|------------|--------|--------------|
| TBD | Surprise vs resolution time | TBD | TBD |

---

## References

1. Friston, K. (2010). The free-energy principle: a unified brain theory?
2. Parr, T. & Friston, K. (2019). Generalised free energy and active inference
3. mb.md Pattern 27: Free Energy Principle application

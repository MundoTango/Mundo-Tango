# Bayesian Belief Framework

**Invocation:** `use mb.md: cognition:bayesian`

---

## 🧠 BAYESIAN REASONING

Bayesian reasoning updates beliefs based on evidence using Bayes' theorem:

```
P(H|E) = P(E|H) × P(H) / P(E)

Where:
- P(H|E) = Posterior (belief after evidence)
- P(E|H) = Likelihood (how likely evidence given hypothesis)
- P(H)   = Prior (belief before evidence)
- P(E)   = Evidence (normalizing constant)
```

---

## 🔧 IMPLEMENTATION

### Simple Belief Update

```typescript
interface Belief {
  hypothesis: string;
  probability: number;  // 0-1
  confidence: number;   // How certain we are about the probability
}

function updateBelief(
  prior: Belief,
  evidence: Evidence,
  likelihood: number
): Belief {
  // Simplified Bayesian update
  const posteriorProb = (likelihood * prior.probability) /
    (likelihood * prior.probability + (1 - likelihood) * (1 - prior.probability));
  
  return {
    hypothesis: prior.hypothesis,
    probability: posteriorProb,
    confidence: Math.min(prior.confidence + 0.1, 1.0)
  };
}
```

### Multi-Hypothesis Reasoning

```typescript
interface BeliefDistribution {
  hypotheses: Map<string, number>;  // hypothesis → probability
}

class BayesianReasoner {
  private beliefs: BeliefDistribution;
  
  updateOnEvidence(evidence: Evidence): void {
    const newBeliefs = new Map<string, number>();
    let totalProb = 0;
    
    // Update each hypothesis
    for (const [hyp, prior] of this.beliefs.hypotheses) {
      const likelihood = this.computeLikelihood(evidence, hyp);
      const unnormalized = likelihood * prior;
      newBeliefs.set(hyp, unnormalized);
      totalProb += unnormalized;
    }
    
    // Normalize to sum to 1
    for (const [hyp, prob] of newBeliefs) {
      newBeliefs.set(hyp, prob / totalProb);
    }
    
    this.beliefs.hypotheses = newBeliefs;
  }
  
  getMostLikely(): string {
    let best = { hyp: '', prob: 0 };
    for (const [hyp, prob] of this.beliefs.hypotheses) {
      if (prob > best.prob) best = { hyp, prob };
    }
    return best.hyp;
  }
}
```

---

## 📊 USE CASES

### 1. Error Root Cause Analysis

```typescript
// Hypotheses about why /api/events returns 500
const hypotheses = {
  'database_connection': 0.3,
  'null_pointer': 0.25,
  'auth_failure': 0.2,
  'timeout': 0.15,
  'other': 0.1
};

// Evidence: Error occurs only on specific user
updateOnEvidence({ type: 'user_specific' });
// → Increases 'auth_failure' probability

// Evidence: Error happens after 5 seconds
updateOnEvidence({ type: 'delay_pattern' });
// → Increases 'timeout' probability

// Final belief: Most likely = 'timeout'
```

### 2. User Intent Classification

```typescript
// What does user want to do?
const intentPriors = {
  'create_event': 0.2,
  'find_events': 0.3,
  'edit_profile': 0.15,
  'send_message': 0.2,
  'browse_housing': 0.15
};

// Evidence: User clicked "Events" tab
updateOnEvidence({ action: 'click_events_tab' });
// → find_events: 0.6, create_event: 0.3, ...

// Evidence: User clicked "Create New"
updateOnEvidence({ action: 'click_create' });
// → create_event: 0.85, find_events: 0.1, ...
```

### 3. Page Health Prediction

```typescript
interface PageHealthBelief {
  healthy: number;      // P(healthy)
  degraded: number;     // P(degraded)
  broken: number;       // P(broken)
}

// Prior: Most pages are healthy
const prior: PageHealthBelief = {
  healthy: 0.85,
  degraded: 0.10,
  broken: 0.05
};

// Evidence: Response time > 2s
// Likelihood: P(slow | degraded) = 0.8
updateOnEvidence({ type: 'slow_response' });
// → degraded: 0.4, healthy: 0.55, broken: 0.05

// Evidence: JavaScript error in console
updateOnEvidence({ type: 'js_error' });
// → degraded: 0.6, broken: 0.25, healthy: 0.15
```

---

## 🎯 INTEGRATION WITH MB.MD

```typescript
// Decision making with uncertainty
async function decideAction(situation: Situation): Promise<Action> {
  const reasoner = new BayesianReasoner();
  
  // Gather evidence
  const evidence = await gatherEvidence(situation);
  
  // Update beliefs
  for (const e of evidence) {
    reasoner.updateOnEvidence(e);
  }
  
  // Get most likely state
  const mostLikely = reasoner.getMostLikely();
  const confidence = reasoner.getConfidence(mostLikely);
  
  if (confidence > 0.8) {
    // High confidence: Act on belief
    return selectActionFor(mostLikely);
  } else {
    // Low confidence: Gather more evidence
    return { type: 'investigate_further' };
  }
}
```

---

## 📈 ADVANTAGES

1. **Handles Uncertainty**: Explicit probability estimates
2. **Incremental Learning**: Updates with each piece of evidence
3. **Prior Knowledge**: Incorporates existing knowledge
4. **Confidence Tracking**: Knows when it doesn't know

---

*Update beliefs, not just answers.*

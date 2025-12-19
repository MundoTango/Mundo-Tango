# Free Energy Principle & Active Inference

**Invocation:** `use mb.md: cognition:fep`

---

## 🧠 WHAT IS THE FREE ENERGY PRINCIPLE?

The Free Energy Principle (FEP) states that intelligent systems minimize "surprise" (prediction error) through two mechanisms:
1. **Perception**: Update beliefs to match observations
2. **Action**: Change the environment to match predictions

```
┌─────────────────────────────────────────────────────────────┐
│              FREE ENERGY MINIMIZATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   WORLD STATE ──────▶ OBSERVATION                          │
│                            │                                │
│                            ▼                                │
│                    ┌───────────────┐                       │
│                    │   SURPRISE    │                       │
│                    │ (Prediction   │                       │
│                    │    Error)     │                       │
│                    └───────┬───────┘                       │
│                            │                                │
│              ┌─────────────┴─────────────┐                 │
│              ▼                           ▼                 │
│     ┌─────────────────┐        ┌─────────────────┐        │
│     │    PERCEPTION   │        │     ACTION      │        │
│     │ (Update Beliefs)│        │ (Change World)  │        │
│     └─────────────────┘        └─────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 ACTIVE INFERENCE

Active Inference extends FEP by adding **goal-directed behavior**. The agent minimizes Expected Free Energy (EFE) to balance:

- **Exploitation**: Pursue goals (minimize expected surprise)
- **Exploration**: Reduce uncertainty (gather information)

```typescript
// Expected Free Energy = Pragmatic Value + Epistemic Value
const EFE = pragmaticValue + epistemicValue;

// Pragmatic: How well does this action achieve goals?
// Epistemic: How much does this action reduce uncertainty?
```

---

## 🔧 IMPLEMENTATION IN MR. BLUE

### Our Self-Healing System IS Active Inference

```typescript
// PredictivePreCheckService - Predicts page health
class PredictivePreCheckService {
  // PREDICTION: What we expect the page state to be
  async predictPageHealth(pageId: string): Promise<Prediction> {
    const historicalData = await this.getHistory(pageId);
    return this.model.predict(historicalData);
  }
  
  // OBSERVATION: Actual page state
  async observePageState(pageId: string): Promise<Observation> {
    return await this.auditPage(pageId);
  }
  
  // SURPRISE: Difference between prediction and observation
  calculateSurprise(prediction: Prediction, observation: Observation): number {
    return this.computePredictionError(prediction, observation);
  }
  
  // ACTION: Fix issues to minimize surprise
  async minimizeSurprise(pageId: string, surprise: number): Promise<void> {
    if (surprise > THRESHOLD) {
      // Option 1: Update beliefs (maybe this is normal now)
      await this.updateModel(pageId);
      
      // Option 2: Take action (fix the page)
      await this.selfHeal(pageId);
    }
  }
}
```

### PageAuditService - Belief Updating

```typescript
class PageAuditService {
  private beliefs: Map<string, PageHealthBelief> = new Map();
  
  async updateBeliefs(pageId: string, observation: AuditResult): void {
    const prior = this.beliefs.get(pageId) || defaultBelief;
    
    // Bayesian update: posterior ∝ likelihood × prior
    const likelihood = this.computeLikelihood(observation);
    const posterior = this.bayesianUpdate(prior, likelihood);
    
    this.beliefs.set(pageId, posterior);
  }
  
  private bayesianUpdate(
    prior: PageHealthBelief, 
    likelihood: number
  ): PageHealthBelief {
    // Simplified weighted average
    const weight = 0.3; // Learning rate
    return {
      healthScore: prior.healthScore * (1 - weight) + likelihood * weight,
      confidence: prior.confidence * 0.9 + 0.1, // Confidence grows with data
      lastUpdated: new Date()
    };
  }
}
```

---

## 📊 PRACTICAL APPLICATION

### User Mental Model Inference

```typescript
interface UserGenerativeModel {
  currentGoal: string;
  frustrationLevel: number;      // 0-1
  expertiseLevel: 'novice' | 'intermediate' | 'expert';
  uncertaintyLevel: number;      // Entropy of beliefs
  recentActions: string[];
  timeOfDayPatterns: Map<number, string>;
}

class ActiveInferenceAgent {
  private userModel: UserGenerativeModel;
  
  async inferUserState(observation: UserAction): Promise<void> {
    // Update model based on observation
    const prediction = this.predictAction(this.userModel);
    const surprise = this.computeSurprise(prediction, observation);
    
    if (surprise > 0.5) {
      // High surprise = update model significantly
      await this.updateUserModel(observation, weight: 0.5);
    } else {
      // Low surprise = minor update
      await this.updateUserModel(observation, weight: 0.1);
    }
  }
  
  async selectAction(): Promise<AgentAction> {
    const policies = this.generatePolicies();
    
    // Evaluate each policy by Expected Free Energy
    const evaluatedPolicies = policies.map(policy => ({
      policy,
      efe: this.computeEFE(policy, this.userModel)
    }));
    
    // Select policy with lowest EFE
    return evaluatedPolicies
      .sort((a, b) => a.efe - b.efe)[0]
      .policy;
  }
  
  private computeEFE(policy: Policy, model: UserGenerativeModel): number {
    // Pragmatic: Does this help user achieve goal?
    const pragmatic = this.pragmaticValue(policy, model.currentGoal);
    
    // Epistemic: Does this reduce our uncertainty about user?
    const epistemic = this.epistemicValue(policy, model.uncertaintyLevel);
    
    return -(pragmatic + epistemic); // Lower is better
  }
}
```

---

## 🎯 WHEN TO APPLY FEP

| Situation | FEP Application |
|-----------|-----------------|
| Page health monitoring | Predict → Observe → Minimize surprise |
| User intent inference | Build generative model, update on actions |
| Error detection | High surprise = something wrong |
| Resource allocation | Minimize expected free energy |
| Learning priorities | Focus on high-surprise areas |

---

## 📈 BENEFITS

1. **Principled Uncertainty Handling**: Natural exploration/exploitation balance
2. **Adaptive Learning**: Continuous belief updating without retraining
3. **Proactive Behavior**: Act before problems manifest
4. **Energy Efficiency**: Focus resources on unexpected events
5. **Unified Framework**: One principle governs perception and action

---

## 🔗 RELATED FRAMEWORKS

- **Bayesian**: Belief updating mechanics → `use mb.md: cognition:bayesian`
- **Reflexion**: Learning from surprise → `use mb.md: cognition:reflexion`
- **Self-Healing**: FEP in practice → `use mb.md: agents:self-healing`

---

*Minimize surprise. Maximize understanding.*

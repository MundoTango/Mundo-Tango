# Expert Council OSI References

> MB.MD Pattern 26: OSI (Open Source Intelligence) Protocol
> Last Updated: December 7, 2025
> Purpose: Battle-tested references for each expert's recommendations

---

## Overview

Per MB.MD Pattern 26, before implementing expert recommendations, we research open-source and case-study references proving each approach works. This prevents reinvention and ensures we adopt validated patterns.

---

## 1. Tamás Szalai - Systems & Infrastructure

### Recommendation: SLOs with Grafana/Prometheus

**OSI References**:

1. **Google SRE Book - SLOs Chapter**
   - URL: https://sre.google/sre-book/service-level-objectives/
   - Key Learning: Define SLOs as user-centric (not system-centric). Error budgets enable risk-taking.
   
2. **Honeycomb SLO Guide**
   - URL: https://www.honeycomb.io/blog/slo-sli-sle-series
   - Key Learning: Start with 3-5 critical user journeys, not 100 endpoints.

3. **Grafana SLO Dashboard Template**
   - URL: https://grafana.com/grafana/dashboards/14981
   - Key Learning: Multi-burn-rate alerts (fast burn, slow burn) reduce alert fatigue.

**Implementation Template**:
```yaml
# prometheus-alerts.yml
groups:
  - name: slo-alerts
    rules:
      - alert: TalentMatchLatencyBudgetBurn
        expr: |
          (
            sum(rate(http_request_duration_seconds_bucket{handler="/api/talent-match",le="2"}[5m]))
            /
            sum(rate(http_request_duration_seconds_count{handler="/api/talent-match"}[5m]))
          ) < 0.99
        for: 2m
        labels:
          severity: warning
```

---

## 2. Aleksandra Płochocka - Theory & AI Rigor

### Recommendation: FEP Implementation Validation

**OSI References**:

1. **Active Inference Python Library**
   - URL: https://github.com/infer-actively/pymdp
   - Key Learning: Minimal viable active inference in 500 LOC. Start with belief updating, not full generative model.

2. **Friston Lab Papers**
   - URL: https://www.fil.ion.ucl.ac.uk/~karl/
   - Key Learning: "Surprisal" = -log(P(observation)). Track prediction errors as proxy.

3. **OpenAI Evals Framework**
   - URL: https://github.com/openai/evals
   - Key Learning: Testable hypotheses require eval datasets and clear metrics.

**Implementation Template**:
```typescript
// Minimal FEP metric
interface FEPMetric {
  surprisal: number;      // -log(P(observed_state))
  predictionError: number; // |predicted - actual|
  actionTaken: string;
  expectedFreeEnergy: number; // Lower = better action
}
```

---

## 3. Davor Perhaj - UX/UI Design

### Recommendation: Hero Journey Onboarding

**OSI References**:

1. **Airbnb Onboarding Case Study**
   - URL: https://growth.design/case-studies/airbnb-first-time-experience
   - Key Learning: Reduce decisions per screen. Show value before asking for commitment.

2. **Figma Community - Onboarding Templates**
   - URL: https://www.figma.com/community/search?resource_type=mixed&sort_by=relevancy&query=onboarding
   - Key Learning: Progress indicators reduce abandonment by 40%.

3. **NNGroup - UX Friction Audit**
   - URL: https://www.nngroup.com/articles/minimize-cognitive-load/
   - Key Learning: Cognitive load = working memory tax. Max 4 items per decision point.

**Implementation Checklist**:
- [ ] 3 clicks max from landing to first value
- [ ] Progress bar on multi-step flows
- [ ] Celebrate completion (confetti, success animation)
- [ ] Mobile-first (67% of users)

---

## 4. Caran "Carandu" - Product & Strategy

### Recommendation: "Tanda de 3" Product Wedge

**OSI References**:

1. **Y Combinator Startup Library - Product Market Fit**
   - URL: https://www.ycombinator.com/library/5z-the-real-product-market-fit
   - Key Learning: "Do things that don't scale" for first 100 users. Manual curation wins.

2. **Lenny's Newsletter - Product Wedge**
   - URL: https://www.lennysnewsletter.com/p/finding-your-wedge
   - Key Learning: Wedge = narrow feature that's 10x better than alternatives. Own one thing.

3. **Airbnb's First 1000 Hosts**
   - URL: https://medium.com/@bchesky/7-rejections-7d894cbaa084
   - Key Learning: Founders personally onboarded first users. High-touch beats high-tech.

**Product Wedge Template**:
```markdown
## Tanda de 3 Wedge

1. **Land in City**: Find milonga in 48hrs (vs. weeks on Facebook)
2. **Find Partner**: Match by skill level (vs. random DMs)
3. **Share Moment**: Instagram-like posting (vs. cluttered groups)

Each wedge must be 10x better than the current alternative (Facebook groups).
```

---

## 5. Karthikeyan Rajendran - ML & Engineering

### Recommendation: AI Cost Budgets & Labs Separation

**OSI References**:

1. **OpenAI Cookbook - Cost Optimization**
   - URL: https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken
   - Key Learning: Truncate context to reduce costs. Summarize instead of full history.

2. **Anthropic Claude Cost Guide**
   - URL: https://docs.anthropic.com/en/docs/about-claude/pricing
   - Key Learning: Claude Haiku is 20x cheaper than Opus. Route simple tasks to cheap models.

3. **LangChain Cost Callbacks**
   - URL: https://python.langchain.com/docs/modules/callbacks/
   - Key Learning: Wrap every LLM call with cost callback. Aggregate daily.

**Cost Tracking Pattern**:
```typescript
// Per-request cost tracking middleware
const trackAICost = async (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = (body) => {
    const usage = res.locals.aiUsage;
    if (usage) {
      CostTracker.trackSpend({
        userId: req.user?.id,
        platform: usage.platform,
        model: usage.model,
        cost: usage.cost,
        tokens: usage.totalTokens
      });
    }
    return originalSend.call(res, body);
  };
  next();
};
```

---

## 6. Jörn Schillmann - Strategy & Consulting

### Recommendation: One-Page Executive Brief

**OSI References**:

1. **Amazon 6-Pager Template**
   - URL: https://writingcooperative.com/the-anatomy-of-an-amazon-6-pager-fc79f31a41c9
   - Key Learning: Narrative structure > bullet points. Start with customer problem.

2. **Sequoia Pitch Deck Template**
   - URL: https://www.sequoiacap.com/article/writing-a-business-plan/
   - Key Learning: Problem → Solution → Why Now → Market → Competition → Team → Financials

3. **YC Series A Guide**
   - URL: https://www.ycombinator.com/library/8d-how-to-raise-a-series-a
   - Key Learning: Metrics matter. Show DAU/MAU, retention cohorts, revenue.

**Brief Structure**:
1. Problem (1 paragraph)
2. Solution (1 paragraph)
3. Why Now (1 paragraph)
4. Target Segment (1 paragraph)
5. 12-Month Roadmap (3 milestones)
6. Key Metrics (5 numbers)

---

## 7. Louis "loparks" Parks - Product Ops

### Recommendation: Incident Playbooks

**OSI References**:

1. **PagerDuty Incident Response Guide**
   - URL: https://response.pagerduty.com/
   - Key Learning: Define incident commander. Communication templates reduce MTTR.

2. **Atlassian Incident Management Handbook**
   - URL: https://www.atlassian.com/incident-management/handbook
   - Key Learning: Post-incident review within 48hrs. Blameless culture.

3. **Google SRE Workbook - On-Call**
   - URL: https://sre.google/workbook/on-call/
   - Key Learning: On-call should spend <50% time on interrupts.

**Incident Template**:
```markdown
## Incident Report: [ID]

**Severity**: P1/P2/P3/P4
**Duration**: HH:MM - HH:MM
**Impact**: [Users affected, functionality]

### Timeline
- HH:MM: Issue detected by [alert/user report]
- HH:MM: Team engaged
- HH:MM: Root cause identified
- HH:MM: Fix deployed
- HH:MM: Verified resolved

### Root Cause
[1-2 sentences]

### Action Items
- [ ] [Preventive action 1]
- [ ] [Preventive action 2]
```

---

## Application to Mundo Tango

### Priority Matrix

| Expert | OSI Research | Implementation | Validation |
|--------|-------------|----------------|------------|
| Tamás | ✅ Complete | 🔲 Pending | 🔲 Pending |
| Aleksandra | ✅ Complete | 🔲 Pending | 🔲 Pending |
| Davor | ✅ Complete | 🔲 Pending | 🔲 Pending |
| Caran | ✅ Complete | ✅ Complete | 🔲 Pending |
| Karthikeyan | ✅ Complete | ✅ Complete | 🔲 Pending |
| Jörn | ✅ Complete | ✅ Complete | 🔲 Pending |
| Louis | ✅ Complete | ✅ Complete | 🔲 Pending |

---

*"Don't reinvent. Research, adapt, implement."* — MB.MD Pattern 26

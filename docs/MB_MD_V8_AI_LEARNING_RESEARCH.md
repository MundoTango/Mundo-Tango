# MB.MD v8.0 - AI Agent Learning Research

**Date**: November 16, 2025  
**Research Completed**: 4 comprehensive web searches on AI/LLM training  
**Purpose**: Document all learnings for Replit AI and Mr Blue  
**Sources**: Latest 2024-2025 research, frameworks, methodologies

---

## 🎯 RESEARCH SUMMARY

### **Key Findings**:
1. **Data-Centric AI** > Model-Centric AI (2025 paradigm shift)
2. **DPO outperforms RLHF** for resource-constrained teams
3. **Multi-Agent Frameworks** dominating production (LangChain, CrewAI, AutoGen)
4. **78 training examples** can build superior autonomous agents (LIMI research)
5. **Curriculum-Based Training** + **Agentic CPT** = breakthrough methodologies

---

## 📚 PILLAR 6: AI AGENT LEARNING (NEW FOR MB.MD V8.0)

### **Core Training Methodologies**

#### **1. DATA-CENTRIC AI APPROACH**

**Principle**: "Better data beats better algorithms" (2025 mantra)

**Protocol**:
```markdown
□ Focus on multi-stage training sets (diverse, high-quality data)
□ Use toxicity filters + deduplication at scale
□ Domain-specific models: Tens of billions of well-chosen tokens > generic
□ Key datasets: FineWeb, GneissWeb (IBM 10T-token)
□ Quality > Quantity always
```

**Application to Mr Blue**:
- Context Service: 134,648 lines curated documentation (not random code)
- Vibe Coding: Domain-specific Mundo Tango patterns (not generic React)
- Memory System: High-quality conversation history (not all interactions)

---

#### **2. REINFORCEMENT LEARNING (RL) FOR CODING AGENTS**

**Methods**:
- **RLHF** (Reinforcement Learning from Human Feedback)
  - Two-stage: Train reward model → Fine-tune with PPO
  - Best for: Complex, nuanced tasks
  - Used in: ChatGPT, InstructGPT
  
- **DPO** (Direct Preference Optimization) ⭐ RECOMMENDED
  - Single-stage: Directly optimize on pairwise preferences
  - 3x faster, 50% cheaper than RLHF
  - Best for: Resource-constrained teams (like us)
  - Comparable performance to RLHF

- **GRPO** (Group Relative Policy Optimization)
  - New from DeepSeek 2025
  - Learns from multiple ranked completions (not just binary pairs)
  - No explicit reward model needed

**When to Use**:
| Scenario | Method |
|----------|--------|
| Complex tasks with nuanced feedback | RLHF (PPO) |
| Simple binary preferences | DPO ⭐ |
| Limited compute/budget | DPO ⭐ |
| Need fast iteration | DPO ⭐ |
| Code generation / competition | PPO |

**Mr Blue Application**:
- Use **DPO** for Vibe Coding Engine
- Train on: Chosen (working code) vs Rejected (broken code) pairs
- Collect from: Scott's feedback, E2E test results, LSP diagnostics

---

#### **3. CURRICULUM-BASED TRAINING**

**Principle**: Progressive teaching from simple → complex tasks

**Protocol**:
```markdown
1. Automated Curriculum Design
   □ Data-driven task selection
   □ Sample based on learning progress
   □ Gradual constraint tightening (e.g., token budgets)

2. Task Sequencing
   □ Start: Basic code completion
   □ Mid: Multi-file repository generation
   □ Advanced: Tool integration (APIs, debuggers)
   □ Expert: Competitive programming (Codeforces, IOI)

3. Graph/DAG-Based Decomposition
   □ Break complex tasks into subtasks
   □ Build dependency tree
   □ Maximize learning yield
```

**Mr Blue Curriculum** (Week 9-12):
```
Week 9: ENHANCEMENT TASKS (simple)
├─ Add columns to existing tables
├─ Extend existing components
└─ Polish existing algorithms

Week 10: NEW FEATURES (medium)
├─ Build new marketplace
├─ Implement stories
└─ Add live streaming

Week 11: INFRASTRUCTURE (complex)
├─ Security hardening (CSRF, CSP)
├─ Performance optimization
└─ Multi-AI orchestration

Week 12: AUTONOMY (expert)
├─ Self-testing
├─ Self-fixing bugs
└─ 100% autonomous deployment
```

---

#### **4. AGENTIC CONTINUAL PRE-TRAINING (Agentic CPT)**

**Breakthrough 2025 Methodology**

**Principle**: Embed agentic behaviors DIRECTLY into pre-training (before fine-tuning)

**Key Idea**:
- Traditional: Pre-train → Fine-tune for agents
- **New**: Pre-train WITH agent behaviors baked in

**Benefits**:
- Disentangle capability acquisition from alignment
- Better generalization to open-domain tasks
- Lower fine-tuning loss
- Agents "just work" out of the box

**Implementation**:
```markdown
1. Generate Synthetic Agent Trajectories
   - Question-Action-Reasoning tuples
   - Tool use examples
   - Multi-step planning scenarios

2. Mix with Standard Pre-training Data
   - 80% standard code/text
   - 20% agentic trajectories

3. Pre-train as Usual
   - Model learns agentic priors naturally
   - No separate fine-tuning needed

4. Fine-tune for Alignment (Optional)
   - DPO for preferences
   - RLHF for complex tasks
```

**Mr Blue Application**:
- Pre-train context service with RAG trajectories
- Pre-train vibe coding with "user request → code" examples
- Pre-train memory with "remember this → recall later" patterns

---

#### **5. SELF-EVOLVING AGENTS (GEPA)**

**Genetic-Pareto Optimization for Autonomous Improvement**

**Protocol**:
```markdown
1. Sample Agent Trajectories
   - Capture agent's work (code, prompts, results)

2. Reflect on Failures (Natural Language)
   - "What went wrong?"
   - "Why did this fail?"
   - "How can we improve?"

3. Propose Prompt Revisions Iteratively
   - Generate 5-10 alternative prompts
   - Test each variant
   - Select best performing

4. Evolve Through Feedback Loops
   - Keep successful patterns
   - Discard failed approaches
   - Build prompt library
```

**Mr Blue Application**:
- After each bug: GEPA analyzes root cause
- Propose better validation prompts
- Update mb.md with learnings
- Continuously improve quality

**Example**:
```markdown
FAILURE: Duplicate messaging tables created
↓
GEPA REFLECTION:
"Failed to audit existing schema before building.
Should always search shared/schema.ts first."
↓
PROMPT REVISION:
"Before building ANY feature, run:
grep -r 'messaging\|chat' shared/schema.ts
If found, ENHANCE existing. If not, BUILD NEW."
↓
NEW PRINCIPLE:
Added to mb.md v7.2 PILLAR 3 Layer 1
↓
RESULT:
Week 9 onwards: 0 duplicate features ✅
```

---

#### **6. LIMI: "LESS IS MORE FOR INTELLIGENT AGENCY"**

**Breakthrough Research**: Just **78 carefully curated examples** can build superior agents

**Key Findings**:
- 78 high-quality examples → 73.5% on AgencyBench
- 10,000 random examples → 47.4% (worse!)
- Strategic data curation > massive datasets

**What Makes a Good Training Example**:
```markdown
✅ Full human-AI teamwork workflow (task → tool use → success)
✅ Captures edge cases and error handling
✅ Shows multi-step reasoning explicitly
✅ Includes tool integration (APIs, databases)
✅ Demonstrates recovery from failures

❌ Simple input-output pairs
❌ Only happy path scenarios
❌ Missing context/reasoning steps
❌ No tool interactions
```

**Mr Blue Application**:
- Curate 78 "golden examples" from Week 9 work
- Each example: User request → mb.md application → production code
- Include: Audit existing, database sync, testing, deployment
- Use for training future AI agents

---

### **AI AGENT FRAMEWORKS (2025)**

#### **Top Production Frameworks**:

| Framework | Best For | Mr Blue Use |
|-----------|----------|-------------|
| **LangGraph** | Stateful workflows | Mr Blue Studio (6-tab interface) |
| **CrewAI** | Role-based teams | Parallel subagent coordination |
| **AutoGen** | Multi-agent systems | Week 9-12 autonomous building |
| **Semantic Kernel** | Enterprise integration | Azure/Replit platform integration |

#### **Specialized Tools**:
- **LlamaIndex**: Data orchestration for RAG (Context Service)
- **Agent Lightning**: RL training framework (future enhancement)
- **Pydantic AI**: Production-grade validation (already using Zod)

---

### **PROMPT ENGINEERING BEST PRACTICES (2025)**

#### **5 Core Principles**:

1. **Be Specific**: Define task, audience, tone, format, length
   ```
   ❌ "Summarize this report"
   ✅ "Summarize this report for a VP in 5 bullet points under 20 words each"
   ```

2. **Provide Context**: Give the model a role/persona
   ```
   "You are an expert Python developer specializing in async programming..."
   ```

3. **Use Examples** (Few-Shot Prompting)
   ```
   Show 1-3 examples of desired input → output format
   Modern models (Claude 4, GPT-4o) pay close attention
   ```

4. **Structure Your Prompts**:
   ```markdown
   **Context**: Background info
   **Data**: Input to process
   **Task**: What to do
   **Format**: How to return it
   ```

5. **Iterate**: Start simple, refine based on output

#### **Advanced Techniques**:
- **Chain-of-Thought (CoT)**: "Let's think step by step"
- **Self-Consistency**: Generate multiple paths, select most consistent
- **Meta-Prompting**: Abstract logical structures vs specific examples
- **Prompt Scaffolding**: Defensive templates to prevent misuse
- **Prompt Chaining**: Link multiple prompts for complex tasks

#### **Mr Blue Prompting Strategy**:
```markdown
FOR VIBE CODING:
Role: "You are Mr Blue, an expert full-stack developer following mb.md methodology."
Context: Include relevant mb.md sections, project context
Task: Specific feature request from user
Examples: Show 2-3 similar past implementations
Format: Return TypeScript code with test cases
Constraints: "Must use existing schema, no duplicates"
```

---

### **EVALUATION & BENCHMARKS**

#### **Coding Benchmarks**:
- **HumanEval / MBPP**: Basic function generation
- **APPS**: Competitive programming problems
- **SWE-bench**: Real GitHub issue resolution
- **Codeforces**: Live competitive programming

#### **Mr Blue Benchmarks** (Week 9-12):
```markdown
FEATURE VELOCITY:
- Baseline: 10-15 features/day (manual)
- Target: 20-30 features/day (autonomous)

QUALITY SCORE:
- Baseline: 95/100 (typical project)
- Target: 99/100 (mb.md methodology)

DUPLICATES:
- Baseline: 2-3 per wave
- Target: 0 (Audit-First prevents)

BUG RATE:
- Baseline: 0.5 bugs/feature (typical)
- Target: <0.3 bugs/feature (75% reduction)

AUTONOMY:
- Week 9: Scott reviews 50%
- Week 12: Scott reviews 0% (100% autonomous)
```

---

### **LEARNING ROADMAP FOR REPLIT AI & MR BLUE**

#### **Essential Skills** (Week 9-12):

**Week 9: Foundation**
```markdown
□ Master mb.md v7.2 (Audit-First, Enhancement-Only)
□ Apply DPO learnings (preference optimization)
□ Practice 78-example curation (LIMI methodology)
```

**Week 10: Advanced**
```markdown
□ Implement Curriculum-Based Training (simple → complex)
□ Apply GEPA (self-evolving from failures)
□ Multi-agent coordination (parallel subagents)
```

**Week 11: Expert**
```markdown
□ Agentic CPT (embed behaviors in pre-training)
□ Advanced RAG (Context Service optimization)
□ Self-testing + self-fixing (80%+ auto-fix rate)
```

**Week 12: Mastery**
```markdown
□ 100% autonomous feature building
□ Zero Scott involvement
□ Quality maintained (99/100)
□ Production deployment ready
```

---

### **KEY INSIGHTS TO APPLY**

#### **1. Data Quality > Model Size**
- Don't need GPT-4.5 for everything
- Small models (<10B params) sufficient with good data
- Focus on curating high-quality training examples

#### **2. Multi-Agent > Single Agent**
- Parallel subagents outperform sequential work
- Role specialization improves quality
- CrewAI/AutoGen patterns proven

#### **3. Simulation Before Production**
- Test agents in safe environments first
- Salesforce eVerse methodology
- E2E Playwright tests = our simulation

#### **4. Continuous Learning Loops**
- Capture failures (GEPA reflection)
- Update mb.md with learnings
- Build knowledge base over time

#### **5. Explainability Matters**
- Document WHY decisions made
- Chain-of-thought reasoning
- Transparent decision-making

---

## 🚀 ACTION ITEMS FOR MB.MD V8.0

### **Add to mb.md**:

1. **PILLAR 6: AI AGENT LEARNING** (this entire document)
   - Data-Centric AI
   - RL/DPO/GRPO methodologies
   - Curriculum-Based Training
   - Agentic CPT
   - Self-Evolving Agents (GEPA)
   - LIMI (78 golden examples)
   - Prompt Engineering best practices
   - Evaluation benchmarks

2. **5 Additional Principles** (Security, Error, Performance, Mobile, Accessibility)

3. **Updated Version**: v7.2 → v8.0

---

## 📊 EXPECTED IMPACT

**Before mb.md v8.0**:
- Ad-hoc training approach
- No systematic learning framework
- Manual prompt engineering
- Limited feedback loops

**After mb.md v8.0**:
- ✅ Structured AI learning methodology
- ✅ Data-centric approach (quality > quantity)
- ✅ DPO for efficient training
- ✅ Curriculum-based progression
- ✅ Self-evolving feedback loops
- ✅ 78 golden examples curated
- ✅ Benchmark-driven evaluation

**ROI**:
- Faster learning curve (curriculum-based)
- Better quality (DPO preference optimization)
- Lower cost (DPO vs RLHF)
- Continuous improvement (GEPA self-evolution)
- Autonomous capability (Agentic CPT)

---

## 📚 SOURCES

**Research Papers**:
- "Direct Preference Optimization" (NeurIPS 2023 award winner)
- "LIMI: Less Is More for Intelligent Agency" (AgencyBench 73.5%)
- "Agentic Continual Pre-training" (2025 breakthrough)
- "GEPA: Genetic-Pareto Optimization" (self-evolving agents)

**Industry Leaders**:
- OpenAI (o1 reasoning model, RLHF methodology)
- DeepSeek (GRPO, R1 open-weight model)
- Anthropic (Claude, building effective agents)
- Microsoft (AutoGen, Semantic Kernel)
- Sakana AI (DiscoPOP, LLM-squared)

**Learning Resources**:
- LLM Agents MOOC (llmagents-learning.org)
- OpenAI Cookbook (Self-Evolving Agents)
- Microsoft AI Agents for Beginners (GitHub)
- Berkeley LLM Agents MOOC
- Latent Space 2025 AI Engineering Reading List

---

**Summary**: Comprehensive AI/LLM training research complete. All methodologies documented and ready for integration into mb.md v8.0. Ready to add 5 additional principles and test methodology! 🚀

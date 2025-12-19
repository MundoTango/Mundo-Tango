# Core Agents

**Invocation:** `use mb.md: agents:core`

---

## 🧠 49 CORE MR. BLUE AGENTS

Fundamental capabilities that power everything.

---

## CONTEXT & MEMORY (8)

### ContextService
Semantic search and page awareness.
```typescript
interface ContextService {
  search(query: string): Promise<SearchResult[]>;
  getPageContext(path: string): Promise<PageContext>;
  storeContext(context: Context): Promise<void>;
}
```

### MemoryService
Long-term context retention using LanceDB.

### SessionTracker
Tracks changes within current session.

### RecursiveContextService
Hierarchical code summarization.

### AgentKnowledgeLoader
Loads knowledge bases for agents.

### AgentKnowledgeSync
Syncs knowledge across agents.

### PatternRecognition
Identifies recurring patterns.

### DecisionSupport
Provides decision context.

---

## CODE GENERATION (7)

### VibeCodingService
Natural language → working code.
```typescript
interface VibeCodingService {
  generateCode(instruction: string): Promise<CodeResult>;
  applyChanges(changes: Change[]): Promise<void>;
  preview(instruction: string): Promise<Preview>;
}
```

### CodeGenerator
Generates code from specifications.

### BackendOrchestrator
Coordinates backend code generation.

### BaseAPIAgent
Creates API endpoints.

### BaseSchemaAgent
Handles database changes.

### BaseSecurityAgent
Implements auth/permissions.

### BaseServiceAgent
Creates business logic.

---

## VOICE & MEDIA (6)

### VoiceFirstService
Speech recognition and synthesis.
```typescript
interface VoiceFirstService {
  transcribe(audio: Blob): Promise<string>;
  synthesize(text: string): Promise<AudioBuffer>;
  getVoices(): Voice[];
}
```

### AvatarAgent
D-ID integration for animated avatars.

### VideoConference
Daily.co integration.

### MediaProcessor
Image and video handling.

### TTS (Text-to-Speech)
ElevenLabs voice cloning.

### STT (Speech-to-Text)
Groq Whisper transcription.

---

## AUTONOMOUS SYSTEMS (6)

### AutonomousEngine
Self-directed task completion.
```typescript
interface AutonomousEngine {
  execute(goal: string): Promise<Result>;
  plan(goal: string): Promise<Plan>;
  monitor(taskId: string): TaskStatus;
}
```

### AutoFixEngine
Automatic error resolution.

### EscalationService
Handles blockers and escalations.

### EvidenceCollector
Gathers debugging evidence.

### TaskDecomposer
Breaks tasks into subtasks.

### GoalTracker
Monitors objective progress.

---

## MESSAGING & COMMUNICATION (5)

### FacebookMessengerService
Community messaging via Messenger.

### NotificationService
Push and email notifications.

### BroadcastService
Mass communications.

### ChatService
Real-time chat functionality.

### EmailService
Transactional emails.

---

## INTELLIGENCE (8)

### BifrostGateway
Multi-provider AI access.
```typescript
interface BifrostGateway {
  chat(message: string, provider?: Provider): Promise<Response>;
  embed(text: string): Promise<number[]>;
  available(): Provider[];
}
```

### ConversationOrchestrator
Manages multi-turn conversations.

### IntentClassifier
Determines user intent.

### EntityExtractor
Extracts entities from text.

### SentimentAnalyzer
Analyzes emotional tone.

### LanguageDetector
Detects language (68 supported).

### TranslationService
Multi-language translation.

### SummarizationService
Content summarization.

---

## SPECIALIZED (9)

### SubscriptionAgent
Manages user subscriptions.

### TourGuideAgent
Onboarding tours.

### RoleAdapterAgent
Adapts to user roles.

### QualityValidatorAgent
Validates work quality.

### SolutionSuggesterAgent
Suggests solutions to problems.

### ErrorAnalysisAgent
Analyzes errors deeply.

### ProgressTrackingAgent
Tracks task progress.

### LearningCoordinator
Coordinates learning activities.

### ArbitrageEngine
Multi-provider cost optimization.

---

## 🔧 CORE AGENT INTERFACE

```typescript
interface CoreAgent {
  id: string;
  name: string;
  category: CoreCategory;
  
  // Execution
  execute(task: Task): Promise<TaskResult>;
  
  // Status
  getStatus(): AgentStatus;
  getMetrics(): AgentMetrics;
  
  // Communication
  handleMessage(msg: A2AMessage): Promise<A2AResponse>;
}

type CoreCategory = 
  | 'context'
  | 'code'
  | 'voice'
  | 'autonomous'
  | 'messaging'
  | 'intelligence'
  | 'specialized';
```

---

## 📊 DEPENDENCIES

```
ContextService ←── All agents (provides context)
BifrostGateway ←── Intelligence agents
VibeCodingService ←── Code agents
AutonomousEngine ←── Self-healing agents
```

---

*49 core capabilities. One unified system.*

/**
 * BaseLeadershipAgent - Base class for all leadership agents
 * 
 * MB.MD Leadership Agent Architecture:
 * Each leadership agent has real-world job knowledge, Mundo Tango platform expertise,
 * learned experiences, and god-level directives.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface LeadershipKnowledge {
  realWorld: string[];
  mundoTango: Record<string, any>;
  learnedExperiences: LearningEntry[];
  godCommands: GodCommand[];
}

export interface LearningEntry {
  id: string;
  type: 'pattern' | 'anti-pattern' | 'error' | 'strategic' | 'process' | 'growth';
  content: string;
  timestamp: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
}

export interface GodCommand {
  id: string;
  command: string;
  issuedBy: string;
  timestamp: string;
  scope: 'global' | 'agent-specific' | 'temporary';
  targetAgents: string[];
  priority: 'override' | 'high' | 'normal';
  expiresAt: string | null;
  active: boolean;
}

export interface LeadershipDecision {
  agentId: string;
  decision: string;
  reasoning: string;
  confidence: number;
  alternatives: string[];
  risks: string[];
  timestamp: Date;
}

export interface LeadershipTask {
  id: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  domain: string;
  requiredKnowledge: string[];
}

export abstract class BaseLeadershipAgent {
  protected id: string;
  protected name: string;
  protected role: string;
  protected reportsTo: string | null;
  protected directReports: string[];
  protected memoryPath: string;
  protected knowledge: LeadershipKnowledge | null = null;

  constructor(
    id: string,
    name: string,
    role: string,
    reportsTo: string | null = null,
    directReports: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.reportsTo = reportsTo;
    this.directReports = directReports;
    this.memoryPath = path.join(process.cwd(), 'Mr Blue/agents/leadership/memory');
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getRole(): string {
    return this.role;
  }

  getReportsTo(): string | null {
    return this.reportsTo;
  }

  getDirectReports(): string[] {
    return this.directReports;
  }

  /**
   * Load agent knowledge from memory files
   */
  async loadKnowledge(): Promise<LeadershipKnowledge> {
    if (this.knowledge) {
      return this.knowledge;
    }

    try {
      // Load agent-specific memory
      const agentMemoryPath = path.join(this.memoryPath, `${this.id}.json`);
      const agentMemory = await this.loadJSON(agentMemoryPath);

      // Load god commands
      const godCommandsPath = path.join(this.memoryPath, 'god-commands.json');
      const godCommandsFile = await this.loadJSON(godCommandsPath);

      // Filter commands relevant to this agent
      const relevantCommands = godCommandsFile?.commands?.filter((cmd: GodCommand) => 
        cmd.active && (
          cmd.targetAgents.includes('*') || 
          cmd.targetAgents.includes(this.id)
        )
      ) || [];

      this.knowledge = {
        realWorld: agentMemory?.realWorldKnowledge?.sources || [],
        mundoTango: agentMemory?.mundoTangoKnowledge || {},
        learnedExperiences: agentMemory?.learnedExperiences || [],
        godCommands: relevantCommands,
      };

      console.log(`[${this.name}] Loaded knowledge: ${this.knowledge.realWorld.length} real-world sources, ${this.knowledge.learnedExperiences.length} learned experiences, ${this.knowledge.godCommands.length} god commands`);

      return this.knowledge;
    } catch (error) {
      console.error(`[${this.name}] Error loading knowledge:`, error);
      return {
        realWorld: [],
        mundoTango: {},
        learnedExperiences: [],
        godCommands: [],
      };
    }
  }

  /**
   * Load JSON file safely
   */
  protected async loadJSON(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save learning to memory
   */
  async learn(entry: Omit<LearningEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const agentMemoryPath = path.join(this.memoryPath, `${this.id}.json`);
      const agentMemory = await this.loadJSON(agentMemoryPath) || {
        agentId: this.id,
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        learnedExperiences: [],
      };

      const newEntry: LearningEntry = {
        id: `learn-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...entry,
      };

      agentMemory.learnedExperiences = agentMemory.learnedExperiences || [];
      agentMemory.learnedExperiences.push(newEntry);
      agentMemory.lastUpdated = new Date().toISOString();

      await fs.writeFile(agentMemoryPath, JSON.stringify(agentMemory, null, 2));
      
      // Invalidate cache
      this.knowledge = null;

      console.log(`[${this.name}] Learned: ${entry.content}`);
    } catch (error) {
      console.error(`[${this.name}] Error saving learning:`, error);
    }
  }

  /**
   * Get context for decision making
   */
  async getDecisionContext(): Promise<string> {
    const knowledge = await this.loadKnowledge();
    
    const sections: string[] = [];

    // Add god commands first (highest priority)
    if (knowledge.godCommands.length > 0) {
      sections.push('## GOD-LEVEL DIRECTIVES (HIGHEST PRIORITY)');
      knowledge.godCommands.forEach(cmd => {
        sections.push(`- [${cmd.priority.toUpperCase()}] ${cmd.command}`);
      });
    }

    // Add role context
    sections.push(`\n## ROLE: ${this.name} (${this.role})`);
    if (this.reportsTo) {
      sections.push(`Reports to: ${this.reportsTo}`);
    }
    if (this.directReports.length > 0) {
      sections.push(`Direct reports: ${this.directReports.join(', ')}`);
    }

    // Add real-world knowledge
    if (knowledge.realWorld.length > 0) {
      sections.push('\n## REAL-WORLD JOB KNOWLEDGE');
      knowledge.realWorld.forEach(item => {
        sections.push(`- ${item}`);
      });
    }

    // Add Mundo Tango knowledge
    if (Object.keys(knowledge.mundoTango).length > 0) {
      sections.push('\n## MUNDO TANGO PLATFORM KNOWLEDGE');
      sections.push(JSON.stringify(knowledge.mundoTango, null, 2));
    }

    // Add learned experiences (most recent first)
    if (knowledge.learnedExperiences.length > 0) {
      sections.push('\n## LEARNED EXPERIENCES');
      const sorted = [...knowledge.learnedExperiences]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10); // Top 10 most recent

      sorted.forEach(exp => {
        sections.push(`- [${exp.type.toUpperCase()}] ${exp.content}`);
      });
    }

    return sections.join('\n');
  }

  /**
   * Analyze a task and determine if this agent can handle it
   */
  abstract canHandle(task: LeadershipTask): Promise<{
    canHandle: boolean;
    confidence: number;
    reason: string;
  }>;

  /**
   * Execute a task
   */
  abstract execute(task: LeadershipTask, context: any): Promise<LeadershipDecision>;

  /**
   * Provide strategic guidance
   */
  abstract advise(question: string): Promise<string>;

  /**
   * Escalate to reporting manager
   */
  async escalate(issue: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    console.log(`[${this.name}] Escalating to ${this.reportsTo || 'God User'}: [${severity.toUpperCase()}] ${issue}`);
    
    // Log escalation
    await this.learn({
      type: 'process',
      content: `Escalated issue: ${issue} (${severity})`,
      impact: severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'medium',
    });
  }

  /**
   * Delegate to a direct report
   */
  async delegate(task: LeadershipTask, toAgent: string): Promise<void> {
    if (!this.directReports.includes(toAgent)) {
      throw new Error(`${toAgent} is not a direct report of ${this.name}`);
    }

    console.log(`[${this.name}] Delegating to ${toAgent}: ${task.description}`);
  }
}

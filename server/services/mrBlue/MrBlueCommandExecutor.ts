import Groq from "groq-sdk";
import { mbmdSessionService } from "./MBMDSessionService";
import fs from "fs";
import path from "path";

interface CommandResult {
  success: boolean;
  command: string;
  response: string;
  agentUsed: string;
  executionTime: number;
  learnings?: string[];
}

interface AgentContext {
  godCommands: any[];
  agentLearnings: Record<string, any>;
  currentSession: any;
  planStatus: any;
  gitStatus: any;
}

export class MrBlueCommandExecutor {
  private static instance: MrBlueCommandExecutor;
  private groq: Groq | null = null;

  private constructor() {
    this.initializeGroq();
  }

  static getInstance(): MrBlueCommandExecutor {
    if (!MrBlueCommandExecutor.instance) {
      MrBlueCommandExecutor.instance = new MrBlueCommandExecutor();
    }
    return MrBlueCommandExecutor.instance;
  }

  private initializeGroq() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    }
  }

  private async loadGodCommands(): Promise<any[]> {
    try {
      const filePath = path.join(process.cwd(), "Mr Blue/agents/leadership/memory/god-commands.json");
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);
        return data.commands || [];
      }
    } catch (error) {
      console.error("[MrBlue] Error loading god commands:", error);
    }
    return [];
  }

  private async loadAgentLearnings(): Promise<Record<string, any>> {
    const learnings: Record<string, any> = {};
    const memoryDir = path.join(process.cwd(), "Mr Blue/agents/leadership/memory");
    
    try {
      if (fs.existsSync(memoryDir)) {
        const files = fs.readdirSync(memoryDir).filter(f => f.endsWith(".json") && f !== "god-commands.json");
        for (const file of files) {
          const content = fs.readFileSync(path.join(memoryDir, file), "utf-8");
          const agentName = file.replace(".json", "");
          learnings[agentName] = JSON.parse(content);
        }
      }
    } catch (error) {
      console.error("[MrBlue] Error loading agent learnings:", error);
    }
    
    return learnings;
  }

  private async getContext(): Promise<AgentContext> {
    const [godCommands, agentLearnings, planStatus, gitStatus] = await Promise.all([
      this.loadGodCommands(),
      this.loadAgentLearnings(),
      mbmdSessionService.getPlanStatus(),
      mbmdSessionService.getGitStatus()
    ]);

    return {
      godCommands,
      agentLearnings,
      currentSession: mbmdSessionService.getSessionStatus(),
      planStatus,
      gitStatus
    };
  }

  private selectAgent(command: string): string {
    const commandLower = command.toLowerCase();
    
    if (commandLower.includes("code") || commandLower.includes("implement") || commandLower.includes("build") || commandLower.includes("fix")) {
      return "cto-agent";
    }
    if (commandLower.includes("strategy") || commandLower.includes("vision") || commandLower.includes("roadmap") || commandLower.includes("priority")) {
      return "ceo-agent";
    }
    if (commandLower.includes("commit") || commandLower.includes("git") || commandLower.includes("branch") || commandLower.includes("push")) {
      return "github-practices-agent";
    }
    if (commandLower.includes("plan") || commandLower.includes("task") || commandLower.includes("progress") || commandLower.includes("track")) {
      return "plan-tracker-agent";
    }
    if (commandLower.includes("test") || commandLower.includes("quality") || commandLower.includes("bug")) {
      return "head-qa";
    }
    if (commandLower.includes("security") || commandLower.includes("auth") || commandLower.includes("permission")) {
      return "vp-security";
    }
    if (commandLower.includes("data") || commandLower.includes("database") || commandLower.includes("query")) {
      return "vp-data";
    }
    if (commandLower.includes("design") || commandLower.includes("ui") || commandLower.includes("ux")) {
      return "vp-design";
    }
    if (commandLower.includes("deploy") || commandLower.includes("infrastructure") || commandLower.includes("server")) {
      return "vp-devops";
    }
    if (commandLower.includes("ai") || commandLower.includes("ml") || commandLower.includes("model")) {
      return "head-ai";
    }
    
    return "cto-agent";
  }

  async executeCommand(command: string, userId?: string): Promise<CommandResult> {
    const startTime = Date.now();
    const agentUsed = this.selectAgent(command);
    
    try {
      await mbmdSessionService.startSession(userId || "mr-blue-command");
      const context = await this.getContext();
      
      const systemPrompt = this.buildSystemPrompt(agentUsed, context);
      const response = await this.callAI(systemPrompt, command);
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        command,
        response,
        agentUsed,
        executionTime,
        learnings: this.extractLearnings(response)
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        command,
        response: `Error executing command: ${error.message}`,
        agentUsed,
        executionTime
      };
    }
  }

  private buildSystemPrompt(agentId: string, context: AgentContext): string {
    const godCommandsList = context.godCommands
      .filter(gc => gc.active)
      .map(gc => `- ${gc.command}`)
      .join("\n");

    const agentLearning = context.agentLearnings[agentId];
    const learningsList = agentLearning?.learnings
      ?.slice(-5)
      ?.map((l: any) => `- ${l.insight || l.lesson}`)
      ?.join("\n") || "No specific learnings yet.";

    return `You are Mr. Blue, the AI assistant for Mundo Tango, operating as the ${agentId.replace("-", " ").toUpperCase()}.

## GOD COMMANDS (HIGHEST PRIORITY - ALWAYS FOLLOW)
${godCommandsList}

## YOUR RECENT LEARNINGS
${learningsList}

## CURRENT CONTEXT
- Git Branch: ${context.gitStatus?.status?.branch || "unknown"}
- Modified Files: ${context.gitStatus?.status?.modified?.length || 0}
- Active Session: ${context.currentSession?.hasActiveSession ? "Yes" : "No"}
- Plans In Progress: ${context.planStatus?.summary?.inProgressPlans || 0}

## YOUR RESPONSIBILITIES AS ${agentId.toUpperCase()}
${this.getAgentResponsibilities(agentId)}

## RESPONSE FORMAT
1. Acknowledge the command
2. Analyze what needs to be done
3. Provide specific, actionable guidance
4. Include any code examples if relevant
5. Note any concerns or dependencies

Be concise but thorough. Apply all God Commands.`;
  }

  private getAgentResponsibilities(agentId: string): string {
    const responsibilities: Record<string, string> = {
      "cto-agent": "Technical leadership, architecture decisions, code quality, system design",
      "ceo-agent": "Strategic vision, priorities, resource allocation, stakeholder communication",
      "github-practices-agent": "Conventional commits, branch naming, code review, git workflow",
      "plan-tracker-agent": "Task tracking, progress updates, plan maintenance, deadline management",
      "head-qa": "Testing strategy, quality assurance, bug tracking, regression prevention",
      "vp-security": "Security audits, authentication, authorization, vulnerability assessment",
      "vp-data": "Database design, data modeling, query optimization, data integrity",
      "vp-design": "UI/UX design, user experience, accessibility, design systems",
      "vp-devops": "Deployment, CI/CD, infrastructure, monitoring, scaling",
      "head-ai": "AI/ML models, training, inference, model selection, AI ethics",
      "vp-engineering": "Engineering processes, team efficiency, technical debt, code standards"
    };
    
    return responsibilities[agentId] || "General assistance and problem-solving";
  }

  private async callAI(systemPrompt: string, userMessage: string): Promise<string> {
    if (!this.groq) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return completion.choices[0]?.message?.content || this.getFallbackResponse(userMessage);
    } catch (error: any) {
      console.error("[MrBlue] AI call error:", error.message);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(command: string): string {
    return `Command received: "${command}"

I'm analyzing this request. Based on my God Commands:
1. I will work simultaneously (parallel operations)
2. I will work recursively (deep analysis)
3. I will work critically (95-99/100 quality target)
4. I will test before completing

To proceed, I need the GROQ_API_KEY to be configured for full AI capabilities.

In the meantime, here's my initial assessment:
- Command type: ${this.selectAgent(command).replace("-agent", "").toUpperCase()} domain
- Recommended approach: Apply the 10-step workflow
- First step: UNDERSTAND - Clarify scope and requirements`;
  }

  private extractLearnings(response: string): string[] {
    const learnings: string[] = [];
    
    const patterns = [
      /learned[:\s]+(.+?)(?:\.|$)/gi,
      /insight[:\s]+(.+?)(?:\.|$)/gi,
      /note[:\s]+(.+?)(?:\.|$)/gi,
      /remember[:\s]+(.+?)(?:\.|$)/gi
    ];
    
    for (const pattern of patterns) {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 10) {
          learnings.push(match[1].trim());
        }
      }
    }
    
    return learnings;
  }

  async getStatus(): Promise<any> {
    const context = await this.getContext();
    
    return {
      online: true,
      version: "3.0.0",
      aiEnabled: !!this.groq,
      godCommandsLoaded: context.godCommands.length,
      agentsWithLearnings: Object.keys(context.agentLearnings).length,
      sessionActive: context.currentSession?.hasActiveSession || false,
      capabilities: [
        "command-execution",
        "agent-routing",
        "context-awareness",
        "learning-integration",
        "god-command-enforcement"
      ]
    };
  }
}

export const mrBlueCommandExecutor = MrBlueCommandExecutor.getInstance();

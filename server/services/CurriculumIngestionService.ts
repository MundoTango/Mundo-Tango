/**
 * CURRICULUM INGESTION SERVICE - Microsoft Generative AI for Beginners
 * MB.MD v9.9.3 - Learning Pathways Integration
 * 
 * Integrates Microsoft's generative AI curriculum for:
 * - Structured learning paths
 * - Progressive skill building
 * - AI concept education
 * - Practical exercises
 * 
 * @see https://github.com/microsoft/generative-ai-for-beginners
 */

// import { lanceDB } from '../../lib/lancedb';  // TODO: lib/lancedb doesn't exist

// ============================================================================
// TYPES - Curriculum Definitions
// ============================================================================

export interface LearningModule {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  learningObjectives: string[];
  prerequisites: string[];
  exercises: Exercise[];
  confidence: number;
}

export interface Exercise {
  id: string;
  title: string;
  type: 'code' | 'quiz' | 'project' | 'discussion';
  description: string;
  estimatedTime: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: string[];  // Module IDs
  totalDuration: string;
  targetAudience: string;
}

export interface LearnerProgress {
  userId: string;
  pathId: string;
  completedModules: string[];
  currentModule: string;
  quizScores: Record<string, number>;
  startedAt: Date;
  lastActivityAt: Date;
}

// ============================================================================
// MICROSOFT GENERATIVE AI CURRICULUM
// ============================================================================

const CURRICULUM_MODULES: LearningModule[] = [
  {
    id: 'module-01',
    number: 1,
    title: 'Introduction to Generative AI and LLMs',
    description: 'Learn what Generative AI is and how Large Language Models (LLMs) work',
    duration: '45 min',
    difficulty: 'beginner',
    topics: ['Generative AI overview', 'LLM fundamentals', 'Transformer architecture', 'Tokenization'],
    learningObjectives: [
      'Understand what generative AI is and how it differs from traditional AI',
      'Learn the basics of how LLMs are trained',
      'Understand the transformer architecture at a high level',
      'Know the different types of generative AI models'
    ],
    prerequisites: [],
    exercises: [
      {
        id: 'ex-01-1',
        title: 'Explore different LLMs',
        type: 'project',
        description: 'Compare responses from GPT-4, Claude, and Gemini',
        estimatedTime: '20 min'
      }
    ],
    confidence: 0.95
  },
  {
    id: 'module-02',
    number: 2,
    title: 'Exploring and Comparing Different LLMs',
    description: 'Compare different LLM providers and understand their strengths',
    duration: '60 min',
    difficulty: 'beginner',
    topics: ['OpenAI models', 'Anthropic Claude', 'Google Gemini', 'Open-source models', 'Model selection'],
    learningObjectives: [
      'Compare capabilities of major LLM providers',
      'Understand model size vs performance tradeoffs',
      'Learn when to use which model',
      'Evaluate models for specific use cases'
    ],
    prerequisites: ['module-01'],
    exercises: [
      {
        id: 'ex-02-1',
        title: 'Model comparison benchmark',
        type: 'project',
        description: 'Benchmark 3 different models on the same tasks',
        estimatedTime: '30 min'
      }
    ],
    confidence: 0.93
  },
  {
    id: 'module-03',
    number: 3,
    title: 'Using Generative AI Responsibly',
    description: 'Learn about responsible AI practices and ethical considerations',
    duration: '50 min',
    difficulty: 'beginner',
    topics: ['AI ethics', 'Bias in AI', 'Responsible AI principles', 'Safety guardrails', 'Content moderation'],
    learningObjectives: [
      'Understand potential harms from generative AI',
      'Learn Microsoft\'s Responsible AI principles',
      'Implement basic safety measures',
      'Handle sensitive content appropriately'
    ],
    prerequisites: ['module-01'],
    exercises: [
      {
        id: 'ex-03-1',
        title: 'Identify AI bias',
        type: 'discussion',
        description: 'Analyze AI outputs for potential biases',
        estimatedTime: '25 min'
      }
    ],
    confidence: 0.94
  },
  {
    id: 'module-04',
    number: 4,
    title: 'Understanding Prompt Engineering Fundamentals',
    description: 'Master the basics of writing effective prompts',
    duration: '75 min',
    difficulty: 'intermediate',
    topics: ['Prompt structure', 'Zero-shot prompting', 'Few-shot learning', 'Instruction tuning', 'Context windows'],
    learningObjectives: [
      'Write clear and effective prompts',
      'Understand prompt components',
      'Use examples effectively (few-shot)',
      'Optimize prompts for different tasks'
    ],
    prerequisites: ['module-02'],
    exercises: [
      {
        id: 'ex-04-1',
        title: 'Prompt optimization challenge',
        type: 'code',
        description: 'Improve prompts to achieve better outputs',
        estimatedTime: '40 min'
      }
    ],
    confidence: 0.96
  },
  {
    id: 'module-05',
    number: 5,
    title: 'Creating Advanced Prompts',
    description: 'Learn advanced prompting techniques for complex tasks',
    duration: '90 min',
    difficulty: 'intermediate',
    topics: ['Chain-of-thought', 'Self-consistency', 'Generated knowledge', 'Prompt chaining', 'Meta-prompting'],
    learningObjectives: [
      'Apply chain-of-thought prompting',
      'Implement self-consistency techniques',
      'Chain prompts for complex workflows',
      'Handle multi-step reasoning tasks'
    ],
    prerequisites: ['module-04'],
    exercises: [
      {
        id: 'ex-05-1',
        title: 'Build a reasoning chain',
        type: 'code',
        description: 'Implement CoT for math problem solving',
        estimatedTime: '45 min'
      }
    ],
    confidence: 0.92
  },
  {
    id: 'module-06',
    number: 6,
    title: 'Building Text Generation Applications',
    description: 'Build practical applications that generate text',
    duration: '120 min',
    difficulty: 'intermediate',
    topics: ['Text generation APIs', 'Streaming responses', 'Token management', 'Output formatting', 'Error handling'],
    learningObjectives: [
      'Build text generation applications',
      'Implement streaming responses',
      'Handle rate limits and errors',
      'Format and validate outputs'
    ],
    prerequisites: ['module-05'],
    exercises: [
      {
        id: 'ex-06-1',
        title: 'Build a story generator',
        type: 'project',
        description: 'Create an interactive story generation app',
        estimatedTime: '60 min'
      }
    ],
    confidence: 0.91
  },
  {
    id: 'module-07',
    number: 7,
    title: 'Building Chat Applications',
    description: 'Create conversational AI applications',
    duration: '90 min',
    difficulty: 'intermediate',
    topics: ['Chat completions API', 'Conversation history', 'System prompts', 'User context', 'Memory management'],
    learningObjectives: [
      'Build chat-based applications',
      'Manage conversation context',
      'Design effective system prompts',
      'Handle multi-turn conversations'
    ],
    prerequisites: ['module-06'],
    exercises: [
      {
        id: 'ex-07-1',
        title: 'Build a chatbot',
        type: 'project',
        description: 'Create a customer service chatbot',
        estimatedTime: '60 min'
      }
    ],
    confidence: 0.93
  },
  {
    id: 'module-08',
    number: 8,
    title: 'Building Search Applications with Vector Databases',
    description: 'Learn to build semantic search with embeddings',
    duration: '120 min',
    difficulty: 'advanced',
    topics: ['Embeddings', 'Vector databases', 'Semantic search', 'Similarity metrics', 'Indexing strategies'],
    learningObjectives: [
      'Generate and use embeddings',
      'Set up vector databases',
      'Implement semantic search',
      'Optimize search performance'
    ],
    prerequisites: ['module-06'],
    exercises: [
      {
        id: 'ex-08-1',
        title: 'Build a semantic search engine',
        type: 'project',
        description: 'Create a document search system',
        estimatedTime: '75 min'
      }
    ],
    confidence: 0.90
  },
  {
    id: 'module-09',
    number: 9,
    title: 'Building Image Generation Applications',
    description: 'Create applications that generate images',
    duration: '90 min',
    difficulty: 'advanced',
    topics: ['DALL-E API', 'Image prompting', 'Style control', 'Image editing', 'Variations'],
    learningObjectives: [
      'Generate images with DALL-E',
      'Write effective image prompts',
      'Control image style and composition',
      'Edit and vary generated images'
    ],
    prerequisites: ['module-05'],
    exercises: [
      {
        id: 'ex-09-1',
        title: 'Build an image generator',
        type: 'project',
        description: 'Create an AI art generation app',
        estimatedTime: '60 min'
      }
    ],
    confidence: 0.89
  },
  {
    id: 'module-10',
    number: 10,
    title: 'Building Low-Code AI Applications',
    description: 'Use low-code tools to build AI applications',
    duration: '60 min',
    difficulty: 'beginner',
    topics: ['Power Platform', 'AI Builder', 'No-code AI', 'Copilot Studio', 'Integration patterns'],
    learningObjectives: [
      'Build AI apps without coding',
      'Use AI Builder models',
      'Create Copilot experiences',
      'Integrate AI into workflows'
    ],
    prerequisites: ['module-01'],
    exercises: [
      {
        id: 'ex-10-1',
        title: 'Build with AI Builder',
        type: 'project',
        description: 'Create a document processing flow',
        estimatedTime: '45 min'
      }
    ],
    confidence: 0.88
  },
  {
    id: 'module-11',
    number: 11,
    title: 'Integrating External Applications with Function Calling',
    description: 'Connect LLMs to external tools and APIs',
    duration: '120 min',
    difficulty: 'advanced',
    topics: ['Function calling', 'Tool use', 'API integration', 'Error handling', 'Security'],
    learningObjectives: [
      'Implement function calling',
      'Define tool schemas',
      'Handle tool execution',
      'Secure external integrations'
    ],
    prerequisites: ['module-07'],
    exercises: [
      {
        id: 'ex-11-1',
        title: 'Build a tool-using agent',
        type: 'project',
        description: 'Create an agent that uses external APIs',
        estimatedTime: '75 min'
      }
    ],
    confidence: 0.91
  },
  {
    id: 'module-12',
    number: 12,
    title: 'Designing UX for AI Applications',
    description: 'Learn to design user experiences for AI products',
    duration: '75 min',
    difficulty: 'intermediate',
    topics: ['AI UX patterns', 'Loading states', 'Error handling', 'Feedback loops', 'Trust and transparency'],
    learningObjectives: [
      'Design AI-first user experiences',
      'Handle uncertainty in UI',
      'Build trust with users',
      'Collect and use feedback'
    ],
    prerequisites: ['module-06', 'module-07'],
    exercises: [
      {
        id: 'ex-12-1',
        title: 'UX audit',
        type: 'project',
        description: 'Improve the UX of an AI application',
        estimatedTime: '45 min'
      }
    ],
    confidence: 0.87
  }
];

const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-fundamentals',
    name: 'AI Fundamentals',
    description: 'Start your generative AI journey with core concepts',
    modules: ['module-01', 'module-02', 'module-03', 'module-04'],
    totalDuration: '4 hours',
    targetAudience: 'Beginners with no AI experience'
  },
  {
    id: 'path-developer',
    name: 'AI Developer',
    description: 'Build production-ready AI applications',
    modules: ['module-04', 'module-05', 'module-06', 'module-07', 'module-11'],
    totalDuration: '8 hours',
    targetAudience: 'Developers looking to add AI to their stack'
  },
  {
    id: 'path-advanced',
    name: 'Advanced AI Engineering',
    description: 'Master advanced AI techniques and architectures',
    modules: ['module-05', 'module-08', 'module-09', 'module-11'],
    totalDuration: '7 hours',
    targetAudience: 'Experienced developers ready for advanced topics'
  },
  {
    id: 'path-product',
    name: 'AI Product Design',
    description: 'Design and build AI products users love',
    modules: ['module-03', 'module-10', 'module-12'],
    totalDuration: '3 hours',
    targetAudience: 'Product managers and designers'
  }
];

// ============================================================================
// CURRICULUM INGESTION SERVICE CLASS
// ============================================================================

export class CurriculumIngestionService {
  private modules: Map<string, LearningModule> = new Map();
  private paths: Map<string, LearningPath> = new Map();
  private initialized = false;

  constructor() {
    CURRICULUM_MODULES.forEach(m => this.modules.set(m.id, m));
    LEARNING_PATHS.forEach(p => this.paths.set(p.id, p));
  }

  /**
   * Initialize service and store curriculum in LanceDB
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[Curriculum] Initializing learning pathways knowledge base...');

    try {
      // Store each module in LanceDB for semantic retrieval
      for (const module of CURRICULUM_MODULES) {
        await lanceDB.addMemory(
          `curriculum-${module.id}`,
          `Module ${module.number}: ${module.title}\n` +
          `Description: ${module.description}\n` +
          `Difficulty: ${module.difficulty}\n` +
          `Duration: ${module.duration}\n` +
          `Topics: ${module.topics.join(', ')}\n` +
          `Learning Objectives:\n${module.learningObjectives.map(o => `- ${o}`).join('\n')}`
        );
      }

      // Store learning paths
      for (const path of LEARNING_PATHS) {
        await lanceDB.addMemory(
          `learning-path-${path.id}`,
          `Learning Path: ${path.name}\n` +
          `Description: ${path.description}\n` +
          `Duration: ${path.totalDuration}\n` +
          `Target Audience: ${path.targetAudience}\n` +
          `Modules: ${path.modules.length} modules`
        );
      }

      this.initialized = true;
      console.log(`[Curriculum] ✅ Loaded ${CURRICULUM_MODULES.length} modules and ${LEARNING_PATHS.length} paths`);
    } catch (error) {
      console.error('[Curriculum] Failed to initialize:', error);
    }
  }

  /**
   * Get all learning modules
   */
  getAllModules(): LearningModule[] {
    return Array.from(this.modules.values()).sort((a, b) => a.number - b.number);
  }

  /**
   * Get all learning paths
   */
  getAllPaths(): LearningPath[] {
    return Array.from(this.paths.values());
  }

  /**
   * Get a specific module
   */
  getModule(id: string): LearningModule | undefined {
    return this.modules.get(id);
  }

  /**
   * Get a specific path
   */
  getPath(id: string): LearningPath | undefined {
    return this.paths.get(id);
  }

  /**
   * Get modules by difficulty
   */
  getModulesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): LearningModule[] {
    return this.getAllModules().filter(m => m.difficulty === difficulty);
  }

  /**
   * Search modules using semantic similarity
   */
  async searchModules(query: string, limit: number = 5): Promise<LearningModule[]> {
    try {
      const results = await lanceDB.searchMemories(query, limit);
      
      const moduleIds = results
        .filter(r => r.id.startsWith('curriculum-'))
        .map(r => r.id.replace('curriculum-', ''));

      return moduleIds
        .map(id => this.modules.get(id))
        .filter((m): m is LearningModule => m !== undefined);
    } catch (error) {
      console.error('[Curriculum] Search failed:', error);
      return [];
    }
  }

  /**
   * Recommend a learning path based on user query
   */
  async recommendPath(userQuery: string): Promise<LearningPath | null> {
    try {
      const results = await lanceDB.searchMemories(userQuery, 3);
      
      const pathIds = results
        .filter(r => r.id.startsWith('learning-path-'))
        .map(r => r.id.replace('learning-path-', ''));

      if (pathIds.length === 0) return null;
      
      return this.paths.get(pathIds[0]) || null;
    } catch (error) {
      console.error('[Curriculum] Path recommendation failed:', error);
      return null;
    }
  }

  /**
   * Get next module in a learning path
   */
  getNextModule(pathId: string, completedModules: string[]): LearningModule | null {
    const path = this.paths.get(pathId);
    if (!path) return null;

    const nextModuleId = path.modules.find(id => !completedModules.includes(id));
    if (!nextModuleId) return null;

    return this.modules.get(nextModuleId) || null;
  }

  /**
   * Get path progress
   */
  getPathProgress(pathId: string, completedModules: string[]): {
    completed: number;
    total: number;
    percentage: number;
  } {
    const path = this.paths.get(pathId);
    if (!path) return { completed: 0, total: 0, percentage: 0 };

    const completed = path.modules.filter(id => completedModules.includes(id)).length;
    const total = path.modules.length;

    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  }

  /**
   * Get curriculum statistics
   */
  getStatistics(): {
    totalModules: number;
    totalPaths: number;
    byDifficulty: Record<string, number>;
    totalExercises: number;
    averageConfidence: number;
  } {
    const modules = this.getAllModules();
    const byDifficulty: Record<string, number> = {};
    let totalExercises = 0;
    
    modules.forEach(m => {
      byDifficulty[m.difficulty] = (byDifficulty[m.difficulty] || 0) + 1;
      totalExercises += m.exercises.length;
    });

    const averageConfidence = modules.reduce((sum, m) => sum + m.confidence, 0) / modules.length;

    return {
      totalModules: modules.length,
      totalPaths: this.paths.size,
      byDifficulty,
      totalExercises,
      averageConfidence
    };
  }
}

// Singleton instance
export const curriculumIngestionService = new CurriculumIngestionService();

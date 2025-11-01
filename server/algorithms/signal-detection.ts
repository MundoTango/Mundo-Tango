/**
 * SIGNAL DETECTION ALGORITHM
 * Matches volunteer skills to ESA agent tasks
 * Part of Talent Match AI system
 */

export interface SkillSignal {
  signal: string;
  confidence: number;
  matchedKeywords: string[];
}

export interface TaskMatch {
  taskId: number;
  matchScore: number;
  matchedSignals: string[];
  requiredSkills: string[];
  volunteerSkills: string[];
}

/**
 * Detect skill signals from resume text and skills
 */
export function detectSkillSignals(
  resumeText: string,
  extractedSkills: string[]
): SkillSignal[] {
  const signals: Map<string, SkillSignal> = new Map();
  
  const signalPatterns = {
    backend: {
      keywords: ["backend", "server", "api", "database", "node.js", "express", "django", "flask", "spring", "sql", "mongodb", "postgresql", "redis"],
      weight: 1.0,
    },
    frontend: {
      keywords: ["frontend", "react", "vue", "angular", "javascript", "typescript", "css", "html", "tailwind", "bootstrap", "ui", "ux"],
      weight: 1.0,
    },
    security: {
      keywords: ["security", "encryption", "authentication", "authorization", "oauth", "jwt", "penetration", "cybersecurity", "firewall"],
      weight: 1.2,
    },
    devops: {
      keywords: ["devops", "ci/cd", "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "jenkins", "github actions"],
      weight: 1.1,
    },
    "ml-ai": {
      keywords: ["machine learning", "ai", "artificial intelligence", "tensorflow", "pytorch", "nlp", "computer vision", "deep learning"],
      weight: 1.3,
    },
    design: {
      keywords: ["design", "figma", "sketch", "photoshop", "illustrator", "ui/ux", "graphic design", "wireframe"],
      weight: 1.0,
    },
    marketing: {
      keywords: ["marketing", "seo", "content", "social media", "analytics", "growth", "campaign", "copywriting"],
      weight: 1.0,
    },
    "project-management": {
      keywords: ["project manager", "product manager", "agile", "scrum", "jira", "roadmap", "sprint"],
      weight: 1.0,
    },
  };
  
  const lowerText = resumeText.toLowerCase();
  
  for (const [signalName, config] of Object.entries(signalPatterns)) {
    const matchedKeywords: string[] = [];
    let matchCount = 0;
    
    for (const keyword of config.keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      if (lowerText.includes(lowerKeyword) || extractedSkills.some(s => s.toLowerCase().includes(lowerKeyword))) {
        matchedKeywords.push(keyword);
        matchCount++;
      }
    }
    
    if (matchCount > 0) {
      const confidence = Math.min(
        (matchCount / config.keywords.length) * config.weight,
        1.0
      );
      
      signals.set(signalName, {
        signal: signalName,
        confidence,
        matchedKeywords,
      });
    }
  }
  
  return Array.from(signals.values()).sort((a, b) => b.confidence - a.confidence);
}

/**
 * Match volunteer to tasks based on detected signals
 */
export function matchVolunteerToTasks(
  volunteerSkills: string[],
  detectedSignals: SkillSignal[],
  availableTasks: any[]
): TaskMatch[] {
  const matches: TaskMatch[] = [];
  
  for (const task of availableTasks) {
    const requiredSkills = task.requiredSkills || [];
    const taskDomain = task.domain?.toLowerCase();
    
    let matchScore = 0;
    const matchedSignals: string[] = [];
    
    for (const signal of detectedSignals) {
      if (requiredSkills.some((rs: string) => 
        signal.matchedKeywords.some(kw => rs.toLowerCase().includes(kw.toLowerCase()))
      )) {
        matchScore += signal.confidence * 100;
        matchedSignals.push(signal.signal);
      }
      
      if (taskDomain && signal.signal === taskDomain) {
        matchScore += 50;
        matchedSignals.push(signal.signal);
      }
    }
    
    const skillOverlap = requiredSkills.filter((rs: string) =>
      volunteerSkills.some(vs => vs.toLowerCase().includes(rs.toLowerCase()))
    ).length;
    
    matchScore += (skillOverlap / Math.max(requiredSkills.length, 1)) * 100;
    
    if (matchScore > 20) {
      matches.push({
        taskId: task.id,
        matchScore: Math.min(matchScore, 100),
        matchedSignals: [...new Set(matchedSignals)],
        requiredSkills,
        volunteerSkills,
      });
    }
  }
  
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Generate AI Clarifier interview questions
 */
export function generateClarifierQuestions(
  signals: SkillSignal[],
  existingChat: any[]
): string[] {
  const questions: string[] = [];
  
  const askedTopics = new Set(
    existingChat
      .filter(msg => msg.role === "assistant")
      .map(msg => msg.topic || "")
  );
  
  for (const signal of signals.slice(0, 3)) {
    if (askedTopics.has(signal.signal)) continue;
    
    const questionTemplates = {
      backend: [
        "I see you have backend experience. What's your favorite tech stack for building APIs?",
        "Can you describe a complex backend system you've architected?",
        "What databases have you worked with most extensively?",
      ],
      frontend: [
        "What frontend frameworks are you most comfortable with?",
        "Describe a challenging UI/UX problem you've solved.",
        "How do you approach responsive design and accessibility?",
      ],
      security: [
        "What security best practices do you always implement?",
        "Have you conducted security audits or penetration testing?",
        "How do you stay updated on cybersecurity threats?",
      ],
      devops: [
        "What's your experience with containerization and orchestration?",
        "Describe your ideal CI/CD pipeline setup.",
        "Which cloud platform do you prefer and why?",
      ],
      "ml-ai": [
        "What machine learning projects have you worked on?",
        "Which ML frameworks are you most familiar with?",
        "How do you approach model training and optimization?",
      ],
      design: [
        "Walk me through your design process from concept to delivery.",
        "What design tools do you use daily?",
        "How do you balance aesthetics with usability?",
      ],
      marketing: [
        "What marketing channels have you had the most success with?",
        "How do you measure campaign effectiveness?",
        "Describe a growth hack that worked really well for you.",
      ],
      "project-management": [
        "How do you prioritize competing tasks and deadlines?",
        "What project management methodology do you prefer?",
        "How do you handle scope creep and stakeholder management?",
      ],
    };
    
    const templates = questionTemplates[signal.signal as keyof typeof questionTemplates];
    if (templates) {
      const randomQ = templates[Math.floor(Math.random() * templates.length)];
      questions.push(randomQ);
    }
  }
  
  return questions;
}

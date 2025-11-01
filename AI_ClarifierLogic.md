# AI Clarifier Logic
## Talent Match Resume Interview System

### Overview
The AI Clarifier is an intelligent interview system that analyzes volunteer resumes/profiles and conducts a conversational interview to detect skills, match them to ESA agents, and recommend specific tasks.

---

## Signal Detection Algorithm

### 1. Resume Parsing
**Input**: Resume text, LinkedIn URL, GitHub URL, portfolio URL

**Extraction Process**:
```typescript
interface ParsedSignals {
  skills: string[];           // Technical skills (React, Python, Figma, etc.)
  experience: string[];        // Years of experience per domain
  projects: string[];          // Past projects/accomplishments
  domains: string[];           // General domains (frontend, backend, design, etc.)
  keywords: string[];          // Important keywords from resume
}
```

**Detection Rules**:
- **Frontend**: React, Vue, Angular, TypeScript, JavaScript, CSS, Tailwind
- **Backend**: Node.js, Python, PostgreSQL, API, Express, Django
- **Design**: Figma, Sketch, UI/UX, Adobe XD, Photoshop, Illustrator
- **Marketing**: SEO, Content, Social Media, Analytics, Google Ads
- **Data**: SQL, PostgreSQL, MongoDB, Data Analysis, Excel

---

## 2. Clarifier Interview Flow

### Stage 1: Welcome & Context Setting
**Clarifier**: 
> "Hi! I'm the Mundo Tango AI Clarifier. I've reviewed your background, and I'm excited to help match you with volunteer opportunities that fit your skills. This will take about 5 minutes. Ready?"

**User Response**: Yes/No

---

### Stage 2: Skill Confirmation
**Clarifier**: 
> "I see you have experience with [DETECTED_SKILLS]. Can you tell me which of these you're most confident in and enjoy working with?"

**User Response**: Free text

**Signal Update**: Boost confidence scores for mentioned skills

---

### Stage 3: Time Availability
**Clarifier**: 
> "How many hours per week can you commit to volunteering? (2-4 hours, 5-8 hours, 9+ hours)"

**User Response**: Selection or free text

**Signal Update**: Store `hoursPerWeek` for task filtering

---

### Stage 4: Interest Areas
**Clarifier**: 
> "What interests you most about Mundo Tango? (Building features, designing UI, growing community, creating content, other)"

**User Response**: Selection or free text

**Signal Update**: Map interests to ESA agent categories:
- Building features → Page/Algorithm agents
- Designing UI → Design agents
- Growing community → Marketing agents
- Creating content → Content agents

---

### Stage 5: Specific Preferences
**Clarifier**: 
> "Are there any specific types of tasks you'd like to avoid? Or any particular projects you're excited about?"

**User Response**: Free text

**Signal Update**: Store preferences and exclusions

---

### Stage 6: Signal Summary & Confirmation
**Clarifier**: 
> "Perfect! Based on our conversation, I've detected:
> - **Skills**: [LIST]
> - **Domains**: [LIST]
> - **Time**: [HOURS/WEEK]
> - **Interests**: [LIST]
> 
> Does this sound accurate?"

**User Response**: Yes/Adjust

---

## 3. Task Matching Algorithm

### Matching Logic
```typescript
function matchTasksToVolunteer(signals: ParsedSignals, tasks: Task[]): TaskMatch[] {
  return tasks
    .map(task => ({
      task,
      score: calculateMatchScore(signals, task),
      reason: generateMatchReason(signals, task)
    }))
    .filter(match => match.score > 0.6) // 60% threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 recommendations
}

function calculateMatchScore(signals: ParsedSignals, task: Task): number {
  let score = 0;
  
  // Skill match (50% weight)
  const skillOverlap = intersection(signals.skills, task.requiredSkills);
  score += (skillOverlap.length / task.requiredSkills.length) * 0.5;
  
  // Domain match (30% weight)
  if (signals.domains.includes(task.domain)) {
    score += 0.3;
  }
  
  // Time availability (20% weight)
  if (signals.hoursPerWeek >= task.estimatedHours) {
    score += 0.2;
  }
  
  return score;
}
```

---

## 4. Task Recommendation Output

### Format
```json
{
  "volunteerId": 123,
  "recommendations": [
    {
      "taskId": 456,
      "title": "Build Event Calendar Component",
      "domain": "Frontend Development",
      "estimatedHours": 8,
      "requiredSkills": ["React", "TypeScript", "Tailwind CSS"],
      "matchScore": 0.92,
      "matchReason": "Your React and TypeScript experience aligns perfectly with this task. Your portfolio shows similar calendar implementations.",
      "agentId": "P30",
      "status": "open"
    }
  ],
  "conversationLog": [
    {
      "role": "clarifier",
      "message": "Hi! I'm the Mundo Tango AI Clarifier...",
      "timestamp": "2025-11-01T10:00:00Z"
    },
    {
      "role": "user",
      "message": "Yes, I'm ready!",
      "timestamp": "2025-11-01T10:00:15Z"
    }
  ],
  "detectedSignals": {
    "skills": ["React", "TypeScript", "Node.js", "PostgreSQL"],
    "domains": ["Frontend", "Backend"],
    "hoursPerWeek": 8,
    "interests": ["Building features", "Learning new tech"]
  }
}
```

---

## 5. Guardrails & Best Practices

### Tone Guidelines
- **Friendly but professional**: Use conversational language, avoid jargon
- **Encouraging**: Highlight strengths, frame limitations positively
- **Clear & concise**: Keep questions short, avoid overwhelming the user

### Edge Cases
1. **Insufficient signals**: Ask clarifying questions to gather more data
2. **Overqualified**: Suggest advanced tasks or leadership opportunities
3. **No matching tasks**: Suggest creating custom opportunities or checking back later
4. **Unrealistic time commitment**: Gently suggest more realistic expectations

### Privacy & Security
- Never store personally identifiable information without consent
- Resume text is parsed and discarded after signal extraction
- Only skills, domains, and preferences are retained

---

## 6. Integration Points

### API Endpoints
- `POST /api/v1/volunteers/clarifier/session` - Start new interview
- `POST /api/v1/volunteers/clarifier/message` - Send user message
- `POST /api/v1/volunteers/match/suggest` - Get task recommendations

### Database Tables
- `volunteers` - Volunteer profiles
- `clarifier_sessions` - Interview logs
- `tasks` - Available tasks
- `assignments` - Volunteer-task assignments

---

## 7. Future Enhancements
- Multi-language support (Spanish, German, Russian)
- Voice-based interviews
- Video resume parsing
- GitHub contribution analysis
- Real-time task availability updates
- Volunteer skill progression tracking

---

**Version**: 1.0.0  
**Last Updated**: November 1, 2025  
**Maintained by**: ESA Framework Team

# PRD: Enhanced Talent Match AI
**Version:** 2.0  
**Created:** November 17, 2025  
**Enhancement:** Juicebox.ai Natural Language Search & AI Outreach  
**Status:** Implementation Ready

---

## 1. EXECUTIVE SUMMARY

### 1.1 Vision
Transform existing Talent Match AI from basic compatibility scoring into an enterprise-grade talent sourcing platform by integrating Juicebox.ai (PeopleGPT) features: natural language search, AI-powered outreach, multi-step follow-ups, and ATS integration.

### 1.2 Current State
**Existing:** `client/src/pages/TalentMatchPage.tsx`
- User compatibility scoring
- Dance level assessment
- Location-based matching
- Preference learning

### 1.3 The Gap
Recruiting tango teachers/dancers requires:
- Juicebox.ai for talent sourcing ($49-199/mo)
- Manual outreach via email/LinkedIn
- Separate ATS for candidate tracking
- **Total external cost:** $50-200/month + manual effort

### 1.4 The Solution
Enhance Talent Match AI with:
- **Natural Language Search** ("Find tango teachers in Buenos Aires with 10+ years experience")
- **800M+ Profile Access** (integrate tango community databases)
- **AI-Powered Outreach** (personalized emails, 3x reply rate)
- **Multi-Step Follow-Ups** (automated sequences)
- **ATS Integration** (candidate pipeline tracking)

**Benefits:**
- ✅ No Boolean operators needed (natural language)
- ✅ 3x higher reply rate vs. generic emails
- ✅ Automated follow-up sequences
- ✅ All-in-one recruiting platform

---

## 2. FEATURE SPECIFICATIONS

### 2.1 Natural Language Talent Search

**User Story:** As an event organizer, I want to find "experienced tango teachers in San Francisco who teach Milonga style" without complex filters.

**Feature:**
- Natural language input (no Boolean AND/OR/NOT)
- AI-powered query understanding via Context Service
- Semantic search over user profiles (LanceDB integration)
- Smart filters extracted from query:
  - Location: "San Francisco" → radius search
  - Experience: "experienced" → 5+ years
  - Specialty: "Milonga style" → profile tag matching
- Results ranked by relevance + compatibility score

**Technical Implementation:**
```typescript
// server/services/ai/NaturalLanguageTalentSearch.ts
export class NaturalLanguageTalentSearch {
  async search(params: {
    query: string;
    userId: number;
    limit?: number;
  }): Promise<TalentSearchResult[]> {
    // 1. Parse query using AI to extract criteria
    const arbitrageEngine = new ArbitrageEngine();
    const parsedQuery = await arbitrageEngine.execute({
      task: 'parse_talent_query',
      complexity: 'medium', // Tier-2
      params: {
        query: params.query
      }
    });
    
    // Extract: { location, experience, skills, styles, availability }
    const { location, experience, skills, styles, availability } = parsedQuery;
    
    // 2. Semantic search via LanceDB
    const contextService = new ContextService();
    const semanticMatches = await contextService.searchProfiles({
      query: params.query,
      filters: {
        location,
        experienceYears: experience ? { min: parseInt(experience) } : undefined,
        skills,
        styles
      },
      limit: params.limit || 20
    });
    
    // 3. Score by compatibility with requesting user
    const talentMatchService = new TalentMatchService();
    const rankedResults = await Promise.all(
      semanticMatches.map(async (profile) => {
        const compatibilityScore = await talentMatchService.calculateCompatibility(
          params.userId,
          profile.userId
        );
        
        return {
          ...profile,
          compatibilityScore,
          matchReasons: this.explainMatch(profile, parsedQuery)
        };
      })
    );
    
    // 4. Sort by combined score (semantic similarity + compatibility)
    return rankedResults
      .sort((a, b) => (b.semanticScore * 0.6 + b.compatibilityScore * 0.4) - 
                      (a.semanticScore * 0.6 + a.compatibilityScore * 0.4));
  }
  
  private explainMatch(profile: Profile, query: ParsedQuery): string[] {
    const reasons = [];
    
    if (query.location && profile.city === query.location) {
      reasons.push(`📍 Based in ${query.location}`);
    }
    
    if (query.experience && profile.experienceYears >= parseInt(query.experience)) {
      reasons.push(`🎓 ${profile.experienceYears} years of experience`);
    }
    
    if (query.styles && profile.specialties.some(s => query.styles.includes(s))) {
      reasons.push(`💃 Teaches ${profile.specialties.join(', ')}`);
    }
    
    return reasons;
  }
}
```

**UI Components:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>🔍 Natural Language Talent Search</CardTitle>
    <CardDescription>
      Describe who you're looking for in plain English
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <Textarea
        placeholder="Example: Find experienced tango teachers in Buenos Aires who specialize in Milonga and are available for weekend workshops"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        rows={3}
        data-testid="input-talent-search-query"
      />
      
      <Button onClick={handleSearch} disabled={isSearching} className="w-full">
        {isSearching ? 'Searching...' : 'Search Talent'}
      </Button>
      
      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4 mt-6">
          <h4 className="font-semibold">{results.length} talents found</h4>
          {results.map(result => (
            <Card key={result.userId} className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={result.avatar} />
                    <AvatarFallback>{result.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold">{result.name}</h5>
                      <Badge variant="outline">
                        {Math.round(result.compatibilityScore * 100)}% Match
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.bio}
                    </p>
                    
                    {/* Match Reasons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.matchReasons.map((reason, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => viewProfile(result.userId)}>
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startOutreach(result)}>
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

---

### 2.2 AI-Powered Personalized Outreach

**User Story:** As a recruiter, I want AI to write personalized emails that get 3x more replies.

**Feature:**
- Auto-generate personalized emails based on:
  - Candidate profile (experience, specialties, achievements)
  - Job/opportunity details
  - Tone preference (formal, casual, enthusiastic)
- AI analyzes profile to find connection points
- Email templates with variables: `{{name}}`, `{{specialty}}`, `{{achievement}}`
- A/B testing (track open rates, reply rates)
- Multi-channel: Email, LinkedIn, Facebook Messenger (if connected)

**Technical Implementation:**
```typescript
// server/services/ai/AIOutreachGenerator.ts
export class AIOutreachGenerator {
  async generateOutreach(params: {
    candidateId: number;
    opportunityDescription: string;
    tone: 'formal' | 'casual' | 'enthusiastic';
    channel: 'email' | 'linkedin' | 'messenger';
  }): Promise<OutreachMessage> {
    // 1. Fetch candidate profile
    const candidate = await db.query.users.findFirst({
      where: eq(users.id, params.candidateId),
      with: { profile: true }
    });
    
    // 2. Generate personalized message via AI Arbitrage
    const arbitrageEngine = new ArbitrageEngine();
    const message = await arbitrageEngine.execute({
      task: 'generate_personalized_outreach',
      complexity: 'high', // Tier-3 for quality
      params: {
        candidateName: candidate.fullName,
        candidateBio: candidate.profile.bio,
        candidateExperience: candidate.profile.experienceYears,
        candidateSpecialties: candidate.profile.specialties,
        candidateAchievements: candidate.profile.achievements,
        opportunityDescription: params.opportunityDescription,
        tone: params.tone
      }
    });
    
    return {
      subject: message.subject,
      body: message.body,
      channel: params.channel,
      variables: {
        name: candidate.fullName,
        specialty: candidate.profile.specialties[0],
        achievement: candidate.profile.achievements[0]
      }
    };
  }
}
```

**Sample Generated Email:**
```
Subject: Opportunity to teach Milonga at SF Tango Festival 🎵

Hi Sofia,

I came across your profile and was impressed by your 12 years of tango experience and your specialty in Milonga style. Your achievement of "Won 2023 Buenos Aires Tango Championship" really stood out!

We're organizing the San Francisco Tango Festival (July 15-17, 2026) and are looking for experienced instructors to lead workshops. Your expertise in Milonga would be a perfect fit for our advanced track.

Would you be interested in a 15-minute call to discuss this opportunity?

Best regards,
Carlos
```

**UI Components:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>✉️ AI Outreach Generator</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <Textarea
        placeholder="Describe the opportunity (e.g., 'Teaching Milonga workshop at SF Tango Festival, July 15-17')"
        value={opportunityDescription}
        onChange={(e) => setOpportunityDescription(e.target.value)}
        rows={3}
      />
      
      <Select value={tone} onValueChange={setTone}>
        <SelectTrigger>
          <SelectValue placeholder="Select tone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="formal">Formal</SelectItem>
          <SelectItem value="casual">Casual</SelectItem>
          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
        </SelectContent>
      </Select>
      
      <Button onClick={generateMessage} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Personalized Message'}
      </Button>
      
      {generatedMessage && (
        <div className="mt-4 p-4 border rounded-lg bg-muted">
          <h5 className="font-semibold mb-2">Subject:</h5>
          <Input value={generatedMessage.subject} readOnly />
          
          <h5 className="font-semibold mt-4 mb-2">Message:</h5>
          <Textarea value={generatedMessage.body} rows={8} />
          
          <div className="flex gap-2 mt-4">
            <Button onClick={() => sendMessage(generatedMessage)}>
              Send Now
            </Button>
            <Button variant="outline" onClick={regenerateMessage}>
              Regenerate
            </Button>
            <Button variant="ghost" onClick={() => saveTemplate(generatedMessage)}>
              Save as Template
            </Button>
          </div>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

---

### 2.3 Multi-Step Follow-Up Sequences

**User Story:** As a busy recruiter, I want automated follow-ups if candidates don't reply.

**Feature:**
- Create follow-up sequences (3-5 steps)
- Time delays: 3 days, 7 days, 14 days
- Conditional logic: "If no reply after 7 days, send follow-up 2"
- Auto-stop if candidate replies
- Track open rates, reply rates per step
- Templates: "Gentle Reminder", "Final Attempt", "Check-In"

**Database Schema:**
```typescript
export const outreachSequences = pgTable('outreach_sequences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  candidateId: integer('candidate_id').references(() => users.id).notNull(),
  opportunityDescription: text('opportunity_description').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'active', 'paused', 'completed', 'replied'
  currentStep: integer('current_step').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const outreachSteps = pgTable('outreach_steps', {
  id: serial('id').primaryKey(),
  sequenceId: integer('sequence_id').references(() => outreachSequences.id).notNull(),
  stepNumber: integer('step_number').notNull(),
  delayDays: integer('delay_days').notNull(),
  subject: varchar('subject', { length: 200 }).notNull(),
  body: text('body').notNull(),
  channel: varchar('channel', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'pending', 'sent', 'opened', 'replied'
  sentAt: timestamp('sent_at'),
  openedAt: timestamp('opened_at'),
  repliedAt: timestamp('replied_at')
});
```

**BullMQ Worker for Auto Follow-Ups:**
```typescript
// server/workers/outreachFollowUpWorker.ts
export async function processFollowUpSequences() {
  // Find sequences due for next step
  const dueSequences = await db.select()
    .from(outreachSequences)
    .where(eq(outreachSequences.status, 'active'));
  
  for (const sequence of dueSequences) {
    const nextStep = await db.query.outreachSteps.findFirst({
      where: and(
        eq(outreachSteps.sequenceId, sequence.id),
        eq(outreachSteps.stepNumber, sequence.currentStep),
        eq(outreachSteps.status, 'pending')
      )
    });
    
    if (!nextStep) continue;
    
    // Check if delay period has passed
    const lastStepSentAt = await getLastStepSentAt(sequence.id);
    const daysSinceLastStep = differenceInDays(new Date(), lastStepSentAt);
    
    if (daysSinceLastStep >= nextStep.delayDays) {
      // Send follow-up
      await sendOutreachMessage({
        candidateId: sequence.candidateId,
        subject: nextStep.subject,
        body: nextStep.body,
        channel: nextStep.channel
      });
      
      // Update step status
      await db.update(outreachSteps)
        .set({ status: 'sent', sentAt: new Date() })
        .where(eq(outreachSteps.id, nextStep.id));
      
      // Advance sequence
      await db.update(outreachSequences)
        .set({ currentStep: sequence.currentStep + 1 })
        .where(eq(outreachSequences.id, sequence.id));
    }
  }
}

// Schedule: Run daily at 9am
outreachQueue.add('process-follow-ups', {}, { repeat: { cron: '0 9 * * *' } });
```

---

### 2.4 ATS Integration (Candidate Pipeline Tracking)

**User Story:** As a hiring manager, I want to track candidates through stages: Contacted → Responded → Interviewed → Offered → Hired.

**Feature:**
- Kanban board view (5 stages)
- Drag-and-drop candidates between stages
- Timeline: All interactions with candidate (emails sent, replies, calls, notes)
- Candidate profile viewer
- Bulk actions: Move multiple to next stage, send batch emails
- Filters: By role, location, experience, source

**Database Schema:**
```typescript
export const candidatePipelines = pgTable('candidate_pipelines', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(), // Recruiter
  candidateId: integer('candidate_id').references(() => users.id).notNull(),
  opportunityId: integer('opportunity_id').references(() => opportunities.id),
  stage: varchar('stage', { length: 20 }).notNull(), // 'contacted', 'responded', 'interviewed', 'offered', 'hired', 'rejected'
  source: varchar('source', { length: 50 }), // 'search', 'referral', 'event'
  notes: text('notes'),
  rating: integer('rating'), // 1-5 stars
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const opportunities = pgTable('opportunities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 100 }),
  compensation: varchar('compensation', { length: 100 }),
  startDate: timestamp('start_date'),
  status: varchar('status', { length: 20 }).notNull(), // 'open', 'filled', 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```

**UI - Kanban Board:**
```tsx
<div className="grid grid-cols-5 gap-4">
  {['contacted', 'responded', 'interviewed', 'offered', 'hired'].map(stage => (
    <Card key={stage}>
      <CardHeader>
        <CardTitle className="text-sm">
          {stage.charAt(0).toUpperCase() + stage.slice(1)}
          <Badge variant="secondary" className="ml-2">
            {candidates.filter(c => c.stage === stage).length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Droppable droppableId={stage}>
          {candidates.filter(c => c.stage === stage).map(candidate => (
            <Draggable key={candidate.id} draggableId={candidate.id.toString()} index={candidate.id}>
              <Card className="mb-2 hover-elevate cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={candidate.avatar} />
                      <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{candidate.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Draggable>
          ))}
        </Droppable>
      </CardContent>
    </Card>
  ))}
</div>
```

---

## 3. SUCCESS METRICS

### 3.1 User Adoption
- Natural language search usage: Target >60% of Talent Match users
- AI outreach generation: Target >40% use AI-generated messages
- Follow-up sequences: Target >30% create automated sequences

### 3.2 Recruiting Effectiveness
- Reply rate increase: Target 3x vs. generic emails (15% → 45%)
- Time-to-hire reduction: Target -30%
- Candidate pipeline conversion: Target >25% contacted → hired

---

## 4. IMPLEMENTATION TIMELINE

**Week 12 Day 1-2:**
- Database schema migration (4 new tables)
- NaturalLanguageTalentSearch.ts service
- AIOutreachGenerator.ts service
- Follow-up sequence BullMQ worker
- API routes (12 endpoints)

**Week 12 Day 3:**
- Enhanced TalentMatchPage.tsx UI
- Kanban board component
- Outreach generator UI
- Follow-up sequence builder

**Testing:** E2E flows for search, outreach, follow-ups, pipeline management

---

**END OF PRD**

**Total Pages:** 14  
**Estimated Implementation:** 3 days (Week 12)  
**Expected Impact:** 3x reply rate, -30% time-to-hire

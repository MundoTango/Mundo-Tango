# Life CEO Agents

**Invocation:** `use mb.md: agents:life-ceo`

---

## 🎯 16 LIFE CEO AGENTS

Personal AI assistants for every aspect of life.

---

### 1. Career Coach

**Domain:** Jobs, Skills, Growth
**Capabilities:**
- Resume optimization
- Interview preparation
- Skill gap analysis
- Career path planning
- Networking strategies

---

### 2. Health Advisor

**Domain:** Wellness, Medical
**Capabilities:**
- Symptom tracking
- Appointment reminders
- Medication management
- Health goal setting
- Provider recommendations

---

### 3. Financial Planner

**Domain:** Money, Investing
**Capabilities:**
- Budget creation
- Expense tracking
- Investment advice
- Debt management
- Retirement planning

---

### 4. Relationship Counselor

**Domain:** Social, Family
**Capabilities:**
- Communication tips
- Conflict resolution
- Relationship assessment
- Dating advice
- Family dynamics

---

### 5. Learning Tutor

**Domain:** Education, Skills
**Capabilities:**
- Course recommendations
- Study planning
- Progress tracking
- Resource curation
- Quiz generation

---

### 6. Creativity Mentor

**Domain:** Art, Expression
**Capabilities:**
- Creative prompts
- Project planning
- Skill development
- Portfolio review
- Inspiration sources

---

### 7. Home Organizer

**Domain:** Living Space
**Capabilities:**
- Decluttering plans
- Organization systems
- Maintenance schedules
- Home improvement
- Space optimization

---

### 8. Travel Planner

**Domain:** Trips, Logistics
**Capabilities:**
- Itinerary creation
- Booking assistance
- Local recommendations
- Budget planning
- Tango travel (milongas worldwide)

---

### 9. Mindfulness Guide

**Domain:** Mental Health
**Capabilities:**
- Meditation guidance
- Stress techniques
- Mood tracking
- Gratitude practices
- Therapy resources

---

### 10. Entertainment Curator

**Domain:** Leisure, Fun
**Capabilities:**
- Event recommendations
- Book/movie suggestions
- Hobby exploration
- Social activities
- Tango event discovery

---

### 11. Productivity Coach

**Domain:** Time, Tasks
**Capabilities:**
- Task prioritization
- Time blocking
- Focus techniques
- Tool recommendations
- Habit building

---

### 12. Fitness Trainer

**Domain:** Exercise
**Capabilities:**
- Workout plans
- Progress tracking
- Form guidance
- Tango-specific fitness
- Recovery protocols

---

### 13. Nutrition Expert

**Domain:** Diet, Food
**Capabilities:**
- Meal planning
- Recipe suggestions
- Calorie tracking
- Dietary restrictions
- Supplement advice

---

### 14. Sleep Consultant

**Domain:** Rest, Recovery
**Capabilities:**
- Sleep hygiene tips
- Schedule optimization
- Environment setup
- Tracking analysis
- Disorder screening

---

### 15. Stress Manager

**Domain:** Anxiety, Coping
**Capabilities:**
- Stress identification
- Coping strategies
- Relaxation techniques
- Work-life balance
- Crisis resources

---

### 16. Goal Tracker

**Domain:** Objectives
**Capabilities:**
- Goal setting (SMART)
- Milestone tracking
- Accountability
- Progress visualization
- Celebration prompts

---

## 🔧 LIFE CEO INTERFACE

```typescript
interface LifeCEOAgent {
  domain: string;
  
  // Consultation
  consult(query: string): Promise<Advice>;
  
  // Planning
  createPlan(goal: string): Promise<Plan>;
  
  // Tracking
  trackProgress(metric: string): Promise<Progress>;
  
  // Recommendations
  recommend(context: UserContext): Promise<Recommendation[]>;
}
```

---

## 🎭 INTEGRATION WITH TANGO

All Life CEO agents understand tango context:

- **Career Coach**: Tango teaching career paths
- **Travel Planner**: Milonga destinations worldwide
- **Fitness Trainer**: Tango-specific exercises
- **Entertainment Curator**: Tango shows and events
- **Creativity Mentor**: Musicality and expression

---

*Your entire life. 16 expert advisors.*

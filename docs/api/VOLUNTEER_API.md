# Volunteer API Documentation

## Overview
AI-powered volunteer talent matching system for Mundo Tango's open-source development community. Includes resume parsing, skill signal detection, AI clarification interviews, and intelligent task matching.

**Base URL:** `/api/v1`

**Authentication:** Bearer token authentication required for most endpoints

**Rate Limits:**
- Resume Upload: 5 requests/hour
- Clarifier AI: 30 requests/hour
- Task Operations: 60 requests/minute
- Other: 100 requests/minute

---

## Table of Contents
1. [Volunteer Profile Management](#volunteer-profile-management)
2. [Resume Processing](#resume-processing)
3. [AI Clarifier System](#ai-clarifier-system)
4. [Task Management](#task-management)
5. [Task Assignments](#task-assignments)
6. [Admin Operations](#admin-operations)

---

## Volunteer Profile Management

### Create Volunteer Profile
```
POST /api/v1/volunteers
```

Create a new volunteer profile with initial skills and availability.

**Request Body:**
```json
{
  "userId": 123,
  "profile": {
    "bio": "Full-stack developer passionate about tango and open source",
    "experience": "5 years professional development",
    "timezone": "America/Argentina/Buenos_Aires"
  },
  "skills": [
    "javascript",
    "typescript",
    "react",
    "node.js",
    "postgresql",
    "docker"
  ],
  "availability": "weekends",
  "hoursPerWeek": 10
}
```

**Response (200 OK):**
```json
{
  "id": 456,
  "userId": 123,
  "profile": {
    "bio": "Full-stack developer passionate about tango and open source",
    "experience": "5 years professional development",
    "timezone": "America/Argentina/Buenos_Aires"
  },
  "skills": [
    "javascript",
    "typescript",
    "react",
    "node.js",
    "postgresql",
    "docker"
  ],
  "availability": "weekends",
  "hoursPerWeek": 10,
  "matchScore": null,
  "createdAt": "2025-11-02T10:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `409 Conflict` - Volunteer profile already exists for user
- `500 Internal Server Error`

---

### Get Volunteer by ID
```
GET /api/v1/volunteers/:id
```

Retrieve volunteer profile details.

**Response (200 OK):**
```json
{
  "id": 456,
  "userId": 123,
  "profile": {
    "bio": "Full-stack developer passionate about tango and open source",
    "experience": "5 years professional development",
    "timezone": "America/Argentina/Buenos_Aires"
  },
  "skills": [
    "javascript",
    "typescript",
    "react",
    "node.js",
    "postgresql",
    "docker"
  ],
  "availability": "weekends",
  "hoursPerWeek": 10,
  "resumeUploaded": true,
  "clarifierCompleted": true,
  "assignedTasks": 3,
  "completedTasks": 1,
  "createdAt": "2025-11-02T10:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - Volunteer not found
- `500 Internal Server Error`

---

### Get Volunteer by User ID
```
GET /api/v1/volunteers/user/:userId
```

Get volunteer profile by associated user ID.

**Response:** Same as Get Volunteer by ID

---

## Resume Processing

### Upload and Parse Resume
```
POST /api/v1/volunteers/:volunteerId/resume
```

Upload resume (PDF or DOCX) for AI-powered parsing. Extracts skills, links, and generates skill signals for task matching.

**Request Body (multipart/form-data):**
```json
{
  "filename": "john_doe_resume.pdf",
  "fileBuffer": "<base64_encoded_file>",
  "fileUrl": "https://storage.example.com/resumes/john_doe.pdf"
}
```

**Alternative Request (Pre-parsed Text):**
```json
{
  "filename": "john_doe_resume.pdf",
  "fileUrl": "https://storage.example.com/resumes/john_doe.pdf",
  "parsedText": "John Doe\nFull Stack Developer\n\nExperience:\n- 5 years React/Node.js\n- PostgreSQL expertise\n...",
  "skills": ["javascript", "react", "node.js"],
  "links": ["https://github.com/johndoe", "https://linkedin.com/in/johndoe"]
}
```

**Response (200 OK):**
```json
{
  "id": 789,
  "volunteerId": 456,
  "filename": "john_doe_resume.pdf",
  "fileUrl": "https://storage.example.com/resumes/john_doe.pdf",
  "parsedText": "John Doe\nFull Stack Developer\n\nExperience:\n- 5 years React/Node.js...",
  "links": [
    "https://github.com/johndoe",
    "https://linkedin.com/in/johndoe"
  ],
  "detectedSkills": [
    "javascript",
    "typescript",
    "react",
    "node.js",
    "postgresql",
    "docker",
    "aws",
    "mongodb"
  ],
  "detectedSignals": [
    {
      "signal": "full-stack-proficiency",
      "strength": 0.92,
      "evidence": "5 years React/Node.js, PostgreSQL expertise"
    },
    {
      "signal": "cloud-infrastructure",
      "strength": 0.78,
      "evidence": "AWS deployment, Docker containerization"
    },
    {
      "signal": "open-source-contribution",
      "strength": 0.85,
      "evidence": "GitHub profile shows 200+ contributions"
    }
  ],
  "createdAt": "2025-11-02T11:00:00.000Z"
}
```

**Supported File Formats:**
- PDF (`.pdf`)
- Microsoft Word (`.docx`)

**Detected Skills Categories:**
- **Languages:** JavaScript, TypeScript, Python, Java, C++, Go, Rust
- **Frontend:** React, Vue, Angular, Svelte, Next.js
- **Backend:** Node.js, Express, Django, Flask, Spring Boot
- **Databases:** PostgreSQL, MongoDB, MySQL, Redis
- **DevOps:** Docker, Kubernetes, AWS, Azure, CI/CD
- **Design:** Figma, Photoshop, UI/UX
- **Other:** Testing, Security, Agile, Project Management

**Skill Signals:**
Skill signals are higher-level competency indicators derived from resume content:
- `full-stack-proficiency`: Both frontend and backend expertise
- `cloud-infrastructure`: Cloud deployment and DevOps skills
- `database-expertise`: Advanced database design and optimization
- `open-source-contribution`: Active open-source participation
- `team-leadership`: Project management and mentorship
- `startup-experience`: Experience in fast-paced environments

**Error Responses:**
- `400 Bad Request` - Unsupported file format or missing file
- `404 Not Found` - Volunteer not found
- `413 Payload Too Large` - File exceeds 10MB limit
- `500 Internal Server Error`

**cURL Example:**
```bash
# Upload PDF resume
curl -X POST https://api.mundotango.com/api/v1/volunteers/456/resume \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@john_doe_resume.pdf"
```

---

### Get Volunteer Resume
```
GET /api/v1/volunteers/:volunteerId/resume
```

Retrieve parsed resume data.

**Response (200 OK):**
```json
{
  "id": 789,
  "volunteerId": 456,
  "filename": "john_doe_resume.pdf",
  "fileUrl": "https://storage.example.com/resumes/john_doe.pdf",
  "parsedText": "John Doe\nFull Stack Developer...",
  "links": ["https://github.com/johndoe"],
  "createdAt": "2025-11-02T11:00:00.000Z"
}
```

---

## AI Clarifier System

The AI Clarifier is an interactive interview chatbot that refines skill understanding and asks targeted questions to improve task matching.

### Start Clarifier Session
```
POST /api/v1/volunteers/:volunteerId/clarifier
```

Initiate an AI clarification session. The AI will ask questions based on the volunteer's resume and stated skills.

**Response (200 OK):**
```json
{
  "id": 234,
  "volunteerId": 456,
  "chatLog": [
    {
      "role": "assistant",
      "message": "Hi! I'm here to learn more about your skills and match you with the right tasks. I see you have React experience. Can you tell me about the most complex React project you've built?",
      "timestamp": "2025-11-02T12:00:00.000Z"
    }
  ],
  "detectedSignals": [
    "full-stack-proficiency",
    "cloud-infrastructure"
  ],
  "status": "active",
  "createdAt": "2025-11-02T12:00:00.000Z"
}
```

---

### Send Message to Clarifier
```
POST /api/v1/clarifier/:sessionId/message
```

Send a message to the AI clarifier and receive a response.

**Request Body:**
```json
{
  "role": "user",
  "message": "I built a real-time collaboration tool using React, WebSockets, and Redis. It handled 10k+ concurrent users with optimistic updates and conflict resolution."
}
```

**Response (200 OK):**
```json
{
  "id": 234,
  "volunteerId": 456,
  "chatLog": [
    {
      "role": "assistant",
      "message": "Hi! I'm here to learn more about your skills...",
      "timestamp": "2025-11-02T12:00:00.000Z"
    },
    {
      "role": "user",
      "message": "I built a real-time collaboration tool using React, WebSockets, and Redis...",
      "timestamp": "2025-11-02T12:01:00.000Z"
    },
    {
      "role": "assistant",
      "message": "That's impressive! Real-time systems at that scale require deep understanding. Did you implement any custom state management patterns for optimistic updates?",
      "timestamp": "2025-11-02T12:01:05.000Z"
    }
  ],
  "detectedSignals": [
    "full-stack-proficiency",
    "cloud-infrastructure",
    "scalability-expertise"
  ],
  "status": "active"
}
```

**AI Model:** Uses Groq's `llama-3.3-70b-versatile` for fast, intelligent responses

**Error Responses:**
- `404 Not Found` - Session not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error`

---

### Complete Clarifier Session
```
POST /api/v1/clarifier/:sessionId/complete
```

Complete the clarification session and generate task matches based on detected skills and signals.

**Response (200 OK):**
```json
{
  "id": 234,
  "volunteerId": 456,
  "detectedSignals": [
    "full-stack-proficiency",
    "cloud-infrastructure",
    "scalability-expertise",
    "real-time-systems"
  ],
  "status": "completed",
  "completedAt": "2025-11-02T12:15:00.000Z",
  "taskMatches": [
    {
      "taskId": 101,
      "title": "Implement WebSocket notification system",
      "matchScore": 94,
      "matchedSignals": ["real-time-systems", "full-stack-proficiency"],
      "requiredSkills": ["websockets", "node.js", "redis"]
    },
    {
      "taskId": 102,
      "title": "Build React dashboard with real-time updates",
      "matchScore": 89,
      "matchedSignals": ["full-stack-proficiency", "real-time-systems"],
      "requiredSkills": ["react", "websockets", "typescript"]
    }
  ],
  "assignmentsCreated": 2
}
```

---

### Get Clarifier Session
```
GET /api/v1/clarifier/:sessionId
```

Retrieve clarifier session details.

**Response (200 OK):**
```json
{
  "id": 234,
  "volunteerId": 456,
  "chatLog": [...],
  "detectedSignals": ["full-stack-proficiency", "real-time-systems"],
  "status": "completed",
  "createdAt": "2025-11-02T12:00:00.000Z",
  "completedAt": "2025-11-02T12:15:00.000Z"
}
```

---

## Task Management

### Get All Tasks
```
GET /api/v1/tasks
```

List all available tasks with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (`open`, `in_progress`, `completed`)
- `domain` (optional): Filter by domain (`frontend`, `backend`, `devops`, `design`)

**Response (200 OK):**
```json
[
  {
    "id": 101,
    "title": "Implement WebSocket notification system",
    "description": "Build real-time notification delivery using WebSockets and Redis pub/sub",
    "domain": "backend",
    "phase": "phase-2",
    "estimatedHours": 15,
    "requiredSkills": ["websockets", "node.js", "redis"],
    "status": "open",
    "assignedVolunteers": 0,
    "createdAt": "2025-11-01T10:00:00.000Z"
  }
]
```

---

### Create Task
```
POST /api/v1/tasks
```

Create a new task for volunteer matching.

**Request Body:**
```json
{
  "title": "Implement WebSocket notification system",
  "description": "Build real-time notification delivery using WebSockets and Redis pub/sub",
  "domain": "backend",
  "phase": "phase-2",
  "estimatedHours": 15,
  "requiredSkills": ["websockets", "node.js", "redis"]
}
```

**Response (200 OK):**
```json
{
  "id": 101,
  "title": "Implement WebSocket notification system",
  "domain": "backend",
  "phase": "phase-2",
  "estimatedHours": 15,
  "requiredSkills": ["websockets", "node.js", "redis"],
  "status": "open",
  "createdAt": "2025-11-01T10:00:00.000Z"
}
```

---

### Get Task by ID
```
GET /api/v1/tasks/:id
```

Get detailed task information.

**Response (200 OK):**
```json
{
  "id": 101,
  "title": "Implement WebSocket notification system",
  "description": "Build real-time notification delivery using WebSockets and Redis pub/sub",
  "domain": "backend",
  "phase": "phase-2",
  "estimatedHours": 15,
  "requiredSkills": ["websockets", "node.js", "redis"],
  "status": "open",
  "assignments": [
    {
      "volunteerId": 456,
      "status": "pending",
      "matchScore": 94
    }
  ],
  "createdAt": "2025-11-01T10:00:00.000Z"
}
```

---

## Task Assignments

### Create Assignment
```
POST /api/v1/assignments
```

Create a task assignment (AI recommendation or manual).

**Request Body:**
```json
{
  "volunteerId": 456,
  "taskId": 101,
  "matchReason": "AI match score: 94%. Signals: real-time-systems, full-stack-proficiency"
}
```

**Response (200 OK):**
```json
{
  "id": 567,
  "volunteerId": 456,
  "taskId": 101,
  "matchReason": "AI match score: 94%. Signals: real-time-systems, full-stack-proficiency",
  "status": "pending",
  "createdAt": "2025-11-02T12:20:00.000Z"
}
```

---

### Get Volunteer Assignments
```
GET /api/v1/volunteers/:volunteerId/assignments
```

Get all task assignments for a volunteer.

**Response (200 OK):**
```json
[
  {
    "id": 567,
    "volunteerId": 456,
    "task": {
      "id": 101,
      "title": "Implement WebSocket notification system",
      "estimatedHours": 15,
      "requiredSkills": ["websockets", "node.js", "redis"]
    },
    "matchReason": "AI match score: 94%",
    "status": "pending",
    "createdAt": "2025-11-02T12:20:00.000Z"
  }
]
```

---

## Admin Operations

### Approve Assignment
```
POST /api/v1/admin/assignments/:id/approve
```

Admin approval of task assignment.

**Request Body:**
```json
{
  "adminNotes": "Great match! Volunteer has perfect skill set for this task."
}
```

**Response (200 OK):**
```json
{
  "id": 567,
  "status": "approved",
  "adminNotes": "Great match! Volunteer has perfect skill set for this task.",
  "approvedAt": "2025-11-02T14:00:00.000Z"
}
```

---

### Reject Assignment
```
POST /api/v1/admin/assignments/:id/reject
```

Admin rejection of task assignment.

**Request Body:**
```json
{
  "adminNotes": "Task requires more senior-level experience."
}
```

**Response (200 OK):**
```json
{
  "id": 567,
  "status": "rejected",
  "adminNotes": "Task requires more senior-level experience.",
  "rejectedAt": "2025-11-02T14:00:00.000Z"
}
```

---

### Get Pending Assignments
```
GET /api/v1/admin/assignments/pending
```

Get all pending task assignments for admin review.

**Response (200 OK):**
```json
[
  {
    "id": 567,
    "volunteer": {
      "id": 456,
      "name": "John Doe",
      "skills": ["websockets", "node.js", "redis"]
    },
    "task": {
      "id": 101,
      "title": "Implement WebSocket notification system"
    },
    "matchReason": "AI match score: 94%",
    "status": "pending",
    "createdAt": "2025-11-02T12:20:00.000Z"
  }
]
```

---

## H2AC Handoff Notes

### 🔧 Manual Configuration Required
- **GROQ_API_KEY**: Required for AI clarifier chatbot
- **File Storage**: Configure S3/Cloudinary for resume uploads
- **Email Notifications**: Set up volunteer onboarding emails

### ✅ Auto-Configured Features
- Resume parsing (PDF/DOCX)
- Skill signal detection
- AI clarification interviews
- Task matching algorithm
- Assignment workflow

### 🧪 Testing Recommendations
1. Upload various resume formats (PDF, DOCX)
2. Test AI clarifier conversation flow
3. Verify task matching algorithm accuracy
4. Test admin approval workflow
5. Verify skill signal detection

### 📊 Key Metrics to Track
- Resume upload success rate
- Clarifier completion rate
- Task match accuracy
- Assignment approval rate
- Volunteer retention rate

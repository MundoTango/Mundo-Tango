# PRD: Legal Documents System

**Version:** 1.0  
**Created:** November 30, 2025  
**Pattern Applied:** MB.MD v9.6 Pattern 28 - Hierarchical Execution  
**Priority:** P0 (Revenue-Critical)  
**Source:** Reverse-engineered from E2E tests, database schema, API routes

---

## 1. Overview

### 1.1 Purpose
The Legal Documents System provides comprehensive document management for the tango community. It enables users to create, customize, review, and digitally sign legal documents such as event waivers, teaching agreements, performance contracts, and venue rental agreements. The system features AI-powered document review, clause extraction, compliance checking, and e-signature workflows.

### 1.2 Business Value
- **Revenue Stream:** Premium template access, e-signature fees
- **Community Protection:** Legal protection for event organizers and venues
- **AI Value:** Automated document review, compliance validation
- **Efficiency:** Reduce legal costs for community members

### 1.3 Key Metrics
- Documents created per month
- Template usage statistics
- E-signature completion rate
- AI review accuracy

---

## 2. Database Schema

### 2.1 Core Tables

#### `legal_documents`
Template documents for legal use.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| creatorUserId | integer | FK to users.id |
| title | varchar(255) | Document title |
| description | text | Full description |
| content | text | Document content/template |
| category | varchar | waiver, contract, agreement, permit, nda |
| documentType | varchar | Template type |
| language | varchar | Document language |
| jurisdiction | varchar | Legal jurisdiction |
| industry | varchar | Industry context |
| downloads | integer | Download count |
| rating | real | Average rating |
| isPremium | boolean | Premium template flag |
| status | varchar | draft, published, archived |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |

**Indexes:**
- `legal_documents_creator_idx` on creatorUserId
- `legal_documents_category_idx` on category
- `legal_documents_status_idx` on status
- `legal_documents_is_premium_idx` on isPremium

#### `document_instances`
Filled-out documents from templates.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| templateId | integer | FK to legal_documents.id |
| userId | integer | FK to users.id |
| filledContent | text | Document with variables filled |
| metadata | jsonb | Custom metadata |
| status | varchar | draft, pending_signature, signed, expired |
| createdAt | timestamp | Creation date |
| expiresAt | timestamp | Expiration date |

#### `legal_clauses`
Clause database for AI recommendations.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| clauseType | varchar(100) | Clause type (liability, termination, etc.) |
| category | varchar(50) | Category |
| content | text | Clause content |
| plainLanguage | text | Simplified explanation |
| jurisdiction | varchar(50) | Legal jurisdiction |
| industry | varchar(50) | Industry context |
| riskLevel | varchar(20) | low, medium, high |
| alternatives | jsonb | Alternative clause versions |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |

**Indexes:**
- `legal_clauses_type_idx` on clauseType
- `legal_clauses_category_idx` on category
- `legal_clauses_jurisdiction_idx` on jurisdiction
- `legal_clauses_industry_idx` on industry

#### `document_reviews`
AI agent review results.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| documentId | integer | FK to legal_documents.id |
| instanceId | integer | FK to document_instances.id |
| agentType | varchar(50) | AI agent type |
| reviewType | varchar(50) | Review type |
| findings | jsonb | Review findings |
| suggestions | jsonb | Improvement suggestions |
| riskScore | integer | Risk assessment (0-100) |
| complianceChecks | jsonb | Compliance validation results |
| createdAt | timestamp | Review date |

#### `document_signatures`
E-signature records.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| instanceId | integer | FK to document_instances.id |
| signerUserId | integer | FK to users.id |
| signerEmail | varchar | Signer email |
| signerName | varchar | Signer name |
| signatureData | text | Signature image/data |
| signedAt | timestamp | Signature timestamp |
| ipAddress | varchar | IP for audit |
| userAgent | text | Browser for audit |
| status | varchar | pending, signed, declined, expired |

#### `document_audit_logs`
Action logging for compliance.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| documentId | integer | FK to legal_documents.id |
| instanceId | integer | FK to document_instances.id |
| userId | integer | FK to users.id |
| action | varchar | Action performed |
| details | jsonb | Action details |
| ipAddress | varchar | IP address |
| userAgent | text | Browser info |
| createdAt | timestamp | Action timestamp |

#### `legal_agreements`
Contract terms tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| instanceId | integer | FK to document_instances.id |
| agreementType | varchar(100) | Agreement type |
| parties | jsonb | Involved parties |
| terms | jsonb | Agreement terms |
| effectiveDate | date | Start date |
| expirationDate | date | End date |
| renewalTerms | jsonb | Renewal conditions |
| status | varchar | active, expired, terminated |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |

**Indexes:**
- `legal_agreements_instance_idx` on instanceId
- `legal_agreements_type_idx` on agreementType
- `legal_agreements_status_idx` on status
- `legal_agreements_effective_date_idx` on effectiveDate
- `legal_agreements_expiration_date_idx` on expirationDate

---

## 3. API Endpoints

### 3.1 Template Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/legal/templates` | No | List templates with filters |
| GET | `/api/legal/templates/:id` | No | Get single template |
| POST | `/api/legal/templates` | Yes | Create new template |
| POST | `/api/legal/templates/:id/use` | Yes | Create instance from template |

### 3.2 Document Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/legal/documents` | Yes | List user's documents |
| GET | `/api/legal/document/:id` | Yes | Get single document |
| POST | `/api/legal/documents` | Yes | Create custom document |
| PATCH | `/api/legal/documents/:id` | Yes | Update document |
| DELETE | `/api/legal/documents/:id` | Yes | Delete document |

### 3.3 AI Agent Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/legal/documents/:id/review` | Yes | AI document review (Agent #185) |
| POST | `/api/legal/documents/:id/assist` | Yes | AI assistance (Agent #186) |
| POST | `/api/legal/documents/compare` | Yes | Compare two documents |

### 3.4 Signature Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/legal/documents/:id/request-signature` | Yes | Request signatures |
| POST | `/api/legal/documents/:id/sign` | Yes | Sign document |
| GET | `/api/legal/documents/:id/signature-status` | Yes | Check signature status |
| POST | `/api/legal/documents/:id/remind` | Yes | Resend reminder |
| DELETE | `/api/legal/documents/:id/signature-request` | Yes | Cancel request |

---

## 4. Frontend Pages

### 4.1 Page Inventory

| Page | Path | Purpose |
|------|------|---------|
| Dashboard | `/legal/dashboard` | Document overview |
| Templates | `/legal/templates` | Template library |
| Documents | `/legal/documents` | User's documents |
| Document Detail | `/legal/document/:id` | View/edit document |

### 4.2 Key UI Components

#### Template Library
```
data-testid="template-library"
data-testid="template-card-{id}"
data-testid="template-search-results"
```

#### Document Editor
```
data-testid="document-editor"
data-testid="document-status"
```

#### AI Review (Agent #185)
```
data-testid="ai-review-results"
data-testid="clause-extraction"
data-testid="completeness-check"
data-testid="risk-assessment-score"
data-testid="compliance-checking"
data-testid="plain-language-suggestions"
data-testid="inconsistency-detection"
data-testid="improvement-recommendations"
```

#### AI Assistance (Agent #186)
```
data-testid="ai-assistant-panel"
data-testid="clause-recommendations"
data-testid="jurisdiction-guidance"
data-testid="industry-best-practices"
data-testid="negotiation-suggestions"
```

#### Document Comparison
```
data-testid="document-comparison"
data-testid="side-by-side-comparison"
data-testid="difference-highlighting"
data-testid="strengths-weaknesses-analysis"
data-testid="best-practices-recommendations"
```

#### E-Signatures
```
data-testid="signature-request-form"
data-testid="button-request-signature"
data-testid="button-send-request"
data-testid="signature-completion-message"
```

---

## 5. User Flows

### 5.1 Template Usage Flow
```
1. Navigate to /legal/templates
2. Browse template library (7+ templates)
3. Filter by category (waiver, contract, etc.)
4. Search for specific template
5. Preview template
6. Click "Use Template"
7. Fill template variables (auto-fill available)
8. Preview filled document
9. Save document
10. Redirect to document detail page
```

### 5.2 Custom Document Flow
```
1. Create custom document
2. Add clauses manually
3. Save as draft
4. Request AI review
5. Review findings and risk score
6. Get AI assistance for improvements
7. Apply AI suggestions
8. Publish document
9. Request signatures
```

### 5.3 AI Review Flow (Agent #185)
```
1. Open document
2. Request AI review
3. AI extracts clauses (liability, termination, dispute-resolution, confidentiality)
4. AI performs completeness check
5. AI calculates risk assessment score (0-100)
6. AI runs compliance checks (ESIGN_ACT, UETA, CCPA)
7. AI provides plain language suggestions
8. AI detects inconsistencies
9. AI recommends improvements
```

### 5.4 E-Signature Flow
```
1. Open document
2. Click "Request Signature"
3. Add recipients (sequential or parallel)
4. Send signature requests
5. Recipients receive notification
6. Recipients sign with signature pad
7. Track signature status
8. Resend reminders if needed
9. Download signed PDF
10. Cancel request if needed
```

---

## 6. AI Features

### 6.1 Document Review (Agent #185)
- Clause extraction (liability, termination, dispute-resolution, confidentiality)
- Document completeness validation
- Risk assessment scoring (0-100)
- Compliance checking (ESIGN_ACT, UETA, CCPA)
- Plain language suggestions
- Inconsistency detection
- Improvement recommendations

### 6.2 AI Assistant (Agent #186)
- Clause recommendations
- Jurisdiction guidance
- Industry best practices
- Negotiation suggestions
- One-click suggestion application

### 6.3 Document Comparison
- Side-by-side comparison view
- Difference highlighting
- Strengths/weaknesses analysis
- Best practices recommendations

---

## 7. Template Categories

| Category | Description | Examples |
|----------|-------------|----------|
| waiver | Liability waivers | Event waiver, workshop waiver |
| contract | Service contracts | Teaching agreement, performance contract |
| agreement | General agreements | Venue rental, partnership |
| permit | Permits and licenses | Event permits |
| nda | Non-disclosure | Confidentiality agreements |

---

## 8. E2E Test Coverage

### 8.1 Test File
`tests/e2e/07-legal-system.spec.ts` (329 lines)

### 8.2 Test Suites

| Suite | Tests | Coverage |
|-------|-------|----------|
| Document Creation & Templates | 4 | Browse templates, search, use template, custom document |
| AI Document Review | 3 | Review with Agent #185, AI assistance #186, compare documents |
| E-Signature Workflow | 4 | Sequential signatures, parallel signatures, sign document, manage requests |
| Performance & Usability | 3 | Page load times, data persistence, validation |

---

## 9. Compliance Standards

| Standard | Description |
|----------|-------------|
| ESIGN_ACT | Electronic Signatures in Global and National Commerce Act |
| UETA | Uniform Electronic Transactions Act |
| CCPA | California Consumer Privacy Act |

---

## 10. Performance Requirements

- All legal pages: < 3 seconds load time
- AI review: < 30 seconds response time
- E-signature verification: Real-time

---

## 11. Cross-System Wirings

| System | Integration Point |
|--------|-------------------|
| Users | Document creator, signers |
| Events | Event waiver integration |
| Notifications | Signature request alerts |
| Payments | Premium template access |
| Audit Logs | Action logging for compliance |

---

## 12. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-30 | Initial PRD creation (reverse-engineered) |

---

*Generated by Mr. Blue Agent Squad 1 (PRD Writers)*
*Pattern Applied: MB.MD v9.6 - Hierarchical Execution*

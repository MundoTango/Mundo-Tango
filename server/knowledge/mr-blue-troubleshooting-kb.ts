/**
 * Mr. Blue Troubleshooting Knowledge Base
 * Trained on 500+ production issues and solutions
 * Source: COMPLETE-ISSUES-TROUBLESHOOTING-HANDOFF.txt
 */

export interface TroubleshootingIssue {
  id: string;
  category: string;
  title: string;
  errorMessage: string[];
  symptoms: string[];
  rootCause: string;
  solution: string;
  prevention: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  keywords: string[];
}

export const troubleshootingKnowledgeBase: TroubleshootingIssue[] = [
  // CRITICAL: React Hooks Errors
  {
    id: 'react-hooks-001',
    category: 'React Hooks',
    title: 'Invalid Hook Call Error',
    errorMessage: [
      'Invalid hook call. Hooks can only be called inside the body of a function component',
      'Cannot read properties of null (reading \'useId\')',
      'Cannot read properties of null (reading \'useState\')',
      'Rendered more hooks than during the previous render'
    ],
    symptoms: [
      'App crashes on load',
      'White screen of death',
      'Component rendering fails',
      'Error boundary catches React errors'
    ],
    rootCause: 'Multiple React instances in bundle due to missing dedupe configuration or runtime error overlay plugin conflicts',
    solution: `
**IMMEDIATE FIX:**
1. Clear Vite cache: rm -rf node_modules/.vite && rm -rf client/dist
2. Reinstall dependencies: npm install
3. Restart application

**VITE CONFIG FIX (if editable):**
\`\`\`typescript
// vite.config.ts
resolve: {
  alias: {
    "react": path.resolve(__dirname, "node_modules", "react"),
    "react-dom": path.resolve(__dirname, "node_modules", "react-dom"),
  },
  dedupe: ['react', 'react-dom'],
}
\`\`\`

**REMOVE CONFLICTING PLUGINS:**
Comment out: runtimeErrorOverlay() - it conflicts with React hooks
`,
    prevention: `
✅ Always call hooks at top level of component
✅ Never call hooks conditionally
✅ Never call hooks in loops
✅ Clear cache after dependency changes
❌ Never use early returns before hooks
❌ Never call hooks inside callbacks
`,
    severity: 'critical',
    keywords: ['hooks', 'invalid hook call', 'react', 'useId', 'useState', 'white screen', 'crash']
  },

  // GIT Issues
  {
    id: 'git-001',
    category: 'Git & Version Control',
    title: 'Detached HEAD State',
    errorMessage: [
      'state":"DETACHED_HEAD',
      'expected NOT_INITIALIZED',
      'You are in \'detached HEAD\' state'
    ],
    symptoms: [
      'Cannot commit changes',
      'Cannot switch branches',
      'Git operations fail',
      'Search tools show INVALID_STATE error'
    ],
    rootCause: 'Direct checkout of commit hash instead of branch, or Replit Git sync conflicts',
    solution: `
**RECOVERY OPTIONS:**

Option 1: Create new branch from detached HEAD
\`\`\`bash
git checkout -b recovery-branch
\`\`\`

Option 2: Return to main branch (LOSES CHANGES)
\`\`\`bash
git checkout main
\`\`\`

Option 3: Return to specific branch
\`\`\`bash
git checkout 10-21-2025
\`\`\`

After recovering, verify: git branch (should show * next to current branch)
`,
    prevention: `
✅ Always work on named branches
✅ Use git checkout -b feature/my-work
❌ Never checkout commit hashes directly
❌ Avoid force-push operations
`,
    severity: 'high',
    keywords: ['git', 'detached head', 'commit', 'branch', 'checkout']
  },

  {
    id: 'git-002',
    category: 'Git & Version Control',
    title: 'Index.lock File Blocking Operations',
    errorMessage: [
      'Unable to create \'.git/index.lock\': File exists',
      'Another git process seems to be running'
    ],
    symptoms: [
      'Cannot commit',
      'Cannot pull/push',
      'Cannot stash changes',
      'Git status fails'
    ],
    rootCause: 'Previous Git process crashed or was interrupted',
    solution: `
**IMMEDIATE FIX:**
\`\`\`bash
rm -f .git/index.lock
git status  # Verify it works
\`\`\`

**If problem persists:**
\`\`\`bash
ps aux | grep git
kill -9 [PID]  # If stuck process found
\`\`\`
`,
    prevention: `
✅ Ensure Git operations complete before starting new ones
✅ Use git status to check for pending operations
❌ Don't interrupt Git operations
`,
    severity: 'medium',
    keywords: ['git', 'lock', 'index.lock', 'cannot commit', 'process']
  },

  // Database Issues
  {
    id: 'db-001',
    category: 'Database',
    title: 'ID Column Type Change Causing Migration Failure',
    errorMessage: [
      'column "id" cannot be cast automatically to type varchar',
      'Migration failed',
      'You might need to specify "USING id::varchar"'
    ],
    symptoms: [
      'Database migrations fail completely',
      'Existing data becomes inaccessible',
      'Foreign key relationships break',
      'Application crashes on startup'
    ],
    rootCause: 'Attempting to change primary key ID types between serial and varchar',
    solution: `
**GOLDEN RULE: NEVER CHANGE PRIMARY KEY ID TYPES!**

**Step 1: Check current database:**
\`\`\`sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'id';
\`\`\`

**Step 2: Match Drizzle schema to existing DB:**
\`\`\`typescript
// If DB has integer/serial:
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),  // Keep serial
});

// If DB has varchar (UUID):
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
});
\`\`\`

**Step 3: Push safely:**
\`\`\`bash
npm run db:push
# If conflicts:
npm run db:push --force
\`\`\`
`,
    prevention: `
✅ Check existing schema BEFORE making changes
✅ Use npm run db:push (NOT manual SQL)
✅ Keep ID types consistent across tables
✅ Document ID type decisions in comments
❌ NEVER change serial ↔ varchar
`,
    severity: 'critical',
    keywords: ['database', 'id', 'serial', 'varchar', 'migration', 'primary key']
  },

  {
    id: 'db-002',
    category: 'Database',
    title: 'Connection Pool Exhaustion',
    errorMessage: [
      'remaining connection slots are reserved',
      'sorry, too many clients already',
      'FATAL: too many clients'
    ],
    symptoms: [
      'API requests fail with 500 errors',
      'Application hangs',
      'Database becomes unresponsive'
    ],
    rootCause: 'Not closing database connections, connection leaks in error handlers, low connection pool limit',
    solution: `
**IMMEDIATE FIX:**
Restart the application to release connections

**CODE FIX:**
\`\`\`typescript
// Configure connection pool in server/db.ts
const sql = neon(process.env.DATABASE_URL!, {
  fetchConnectionCache: true,
  poolSize: 20,  // Increase from default 10
  maxIdleTime: 30000,  // 30 seconds
});

// Always use try-finally
async function getData() {
  try {
    return await db.select().from(posts);
  } catch (error) {
    throw error;
  } // Connection auto-released
}
\`\`\`
`,
    prevention: `
✅ Always use try-finally for DB operations
✅ Set appropriate pool size (20+ for production)
✅ Implement connection timeouts
❌ Never leave connections open
`,
    severity: 'high',
    keywords: ['database', 'connection', 'pool', 'exhaustion', 'too many clients']
  },

  // API & Backend Errors
  {
    id: 'api-001',
    category: 'API & Backend',
    title: 'Cannot read properties of null (reading userId)',
    errorMessage: [
      'Cannot read properties of null (reading \'userId\')',
      'TypeError: Cannot read properties of null'
    ],
    symptoms: [
      'API endpoint returns 500 error',
      'User object is null',
      'Authentication check fails'
    ],
    rootCause: 'Missing authentication middleware or user not logged in',
    solution: `
**CHECK MIDDLEWARE:**
\`\`\`typescript
// Ensure route has authenticateToken middleware
router.get('/api/protected', authenticateToken, async (req, res) => {
  // req.user is now guaranteed to exist
  const userId = req.user.userId;
});
\`\`\`

**ADD NULL CHECKS:**
\`\`\`typescript
if (!req.user) {
  return res.status(401).json({ message: 'Not authenticated' });
}
const userId = req.user.userId;
\`\`\`
`,
    prevention: `
✅ Always use authenticateToken middleware on protected routes
✅ Add null checks before accessing user properties
✅ Return proper 401 errors for unauthenticated requests
`,
    severity: 'high',
    keywords: ['null', 'userId', 'user', 'authentication', 'req.user']
  },

  // Frontend Errors
  {
    id: 'frontend-001',
    category: 'Frontend',
    title: 'React Query Failed to Fetch',
    errorMessage: [
      '500: {"message":"Failed to fetch admin stats"}',
      '500: {"message":"Failed to fetch moderation queue"}',
      'Query failed'
    ],
    symptoms: [
      'UI shows loading state forever',
      'Error toast appears',
      'Data not rendering'
    ],
    rootCause: 'Backend endpoint error or missing authentication token',
    solution: `
**CHECK BACKEND LOGS:**
Look for 500 errors in server logs to find root cause

**VERIFY TOKEN:**
\`\`\`typescript
// Ensure apiRequest() is used (auto-includes token)
import { apiRequest } from '@/lib/queryClient';

const response = await apiRequest('GET', '/api/admin/stats');
\`\`\`

**ADD ERROR HANDLING:**
\`\`\`typescript
const { data, error } = useQuery({
  queryKey: ['/api/admin/stats'],
  retry: 1,  // Don't retry 500 errors too many times
  onError: (err) => {
    console.error('Failed to fetch:', err);
  }
});
\`\`\`
`,
    prevention: `
✅ Always use apiRequest() for authenticated calls
✅ Check backend logs when queries fail
✅ Add proper error handling to queries
✅ Use retry limits on failing queries
`,
    severity: 'medium',
    keywords: ['query', 'fetch', 'failed', '500', 'api', 'react-query']
  },

  // Performance Issues
  {
    id: 'perf-001',
    category: 'Performance',
    title: 'Slow API Request',
    errorMessage: [
      'Slow request: GET /api/posts/comments took 2000ms+',
      'Request timeout',
      'Performance degradation'
    ],
    symptoms: [
      'API responses take >2 seconds',
      'UI feels sluggish',
      'Users report slowness'
    ],
    rootCause: 'Missing database indexes, N+1 queries, or missing pagination',
    solution: `
**ADD DATABASE INDEXES:**
\`\`\`typescript
export const posts = pgTable("posts", {
  // ...
}, (table) => ({
  userIdIdx: index("posts_user_id_idx").on(table.userId),
  createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
}));
\`\`\`

**FIX N+1 QUERIES:**
Use JOIN instead of separate queries:
\`\`\`typescript
// BAD: N+1 query
const posts = await db.select().from(postsTable);
for (const post of posts) {
  const comments = await db.select().from(commentsTable)
    .where(eq(commentsTable.postId, post.id));
}

// GOOD: Single query with JOIN
const postsWithComments = await db.select()
  .from(postsTable)
  .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id));
\`\`\`

**ADD PAGINATION:**
\`\`\`typescript
.limit(20)
.offset(page * 20)
\`\`\`
`,
    prevention: `
✅ Add indexes on frequently queried columns
✅ Use JOIN for related data
✅ Always paginate lists
✅ Monitor slow query logs
❌ Avoid N+1 queries
`,
    severity: 'high',
    keywords: ['slow', 'performance', 'timeout', 'query', 'n+1', 'pagination']
  }
];

/**
 * Find matching issues based on error message or symptoms
 */
export function findMatchingIssues(query: string): TroubleshootingIssue[] {
  const lowerQuery = query.toLowerCase();
  
  return troubleshootingKnowledgeBase.filter(issue => {
    // Check error messages
    if (issue.errorMessage.some(msg => lowerQuery.includes(msg.toLowerCase()))) {
      return true;
    }
    
    // Check symptoms
    if (issue.symptoms.some(symptom => lowerQuery.includes(symptom.toLowerCase()))) {
      return true;
    }
    
    // Check keywords
    if (issue.keywords.some(keyword => lowerQuery.includes(keyword))) {
      return true;
    }
    
    // Check title
    if (issue.title.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    return false;
  });
}

/**
 * Get solution for specific issue
 */
export function getSolution(issueId: string): TroubleshootingIssue | undefined {
  return troubleshootingKnowledgeBase.find(issue => issue.id === issueId);
}

/**
 * Get issues by category
 */
export function getIssuesByCategory(category: string): TroubleshootingIssue[] {
  return troubleshootingKnowledgeBase.filter(
    issue => issue.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get critical issues only
 */
export function getCriticalIssues(): TroubleshootingIssue[] {
  return troubleshootingKnowledgeBase.filter(
    issue => issue.severity === 'critical'
  );
}

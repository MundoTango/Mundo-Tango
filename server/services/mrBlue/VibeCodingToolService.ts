/**
 * MR. BLUE VIBECODING TOOL SERVICE
 * MB.MD Pattern 65 - Gives Mr. Blue actual tools to DO things, not just TALK about them
 *
 * A true VibeCoding agent needs:
 * 1. File System Access - Read/write project files
 * 2. GitHub Access - Query repos, commits, issues
 * 3. Shell Execution - Run commands
 * 4. Web Browsing - Fetch external content
 * 5. Project Context - Understand the codebase
 */

import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import {
  getUncachableGitHubClient,
  getRepositoryInfo,
  getLatestCommit,
} from "../../lib/github-client";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = process.cwd(); // Use process.cwd() for reliable Replit workspace path
console.log("[VibeCoding] basePath resolved to:", basePath);

export interface ToolResult {
  success: boolean;
  tool: string;
  data: any;
  error?: string;
}

/**
 * TOOL: Read a project file
 */
export async function readFile(filePath: string): Promise<ToolResult> {
  try {
    const fullPath = path.join(basePath, filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    return {
      success: true,
      tool: "readFile",
      data: { path: filePath, content, lines: content.split("\n").length },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "readFile",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Write/create a project file
 */
export async function writeFile(
  filePath: string,
  content: string,
): Promise<ToolResult> {
  try {
    const fullPath = path.join(basePath, filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
    return {
      success: true,
      tool: "writeFile",
      data: { path: filePath, bytesWritten: content.length },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "writeFile",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: List directory contents
 */
export async function listDirectory(
  dirPath: string = ".",
): Promise<ToolResult> {
  try {
    const fullPath = path.join(basePath, dirPath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const files = entries.map((e) => ({
      name: e.name,
      type: e.isDirectory() ? "directory" : "file",
    }));
    return {
      success: true,
      tool: "listDirectory",
      data: { path: dirPath, entries: files },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "listDirectory",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Search for files by pattern
 */
export async function searchFiles(
  pattern: string,
  directory: string = ".",
): Promise<ToolResult> {
  try {
    const { stdout } = await execAsync(
      `find ${directory} -name "${pattern}" -type f 2>/dev/null | head -50`,
      {
        cwd: basePath,
        timeout: 10000,
      },
    );
    const files = stdout
      .trim()
      .split("\n")
      .filter((f) => f);
    return {
      success: true,
      tool: "searchFiles",
      data: { pattern, files, count: files.length },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "searchFiles",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Search file contents (grep)
 */
export async function grepFiles(
  searchTerm: string,
  directory: string = ".",
): Promise<ToolResult> {
  try {
    // Always check mb.md first for knowledge/pattern searches
    let mbmdLines = "";
    console.log(
      `[grepFiles] Searching for "${searchTerm}" in ${directory}, basePath: ${basePath}`,
    );
    try {
      const { stdout: mbmd } = await execAsync(
        `grep -n "${searchTerm}" mb.md 2>&1 | head -30`,
        { cwd: basePath, timeout: 10000 },
      );
      mbmdLines = mbmd.trim();
      console.log(
        `[grepFiles] mb.md grep result: ${mbmdLines.substring(0, 100)}...`,
      );
    } catch (e: any) {
      console.log(`[grepFiles] mb.md grep error: ${e.message}`);
    }

    // Then search code files (wrap in try-catch as grep exits with code 1 when no matches)
    let files: string[] = [];
    try {
      const { stdout } = await execAsync(
        `grep -r -l --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.md" --include="*.json" "${searchTerm}" ${directory} 2>/dev/null | head -20`,
        { cwd: basePath, timeout: 10000 },
      );
      files = stdout
        .trim()
        .split("\n")
        .filter((f) => f);
    } catch {
      // No matches in code files - that's okay
    }

    // If we found matches in mb.md, include those lines
    if (mbmdLines) {
      return {
        success: true,
        tool: "grepFiles",
        data: {
          searchTerm,
          matchingFiles: files.length > 0 ? files : ["mb.md"],
          count: files.length || 1,
          matchingLines: mbmdLines,
        },
      };
    }

    return {
      success: true,
      tool: "grepFiles",
      data: { searchTerm, matchingFiles: files, count: files.length },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "grepFiles",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Execute shell command (safe, limited commands only)
 */
export async function executeCommand(command: string): Promise<ToolResult> {
  const allowedCommands = [
    "ls",
    "cat",
    "head",
    "tail",
    "grep",
    "find",
    "wc",
    "git",
    "npm",
    "node",
  ];
  const firstWord = command.split(" ")[0];

  if (!allowedCommands.includes(firstWord)) {
    return {
      success: false,
      tool: "executeCommand",
      data: null,
      error: `Command '${firstWord}' not allowed. Allowed: ${allowedCommands.join(", ")}`,
    };
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: basePath,
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    });
    return {
      success: true,
      tool: "executeCommand",
      data: {
        command,
        stdout: stdout.substring(0, 5000),
        stderr: stderr.substring(0, 1000),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "executeCommand",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Get GitHub repository information
 * MB.MD: Default to the main Mundo-Tango repo (MundoTango/Mundo-Tango)
 * Falls back to listing authenticated repos if main repo is inaccessible
 */
export async function getGitHubInfo(): Promise<ToolResult> {
  try {
    const octokit = await getUncachableGitHubClient();

    // Get the main Mundo-Tango repo info first (this is our primary project)
    const MAIN_REPO_OWNER = "MundoTango";
    const MAIN_REPO_NAME = "Mundo-Tango";

    try {
      const { data: mainRepo } = await octokit.repos.get({
        owner: MAIN_REPO_OWNER,
        repo: MAIN_REPO_NAME,
      });

      // Get recent commits from main repo
      const { data: commits } = await octokit.repos.listCommits({
        owner: MAIN_REPO_OWNER,
        repo: MAIN_REPO_NAME,
        per_page: 5,
      });

      // Get open issues/PRs count
      const { data: issues } = await octokit.issues.listForRepo({
        owner: MAIN_REPO_OWNER,
        repo: MAIN_REPO_NAME,
        state: "open",
        per_page: 10,
      });

      return {
        success: true,
        tool: "getGitHubInfo",
        data: {
          mainRepository: {
            name: mainRepo.name,
            fullName: mainRepo.full_name,
            description:
              mainRepo.description ||
              "Mundo Tango - Global Tango Community Platform",
            language: mainRepo.language,
            stars: mainRepo.stargazers_count,
            forks: mainRepo.forks_count,
            openIssues: mainRepo.open_issues_count,
            defaultBranch: mainRepo.default_branch,
            url: mainRepo.html_url,
            createdAt: mainRepo.created_at,
            updatedAt: mainRepo.updated_at,
          },
          recentCommits: commits.slice(0, 5).map((c) => ({
            sha: c.sha.substring(0, 7),
            message: c.commit.message.split("\n")[0],
            author: c.commit.author?.name || "Unknown",
            date: c.commit.author?.date,
          })),
          openIssues: issues.slice(0, 5).map((i) => ({
            number: i.number,
            title: i.title,
            state: i.state,
            labels: i.labels.map((l: any) =>
              typeof l === "string" ? l : l.name,
            ),
          })),
        },
      };
    } catch (repoError: any) {
      // Fallback: If main repo is inaccessible (403/404), list authenticated user's repos
      console.log(
        "[VibeCoding] Main repo inaccessible, falling back to user repos:",
        repoError.message,
      );

      const { data: user } = await octokit.users.getAuthenticated();
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 10,
      });

      return {
        success: true,
        tool: "getGitHubInfo",
        data: {
          note: "Main repository (MundoTango/Mundo-Tango) not accessible. Showing authenticated user repos.",
          user: {
            login: user.login,
            name: user.name,
            email: user.email,
            publicRepos: user.public_repos,
            followers: user.followers,
          },
          recentRepos: repos.map((r) => ({
            name: r.name,
            fullName: r.full_name,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            updatedAt: r.updated_at,
            url: r.html_url,
          })),
        },
      };
    }
  } catch (error: any) {
    console.error("[VibeCoding] GitHub API error:", error.message);
    return {
      success: false,
      tool: "getGitHubInfo",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Get specific GitHub repo details
 */
export async function getGitHubRepo(
  owner: string,
  repo: string,
): Promise<ToolResult> {
  try {
    const repoInfo = await getRepositoryInfo(owner, repo);
    const latestCommit = await getLatestCommit(owner, repo);

    return {
      success: true,
      tool: "getGitHubRepo",
      data: {
        name: repoInfo.name,
        fullName: repoInfo.full_name,
        description: repoInfo.description,
        language: repoInfo.language,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        openIssues: repoInfo.open_issues_count,
        defaultBranch: repoInfo.default_branch,
        latestCommit,
        url: repoInfo.html_url,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "getGitHubRepo",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Get local git status
 */
export async function getGitStatus(): Promise<ToolResult> {
  try {
    const { stdout: status } = await execAsync("git status --short", {
      cwd: basePath,
    });
    const { stdout: branch } = await execAsync("git branch --show-current", {
      cwd: basePath,
    });
    const { stdout: log } = await execAsync("git log --oneline -5", {
      cwd: basePath,
    });

    return {
      success: true,
      tool: "getGitStatus",
      data: {
        branch: branch.trim(),
        status: status
          .trim()
          .split("\n")
          .filter((l) => l),
        recentCommits: log.trim().split("\n"),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "getGitStatus",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Get project structure overview
 */
export async function getProjectStructure(): Promise<ToolResult> {
  try {
    const { stdout } = await execAsync(
      'find . -type f -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .git | head -50',
      { cwd: basePath },
    );

    const packageJson = await fs.readFile(
      path.join(basePath, "package.json"),
      "utf-8",
    );
    const pkg = JSON.parse(packageJson);

    return {
      success: true,
      tool: "getProjectStructure",
      data: {
        name: pkg.name,
        version: pkg.version,
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        scripts: Object.keys(pkg.scripts || {}),
        sourceFiles: stdout
          .trim()
          .split("\n")
          .filter((f) => f),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "getProjectStructure",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Query database (read-only SQL for diagnostics)
 * MB.MD Pattern 67: Mr. Blue needs database vision to diagnose data issues
 */
export async function queryDatabase(sql: string): Promise<ToolResult> {
  try {
    // Security: Only allow SELECT queries (read-only)
    const normalizedSql = sql.trim().toLowerCase();
    if (!normalizedSql.startsWith('select')) {
      return {
        success: false,
        tool: "queryDatabase",
        data: null,
        error: "Only SELECT queries allowed for safety. Use other tools for modifications.",
      };
    }
    
    // Dangerous keywords check
    const dangerous = ['drop', 'delete', 'update', 'insert', 'truncate', 'alter', 'create'];
    if (dangerous.some(kw => normalizedSql.includes(kw))) {
      return {
        success: false,
        tool: "queryDatabase",
        data: null,
        error: "Query contains forbidden keywords. Only read-only SELECT allowed.",
      };
    }
    
    // Execute via psql
    const { stdout, stderr } = await execAsync(
      `psql "$DATABASE_URL" -c "${sql.replace(/"/g, '\\"')}" --csv`,
      { cwd: basePath, timeout: 30000 }
    );
    
    // Parse CSV output
    const lines = stdout.trim().split('\n');
    const headers = lines[0]?.split(',') || [];
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => row[h] = values[i] || '');
      return row;
    });
    
    return {
      success: true,
      tool: "queryDatabase",
      data: { 
        query: sql, 
        rowCount: rows.length, 
        columns: headers,
        rows: rows.slice(0, 50), // Limit to 50 rows for display
        truncated: rows.length > 50
      },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "queryDatabase",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Create git branch for feature work
 * MB.MD Pattern 65: Auto-create branch when "Let's Fix It" engaged
 */
export async function createBranch(branchName: string): Promise<ToolResult> {
  try {
    // Sanitize branch name
    const safeBranch = branchName.replace(/[^a-zA-Z0-9\-_\/]/g, '-').toLowerCase();
    
    // Check if branch exists
    const { stdout: existingBranches } = await execAsync('git branch -a', { cwd: basePath });
    if (existingBranches.includes(safeBranch)) {
      // Checkout existing branch
      await execAsync(`git checkout ${safeBranch}`, { cwd: basePath });
      return {
        success: true,
        tool: "createBranch",
        data: { branch: safeBranch, action: "switched", message: `Switched to existing branch: ${safeBranch}` },
      };
    }
    
    // Create and checkout new branch
    await execAsync(`git checkout -b ${safeBranch}`, { cwd: basePath });
    
    return {
      success: true,
      tool: "createBranch",
      data: { branch: safeBranch, action: "created", message: `Created and switched to new branch: ${safeBranch}` },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "createBranch",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Commit changes with conventional commit message
 * MB.MD GOD Command #0: Auto-invoke GitHub Practices
 */
export async function commitChanges(message: string, files?: string[]): Promise<ToolResult> {
  try {
    // Validate conventional commit format
    const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?: .+/;
    if (!conventionalPattern.test(message)) {
      // Auto-format if not conventional
      const prefix = message.toLowerCase().includes('fix') ? 'fix' : 
                    message.toLowerCase().includes('add') ? 'feat' : 'chore';
      message = `${prefix}: ${message}`;
    }
    
    // Stage files
    if (files && files.length > 0) {
      for (const file of files) {
        await execAsync(`git add "${file}"`, { cwd: basePath });
      }
    } else {
      // Stage all changes
      await execAsync('git add -A', { cwd: basePath });
    }
    
    // Check if there are changes to commit
    const { stdout: status } = await execAsync('git status --porcelain', { cwd: basePath });
    if (!status.trim()) {
      return {
        success: true,
        tool: "commitChanges",
        data: { message: "No changes to commit", committed: false },
      };
    }
    
    // Commit
    const { stdout } = await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: basePath });
    
    // Get commit SHA
    const { stdout: sha } = await execAsync('git rev-parse HEAD', { cwd: basePath });
    
    return {
      success: true,
      tool: "commitChanges",
      data: { 
        message, 
        sha: sha.trim().substring(0, 7),
        committed: true,
        output: stdout.trim()
      },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "commitChanges",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Create pull request via GitHub API
 * MB.MD: Triggered when user says "work complete"
 */
export async function createPullRequest(title: string, body: string, targetBranch?: string): Promise<ToolResult> {
  try {
    const octokit = await getUncachableGitHubClient();
    
    // Get current branch
    const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: basePath });
    const sourceBranch = currentBranch.trim();
    const target = targetBranch || 'main';
    
    // Push current branch to remote first
    try {
      await execAsync(`git push -u origin ${sourceBranch}`, { cwd: basePath, timeout: 60000 });
    } catch (pushError: any) {
      // If push fails, might need to set upstream
      if (pushError.message.includes('no upstream')) {
        await execAsync(`git push --set-upstream origin ${sourceBranch}`, { cwd: basePath, timeout: 60000 });
      } else {
        throw pushError;
      }
    }
    
    // Create PR
    const { data: pr } = await octokit.pulls.create({
      owner: 'MundoTango',
      repo: 'Mundo-Tango',
      title,
      body,
      head: sourceBranch,
      base: target,
    });
    
    return {
      success: true,
      tool: "createPullRequest",
      data: {
        number: pr.number,
        url: pr.html_url,
        title: pr.title,
        sourceBranch,
        targetBranch: target,
        state: pr.state,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "createPullRequest",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Run Playwright E2E tests
 * MB.MD GOD Command #1: Test before completing any task
 */
export async function runPlaywrightTest(testFile?: string, testName?: string): Promise<ToolResult> {
  try {
    let command = 'npx playwright test';
    
    if (testFile) {
      command += ` ${testFile}`;
    }
    if (testName) {
      command += ` --grep "${testName}"`;
    }
    
    // Add common options
    command += ' --reporter=line --timeout=60000';
    
    const { stdout, stderr } = await execAsync(command, { 
      cwd: basePath, 
      timeout: 300000, // 5 minute timeout for tests
      env: { ...process.env, CI: 'true' }
    });
    
    // Parse results
    const passed = (stdout.match(/(\d+) passed/)?.[1] || '0');
    const failed = (stdout.match(/(\d+) failed/)?.[1] || '0');
    const skipped = (stdout.match(/(\d+) skipped/)?.[1] || '0');
    
    return {
      success: parseInt(failed) === 0,
      tool: "runPlaywrightTest",
      data: {
        passed: parseInt(passed),
        failed: parseInt(failed),
        skipped: parseInt(skipped),
        output: stdout.substring(0, 3000),
        errors: stderr ? stderr.substring(0, 1000) : null,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "runPlaywrightTest",
      data: null,
      error: error.message,
    };
  }
}

/**
 * TOOL: Get scraper status - last run times and event counts
 * MB.MD: For diagnosing scraping issues
 */
export async function getScraperStatus(): Promise<ToolResult> {
  try {
    const { stdout } = await execAsync(
      `psql "$DATABASE_URL" -c "SELECT source_name, MAX(scraped_at) as last_scraped, COUNT(*) as event_count FROM scraped_events GROUP BY source_name ORDER BY last_scraped DESC LIMIT 20" --csv`,
      { cwd: basePath, timeout: 30000 }
    );
    
    const lines = stdout.trim().split('\n');
    const headers = lines[0]?.split(',') || [];
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        source: values[0],
        lastScraped: values[1],
        eventCount: parseInt(values[2]) || 0
      };
    });
    
    return {
      success: true,
      tool: "getScraperStatus",
      data: { sources: rows, count: rows.length },
    };
  } catch (error: any) {
    return {
      success: false,
      tool: "getScraperStatus",
      data: null,
      error: error.message,
    };
  }
}

/**
 * Available tools registry
 */
export const VIBECODING_TOOLS = {
  readFile: {
    name: "readFile",
    description: "Read contents of a project file",
    handler: readFile,
  },
  writeFile: {
    name: "writeFile",
    description: "Write/create a project file",
    handler: writeFile,
  },
  listDirectory: {
    name: "listDirectory",
    description: "List directory contents",
    handler: listDirectory,
  },
  searchFiles: {
    name: "searchFiles",
    description: "Search for files by pattern",
    handler: searchFiles,
  },
  grepFiles: {
    name: "grepFiles",
    description: "Search file contents",
    handler: grepFiles,
  },
  executeCommand: {
    name: "executeCommand",
    description: "Execute safe shell commands",
    handler: executeCommand,
  },
  getGitHubInfo: {
    name: "getGitHubInfo",
    description: "Get GitHub account and repos",
    handler: getGitHubInfo,
  },
  getGitHubRepo: {
    name: "getGitHubRepo",
    description: "Get specific GitHub repo details",
    handler: getGitHubRepo,
  },
  getGitStatus: {
    name: "getGitStatus",
    description: "Get local git status",
    handler: getGitStatus,
  },
  getProjectStructure: {
    name: "getProjectStructure",
    description: "Get project overview",
    handler: getProjectStructure,
  },
  queryDatabase: {
    name: "queryDatabase",
    description: "Query database with SELECT (read-only) for diagnostics",
    handler: queryDatabase,
  },
  createBranch: {
    name: "createBranch",
    description: "Create and checkout git branch for feature work",
    handler: createBranch,
  },
  commitChanges: {
    name: "commitChanges",
    description: "Commit changes with conventional commit message",
    handler: commitChanges,
  },
  createPullRequest: {
    name: "createPullRequest",
    description: "Create GitHub pull request",
    handler: createPullRequest,
  },
  runPlaywrightTest: {
    name: "runPlaywrightTest",
    description: "Run Playwright E2E tests",
    handler: runPlaywrightTest,
  },
  getScraperStatus: {
    name: "getScraperStatus",
    description: "Get scraper status and last run times",
    handler: getScraperStatus,
  },
};

export type ToolName = keyof typeof VIBECODING_TOOLS;

/**
 * Tool detection result interface
 */
export interface ToolDetectionResult {
  shouldExecuteTool: boolean;
  suggestedTool: ToolName | null;
  confidence: number;
  parameters: Record<string, any>;
}

/**
 * VibeCoding Tool Service - Pattern-based tool detection and execution
 */
class VibeCodingToolServiceClass {
  /**
   * Detect if a message contains tool execution intent
   */
  detectToolIntent(message: string): ToolDetectionResult {
    const lowerMessage = message.toLowerCase().trim();

    // Pattern matching for different tools
    // MB.MD Pattern 98: Subject-specific searches should come BEFORE generic repo info
    const patterns: Array<{
      pattern: RegExp;
      tool: ToolName;
      extractParams: (
        match: RegExpMatchArray,
        msg: string,
      ) => Record<string, any>;
      baseConfidence: number;
    }> = [
      // PRIORITY 1: Subject-specific code search - "tell me about X system/code/feature on/in repo/codebase"
      // This MUST come before GitHub patterns to avoid false matches
      {
        pattern:
          /(?:tell\s+me\s+about|explain|show\s+me|find|search\s+for|look\s+for|what\s+(?:is|are)\s+(?:the|our)?)\s+(?:the\s+)?(?:our\s+)?([\w\-]+(?:\s+[\w\-]+)?)\s+(?:system|code|feature|implementation|logic|component|service|module|function)\s+(?:on|in|from)\s+(?:the\s+)?(?:our\s+)?(?:repo|repository|codebase|code|github)/i,
        tool: "grepFiles",
        extractParams: (match) => ({ searchTerm: match[1] }),
        baseConfidence: 0.95, // Highest priority - specific subject search
      },
      // PRIORITY 2: Generic grep with subject - "how does X work in our code"
      {
        pattern:
          /(?:how\s+does|where\s+is|find)\s+(?:the\s+)?([\w\-]+(?:\s+[\w\-]+)?)\s+(?:work|handled|implemented|defined)\s+(?:in\s+)?(?:the\s+)?(?:our\s+)?(?:repo|codebase|code|github)?/i,
        tool: "grepFiles",
        extractParams: (match) => ({ searchTerm: match[1] }),
        baseConfidence: 0.9,
      },
      // GitHub patterns - requires action verbs, ONLY for generic repo info
      // MB.MD Pattern 98: Added "query" and broader matching for proactive tool usage
      {
        pattern:
          /(?:(?:show|get|check|view|look at|display|query|search|find|what(?:'s| is))\s+(?:the\s+)?(?:my|our)?\s*github(?:\s+(?:info|repos?|account|details|status|repo))?)|(?:(?:what(?:'s| is)|show|get|query)\s+(?:the\s+)?(?:our|my)\s+github\s*(?:repo|repository|account)?(?:\s*name)?)|(?:github\s+(?:info|status|repos?))|(?:query\s+(?:the\s+)?(?:our|my)\s+(?:github\s+)?repo(?:\b|$)(?!\s+\w))/i,
        tool: "getGitHubInfo",
        extractParams: () => ({}),
        baseConfidence: 0.9, // Higher confidence for explicit GitHub requests
      },
      // Repo identification patterns - "what repo", "which repo" (NOT "X on our repo")
      {
        pattern:
          /(?:what|which)\s+(?:repo|repository)\s+(?:is this|are we|am I|is|this)|(?:^(?:our|my|the|this)\s+repo(?:sitory)?(?:\s+(?:name|info|details))?$)|(?:query\s+(?:our|my|the)\s+repo$)/i,
        tool: "getGitHubInfo",
        extractParams: () => ({}),
        baseConfidence: 0.85,
      },
      // MB.MD: "Can you see the repo" patterns - tests if Mr. Blue has access
      {
        pattern:
          /(?:can you|do you)\s+(?:see|access|read|view|look at)\s+(?:the\s+)?(?:our\s+)?(?:repo|repository|codebase|code|files|project)/i,
        tool: "getProjectStructure",
        extractParams: () => ({}),
        baseConfidence: 0.9,
      },
      // MB.MD: "Do you have access to" patterns
      {
        pattern:
          /(?:do you have|have you got)\s+(?:access|visibility)\s+(?:to\s+)?(?:the\s+)?(?:our\s+)?(?:repo|repository|codebase|code|files|project)/i,
        tool: "getProjectStructure",
        extractParams: () => ({}),
        baseConfidence: 0.9,
      },
      // MB.MD: "Look at the repo" / "check the codebase" patterns
      {
        pattern:
          /(?:look at|check|examine|browse|explore)\s+(?:the\s+)?(?:our\s+)?(?:repo|repository|codebase|code|project)\b/i,
        tool: "getProjectStructure",
        extractParams: () => ({}),
        baseConfidence: 0.85,
      },
      // Git status patterns
      {
        pattern:
          /git\s*status|what(?:'s| is)\s*(?:the\s*)?(?:git|repo)\s*status|uncommitted\s*changes/i,
        tool: "getGitStatus",
        extractParams: () => ({}),
        baseConfidence: 0.9,
      },
      // Read file patterns - handles paths with spaces (quoted or unquoted)
      {
        pattern:
          /(?:read|show|open|view|cat|display)\s+(?:the\s+)?(?:file\s+)?(?:at\s+)?(?:["']([^"']+)["']|([\/\w\.\-]+(?:\s+[\/\w\.\-]+)*\.[a-zA-Z]+))/i,
        tool: "readFile",
        extractParams: (match) => ({ filePath: match[1] || match[2] }),
        baseConfidence: 0.9,
      },
      // List directory patterns
      {
        pattern:
          /(?:list|ls|show|what's in)\s+(?:the\s+)?(?:directory|folder|dir)\s*([\/\w\.\-]*)?/i,
        tool: "listDirectory",
        extractParams: (match) => ({ dirPath: match[1] || "." }),
        baseConfidence: 0.85,
      },
      // Search files patterns
      {
        pattern:
          /(?:find|search for|locate)\s+(?:files?\s+)?(?:matching|named|called)\s+["\']?([^\s"']+)["\']?/i,
        tool: "searchFiles",
        extractParams: (match) => ({ pattern: match[1] }),
        baseConfidence: 0.85,
      },
      // Grep patterns
      {
        pattern:
          /(?:grep|search|find)\s+(?:for\s+)?["\']?([^"']+)["\']?\s+(?:in|across)\s+(?:the\s+)?(?:codebase|files|code)/i,
        tool: "grepFiles",
        extractParams: (match) => ({ searchTerm: match[1] }),
        baseConfidence: 0.85,
      },
      // Project structure patterns
      {
        pattern:
          /(?:project\s*structure|codebase\s*overview|what(?:'s| is)\s*(?:the\s*)?project\s*layout)/i,
        tool: "getProjectStructure",
        extractParams: () => ({}),
        baseConfidence: 0.85,
      },
    ];

    // Try each pattern
    for (const { pattern, tool, extractParams, baseConfidence } of patterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          shouldExecuteTool: true,
          suggestedTool: tool,
          confidence: baseConfidence,
          parameters: extractParams(match, message),
        };
      }
    }

    // No tool detected
    return {
      shouldExecuteTool: false,
      suggestedTool: null,
      confidence: 0,
      parameters: {},
    };
  }

  /**
   * Execute a tool by name with given parameters
   */
  async executeTool(
    toolName: ToolName,
    parameters: Record<string, any>,
  ): Promise<ToolResult> {
    const tool = VIBECODING_TOOLS[toolName];
    if (!tool) {
      return {
        success: false,
        tool: toolName,
        data: null,
        error: `Unknown tool: ${toolName}`,
      };
    }

    try {
      // Call the tool handler with appropriate parameters
      switch (toolName) {
        case "readFile":
          return await readFile(parameters.filePath);
        case "writeFile":
          return await writeFile(parameters.filePath, parameters.content);
        case "listDirectory":
          return await listDirectory(parameters.dirPath);
        case "searchFiles":
          return await searchFiles(parameters.pattern, parameters.directory);
        case "grepFiles":
          return await grepFiles(parameters.searchTerm, parameters.directory);
        case "executeCommand":
          return await executeCommand(parameters.command);
        case "getGitHubInfo":
          return await getGitHubInfo();
        case "getGitHubRepo":
          return await getGitHubRepo(parameters.owner, parameters.repo);
        case "getGitStatus":
          return await getGitStatus();
        case "getProjectStructure":
          return await getProjectStructure();
        default:
          return {
            success: false,
            tool: toolName,
            data: null,
            error: `Unhandled tool: ${toolName}`,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        tool: toolName,
        data: null,
        error: error.message,
      };
    }
  }
}

/**
 * Format tool results into rich HTML for display in chat UI
 */
export function formatToolResponse(
  toolName: string,
  result: ToolResult,
): string {
  if (!result.success) {
    return `<div class="tool-error"><strong>Error:</strong> ${escapeHtml(result.error || "Unknown error occurred")}</div>`;
  }

  const data = result.data;

  switch (toolName) {
    case "getGitHubInfo": {
      let html = '<div class="tool-result github-info">';
      html += "<h3>GitHub Repository</h3>";
      if (data.mainRepository) {
        const repo = data.mainRepository;
        html += `<div class="repo-header"><strong>${escapeHtml(repo.fullName)}</strong></div>`;
        html += `<p class="repo-desc">${escapeHtml(repo.description || "No description")}</p>`;
        html += '<ul class="repo-stats">';
        html += `<li><strong>Language:</strong> ${escapeHtml(repo.language || "Unknown")}</li>`;
        html += `<li><strong>Stars:</strong> ${repo.stars} | <strong>Forks:</strong> ${repo.forks}</li>`;
        html += `<li><strong>Open Issues:</strong> ${repo.openIssues}</li>`;
        html += `<li><strong>Default Branch:</strong> ${escapeHtml(repo.defaultBranch)}</li>`;
        html += `<li><a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener">View on GitHub</a></li>`;
        html += "</ul>";
      }
      if (data.recentCommits?.length > 0) {
        html += '<h4>Recent Commits</h4><ul class="commit-list">';
        data.recentCommits.slice(0, 5).forEach((commit: any) => {
          const date = new Date(commit.date).toLocaleDateString();
          html += `<li><code>${escapeHtml(commit.sha)}</code> - ${escapeHtml(commit.message)} <em>(${escapeHtml(commit.author)}, ${date})</em></li>`;
        });
        html += "</ul>";
      }
      if (data.openIssues?.length > 0) {
        html += '<h4>Open Issues</h4><ul class="issue-list">';
        data.openIssues.slice(0, 5).forEach((issue: any) => {
          html += `<li><strong>#${issue.number}</strong> ${escapeHtml(issue.title)}</li>`;
        });
        html += "</ul>";
      }
      html += "</div>";
      return html;
    }

    case "grepFiles": {
      let html = '<div class="tool-result search-results">';
      html += `<h3>Search Results for "${escapeHtml(data.searchTerm)}"</h3>`;
      html += `<p><strong>Found ${data.count} match${data.count !== 1 ? "es" : ""}</strong></p>`;
      if (data.matchingFiles?.length > 0) {
        html += '<h4>Files:</h4><ul class="file-list">';
        data.matchingFiles.forEach((file: string) => {
          html += `<li><code>${escapeHtml(file)}</code></li>`;
        });
        html += "</ul>";
      }
      if (data.matchingLines) {
        html += "<h4>Matches:</h4>";
        html += `<pre class="code-block">${escapeHtml(data.matchingLines)}</pre>`;
      }
      html += "</div>";
      return html;
    }

    case "readFile": {
      let html = '<div class="tool-result file-content">';
      html += `<h3>File: <code>${escapeHtml(data.path)}</code></h3>`;
      html += `<p><strong>Lines:</strong> ${data.lines}</p>`;
      const content =
        data.content.length > 2000
          ? data.content.slice(0, 2000) + "\n... (truncated)"
          : data.content;
      html += `<pre class="code-block">${escapeHtml(content)}</pre>`;
      html += "</div>";
      return html;
    }

    case "listDirectory": {
      let html = '<div class="tool-result directory-listing">';
      html += `<h3>Directory: <code>${escapeHtml(data.path)}</code></h3>`;
      if (data.directories?.length > 0) {
        html += '<h4>Folders:</h4><ul class="folder-list">';
        data.directories.forEach(
          (dir: string) => (html += `<li>📁 ${escapeHtml(dir)}/</li>`),
        );
        html += "</ul>";
      }
      if (data.files?.length > 0) {
        html += '<h4>Files:</h4><ul class="file-list">';
        data.files
          .slice(0, 20)
          .forEach(
            (file: string) => (html += `<li>📄 ${escapeHtml(file)}</li>`),
          );
        if (data.files.length > 20)
          html += `<li><em>...and ${data.files.length - 20} more files</em></li>`;
        html += "</ul>";
      }
      html += "</div>";
      return html;
    }

    case "getGitStatus": {
      let html = '<div class="tool-result git-status">';
      html += "<h3>Git Status</h3>";
      html += `<p><strong>Branch:</strong> ${escapeHtml(data.branch || "unknown")}</p>`;
      if (data.staged?.length > 0) {
        html += '<h4>Staged Changes:</h4><ul class="staged-list">';
        data.staged.forEach(
          (file: string) => (html += `<li>✅ ${escapeHtml(file)}</li>`),
        );
        html += "</ul>";
      }
      if (data.modified?.length > 0) {
        html += '<h4>Modified Files:</h4><ul class="modified-list">';
        data.modified.forEach(
          (file: string) => (html += `<li>📝 ${escapeHtml(file)}</li>`),
        );
        html += "</ul>";
      }
      if (data.untracked?.length > 0) {
        html += '<h4>Untracked Files:</h4><ul class="untracked-list">';
        data.untracked.forEach(
          (file: string) => (html += `<li>❓ ${escapeHtml(file)}</li>`),
        );
        html += "</ul>";
      }
      if (
        !data.staged?.length &&
        !data.modified?.length &&
        !data.untracked?.length
      ) {
        html += "<p><em>Working directory is clean</em></p>";
      }
      html += "</div>";
      return html;
    }

    case "getProjectStructure": {
      let html = '<div class="tool-result project-structure">';
      html += "<h3>Project Structure</h3>";
      if (data.directories?.length > 0) {
        html += '<h4>Main Directories:</h4><ul class="folder-list">';
        data.directories
          .slice(0, 15)
          .forEach(
            (dir: string) => (html += `<li>📁 ${escapeHtml(dir)}/</li>`),
          );
        html += "</ul>";
      }
      if (data.files?.length > 0) {
        html += '<h4>Root Files:</h4><ul class="file-list">';
        data.files
          .slice(0, 10)
          .forEach(
            (file: string) => (html += `<li>📄 ${escapeHtml(file)}</li>`),
          );
        html += "</ul>";
      }
      html += "</div>";
      return html;
    }

    case "executeCommand": {
      let html = '<div class="tool-result command-output">';
      html += "<h3>Command Output</h3>";
      html += `<p><strong>Command:</strong> <code>${escapeHtml(data.command)}</code></p>`;
      if (data.stdout) {
        const output =
          data.stdout.length > 1500
            ? data.stdout.slice(0, 1500) + "\n... (truncated)"
            : data.stdout;
        html += `<pre class="code-block">${escapeHtml(output)}</pre>`;
      }
      if (data.stderr) {
        html += "<h4>Errors:</h4>";
        html += `<pre class="code-block error">${escapeHtml(data.stderr)}</pre>`;
      }
      html += "</div>";
      return html;
    }

    case "writeFile": {
      let html = '<div class="tool-result file-written">';
      html += "<h3>File Written</h3>";
      html += `<p><strong>Path:</strong> <code>${escapeHtml(data.path)}</code></p>`;
      html += `<p><strong>Lines:</strong> ${data.lines}</p>`;
      html += "<p><em>File saved successfully!</em></p>";
      html += "</div>";
      return html;
    }

    default:
      return `<div class="tool-result"><pre class="code-block">${escapeHtml(JSON.stringify(data, null, 2).slice(0, 2000))}</pre></div>`;
  }
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Export singleton instance
export const vibeCodingToolService = new VibeCodingToolServiceClass();

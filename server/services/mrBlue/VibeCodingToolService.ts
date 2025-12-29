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

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { getUncachableGitHubClient, getRepositoryInfo, getLatestCommit } from '../../lib/github-client';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.resolve(__dirname, '../../..');

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
    const content = await fs.readFile(fullPath, 'utf-8');
    return {
      success: true,
      tool: 'readFile',
      data: { path: filePath, content, lines: content.split('\n').length }
    };
  } catch (error: any) {
    return {
      success: false,
      tool: 'readFile',
      data: null,
      error: error.message
    };
  }
}

/**
 * TOOL: Write/create a project file
 */
export async function writeFile(filePath: string, content: string): Promise<ToolResult> {
  try {
    const fullPath = path.join(basePath, filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    return {
      success: true,
      tool: 'writeFile',
      data: { path: filePath, bytesWritten: content.length }
    };
  } catch (error: any) {
    return {
      success: false,
      tool: 'writeFile',
      data: null,
      error: error.message
    };
  }
}

/**
 * TOOL: List directory contents
 */
export async function listDirectory(dirPath: string = '.'): Promise<ToolResult> {
  try {
    const fullPath = path.join(basePath, dirPath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const files = entries.map(e => ({
      name: e.name,
      type: e.isDirectory() ? 'directory' : 'file'
    }));
    return {
      success: true,
      tool: 'listDirectory',
      data: { path: dirPath, entries: files }
    };
  } catch (error: any) {
    return {
      success: false,
      tool: 'listDirectory',
      data: null,
      error: error.message
    };
  }
}

/**
 * TOOL: Search for files by pattern
 */
export async function searchFiles(pattern: string, directory: string = '.'): Promise<ToolResult> {
  try {
    const { stdout } = await execAsync(`find ${directory} -name "${pattern}" -type f 2>/dev/null | head -50`, {
      cwd: basePath,
      timeout: 10000
    });
    const files = stdout.trim().split('\n').filter(f => f);
    return {
      success: true,
      tool: 'searchFiles',
      data: { pattern, files, count: files.length }
    };
  } catch (error: any) {
    return {
      success: false,
      tool: 'searchFiles',
      data: null,
      error: error.message
    };
  }
}

/**
 * TOOL: Search file contents (grep)
 */
export async function grepFiles(searchTerm: string, directory: string = '.'): Promise<ToolResult> {
  try {
    // Always check mb.md first for knowledge/pattern searches
    let mbmdLines = '';
    console.log(`[grepFiles] Searching for "${searchTerm}" in ${directory}, basePath: ${basePath}`);
    try {
      const { stdout: mbmd } = await execAsync(
        `grep -n "${searchTerm}" mb.md 2>&1 | head -30`,
        { cwd: basePath, timeout: 10000 }
      );
      mbmdLines = mbmd.trim();
      console.log(`[grepFiles] mb.md grep result: ${mbmdLines.substring(0, 100)}...`);
    } catch (e: any) {
      console.log(`[grepFiles] mb.md grep error: ${e.message}`);
    }
    
    // Then search code files (wrap in try-catch as grep exits with code 1 when no matches)
    let files: string[] = [];
    try {
      const { stdout } = await execAsync(
        `grep -r -l --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.md" --include="*.json" "${searchTerm}" ${directory} 2>/dev/null | head -20`,
        { cwd: basePath, timeout: 10000 }
      );
      files = stdout.trim().split('\n').filter(f => f);
    } catch {
      // No matches in code files - that's okay
    }
    
    // If we found matches in mb.md, include those lines
    if (mbmdLines) {
      return {
        success: true,
        tool: 'grepFiles',
        data: { searchTerm, matchingFiles: files.length > 0 ? files : ['mb.md'], count: files.length || 1, matchingLines: mbmdLines }
      };
    }
    
    return {
      success: true,
      tool: 'grepFiles',
      data: { searchTerm, matchingFiles: files, count: files.length }
    };
  } catch (error: any) {
    return {
      success: false,
      tool: 'grepFiles',
      data: null,
      error: error.message
    };
  }
}

/**
 * TOOL: Execute shell command (safe, limited commands only)
 */
export async function executeCommand(command: string): Promise<ToolResult> {
  const allowedCommands = ['ls', 'cat', 'head', 'tail', 'grep', 'find', 'wc', 'git', 'npm', 'node'];
  const firstWord = command.split(' ')[0];
  
  if (!allowedCommands.includes(firstWord)) {
    return {
      success: false,
      tool: 'executeCommand',
      data: null,
      error: `Command '${firstWord}' not allowed. Allowed: ${allowedCommands.join(', ')}`
    };
  }
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: basePath,
      timeout: 30000,
      maxBuffer: 1024 * 1024
    });
    return {
      success: true,
      tool: 'executeCommand',
      data: { command, stdout: stdout.substring(0, 5000), stderr: stderr.substring(0, 1000) }
    };
  } catch (error: any) {
    return {
      success: false,
      tool: 'executeCommand',
      data: null,
      error: error.message
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
    const MAIN_REPO_OWNER = 'MundoTango';
    const MAIN_REPO_NAME = 'Mundo-Tango';
    
    try {
      const { data: mainRepo } = await octokit.repos.get({
        owner: MAIN_REPO_OWNER,
        repo: MAIN_REPO_NAME
      });
      
      // Get recent commits from main repo
      const { data: commits } = await octokit.repos.listCommits({
        owner: MAIN_REPO_OWNER,
        repo: MAIN_REPO_NAME,
        per_page: 5
      });
      
      // Get open issues/PRs count
      const { data: issues } = await octokit.issues.listForRepo({
        owner: MAIN_REPO_OWNER,
        repo: MAIN_REPO_NAME,
        state: 'open',
        per_page: 10
      });
      
      return {
        success: true,
        tool: 'getGitHubInfo',
        data: {
          mainRepository: {
            name: mainRepo.name,
            fullName: mainRepo.full_name,
            description: mainRepo.description || 'Mundo Tango - Global Tango Community Platform',
            language: mainRepo.language,
            stars: mainRepo.stargazers_count,
            forks: mainRepo.forks_count,
            openIssues: mainRepo.open_issues_count,
            defaultBranch: mainRepo.default_branch,
            url: mainRepo.html_url,
            createdAt: mainRepo.created_at,
            updatedAt: mainRepo.updated_at
          },
          recentCommits: commits.slice(0, 5).map(c => ({
            sha: c.sha.substring(0, 7),
            message: c.commit.message.split('\n')[0],
            author: c.commit.author?.name || 'Unknown',
            date: c.commit.author?.date
          })),
          openIssues: issues.slice(0, 5).map(i => ({
            number: i.number,
            title: i.title,
            state: i.state,
            labels: i.labels.map((l: any) => typeof l === 'string' ? l : l.name)
          }))
        }
      };
    } catch (repoError: any) {
      // Fallback: If main repo is inaccessible (403/404), list authenticated user's repos
      console.log('[VibeCoding] Main repo inaccessible, falling back to user repos:', repoError.message);
      
      const { data: user } = await octokit.users.getAuthenticated();
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 10
      });
      
      return {
        success: true,
        tool: 'getGitHubInfo',
        data: {
          note: 'Main repository (MundoTango/Mundo-Tango) not accessible. Showing authenticated user repos.',
          user: {
            login: user.login,
            name: user.name,
            email: user.email,
            publicRepos: user.public_repos,
            followers: user.followers
          },
          recentRepos: repos.map(r => ({
            name: r.name,
            fullName: r.full_name,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            updatedAt: r.updated_at,
            url: r.html_url
          }))
        }
      };
    }
  } catch (error: any) {
    console.error('[VibeCoding] GitHub API error:', error.message);
    return {
      success: false,
      tool: 'getGitHubInfo',
      data: null,
      error: error.message
    };
  }
}

/**
 * TOOL: Get specific GitHub repo details
 */
export async function getGitHubRepo(owner: string, repo: string): Promise<ToolResult> {
  try {
    const repoInfo = await getRepositoryInfo(owner, repo);
    const latestCommit = await getLatestCommit(owner, repo);
    
    return {
      success: true,
      tool: 'getGitHubRepo',
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
        url: repoInfo.html_url
      }
    };
  } catch (error: any) {
    return {
      success: false,
      tool: 'getGitHubRepo',
      data: null,
      error: error.message
    };
  }
}

/**
 * TOOL: Get local git status
 */
export async function getGitStatus(): Promise<ToolResult> {
  try {
    const { stdout: status } = await execAsync('git status --short', { cwd: basePath });
    const { stdout: branch } = await execAsync('git branch --show-current', { cwd: basePath });
    const { stdout: log } = await execAsync('git log --oneline -5', { cwd: basePath });
    
    return {
      success: true,
      tool: 'getGitStatus',
      data: {
        branch: branch.trim(),
        status: status.trim().split('\n').filter(l => l),
        recentCommits: log.trim().split('\n')
      }
    };
  } catch (error: any) {
    return {
      success: false,
      tool: 'getGitStatus',
      data: null,
      error: error.message
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
      { cwd: basePath }
    );
    
    const packageJson = await fs.readFile(path.join(basePath, 'package.json'), 'utf-8');
    const pkg = JSON.parse(packageJson);
    
    return {
      success: true,
      tool: 'getProjectStructure',
      data: {
        name: pkg.name,
        version: pkg.version,
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        scripts: Object.keys(pkg.scripts || {}),
        sourceFiles: stdout.trim().split('\n').filter(f => f)
      }
    };
  } catch (error: any) {
    return {
      success: false,
      tool: 'getProjectStructure',
      data: null,
      error: error.message
    };
  }
}

/**
 * Available tools registry
 */
export const VIBECODING_TOOLS = {
  readFile: { name: 'readFile', description: 'Read contents of a project file', handler: readFile },
  writeFile: { name: 'writeFile', description: 'Write/create a project file', handler: writeFile },
  listDirectory: { name: 'listDirectory', description: 'List directory contents', handler: listDirectory },
  searchFiles: { name: 'searchFiles', description: 'Search for files by pattern', handler: searchFiles },
  grepFiles: { name: 'grepFiles', description: 'Search file contents', handler: grepFiles },
  executeCommand: { name: 'executeCommand', description: 'Execute safe shell commands', handler: executeCommand },
  getGitHubInfo: { name: 'getGitHubInfo', description: 'Get GitHub account and repos', handler: getGitHubInfo },
  getGitHubRepo: { name: 'getGitHubRepo', description: 'Get specific GitHub repo details', handler: getGitHubRepo },
  getGitStatus: { name: 'getGitStatus', description: 'Get local git status', handler: getGitStatus },
  getProjectStructure: { name: 'getProjectStructure', description: 'Get project overview', handler: getProjectStructure },
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
    const patterns: Array<{
      pattern: RegExp;
      tool: ToolName;
      extractParams: (match: RegExpMatchArray, msg: string) => Record<string, any>;
      baseConfidence: number;
    }> = [
      // GitHub patterns - requires action verbs to avoid false positives
      {
        pattern: /(?:(?:show|get|check|view|look at|display|what(?:'s| is))\s+(?:the\s+)?(?:my|our)?\s*github(?:\s+(?:info|repos?|account|details|status))?)|(?:(?:what(?:'s| is)|show|get)\s+(?:the\s+)?(?:our|my)\s+github\s*(?:repo|repository|account)?(?:\s*name)?)|(?:github\s+(?:info|status|repos?))/i,
        tool: 'getGitHubInfo',
        extractParams: () => ({}),
        baseConfidence: 0.85
      },
      // Repo identification patterns - "what repo", "which repo", "our repo"
      {
        pattern: /(?:what|which)\s+(?:repo|repository)\s+(?:is this|are we|am I|is|this)|(?:(?:our|my|the|this)\s+repo(?:sitory)?(?:\s+(?:name|info|details))?)/i,
        tool: 'getGitHubInfo',
        extractParams: () => ({}),
        baseConfidence: 0.8
      },
      // Git status patterns  
      {
        pattern: /git\s*status|what(?:'s| is)\s*(?:the\s*)?(?:git|repo)\s*status|uncommitted\s*changes/i,
        tool: 'getGitStatus',
        extractParams: () => ({}),
        baseConfidence: 0.9
      },
      // Read file patterns - handles paths with spaces (quoted or unquoted)
      {
        pattern: /(?:read|show|open|view|cat|display)\s+(?:the\s+)?(?:file\s+)?(?:at\s+)?(?:["']([^"']+)["']|([\/\w\.\-]+(?:\s+[\/\w\.\-]+)*\.[a-zA-Z]+))/i,
        tool: 'readFile',
        extractParams: (match) => ({ filePath: match[1] || match[2] }),
        baseConfidence: 0.9
      },
      // List directory patterns
      {
        pattern: /(?:list|ls|show|what's in)\s+(?:the\s+)?(?:directory|folder|dir)\s*([\/\w\.\-]*)?/i,
        tool: 'listDirectory',
        extractParams: (match) => ({ dirPath: match[1] || '.' }),
        baseConfidence: 0.85
      },
      // Search files patterns
      {
        pattern: /(?:find|search for|locate)\s+(?:files?\s+)?(?:matching|named|called)\s+["\']?([^\s"']+)["\']?/i,
        tool: 'searchFiles',
        extractParams: (match) => ({ pattern: match[1] }),
        baseConfidence: 0.85
      },
      // Grep patterns
      {
        pattern: /(?:grep|search|find)\s+(?:for\s+)?["\']?([^"']+)["\']?\s+(?:in|across)\s+(?:the\s+)?(?:codebase|files|code)/i,
        tool: 'grepFiles',
        extractParams: (match) => ({ searchTerm: match[1] }),
        baseConfidence: 0.85
      },
      // Project structure patterns
      {
        pattern: /(?:project\s*structure|codebase\s*overview|what(?:'s| is)\s*(?:the\s*)?project\s*layout)/i,
        tool: 'getProjectStructure',
        extractParams: () => ({}),
        baseConfidence: 0.85
      }
    ];
    
    // Try each pattern
    for (const { pattern, tool, extractParams, baseConfidence } of patterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          shouldExecuteTool: true,
          suggestedTool: tool,
          confidence: baseConfidence,
          parameters: extractParams(match, message)
        };
      }
    }
    
    // No tool detected
    return {
      shouldExecuteTool: false,
      suggestedTool: null,
      confidence: 0,
      parameters: {}
    };
  }
  
  /**
   * Execute a tool by name with given parameters
   */
  async executeTool(toolName: ToolName, parameters: Record<string, any>): Promise<ToolResult> {
    const tool = VIBECODING_TOOLS[toolName];
    if (!tool) {
      return {
        success: false,
        tool: toolName,
        data: null,
        error: `Unknown tool: ${toolName}`
      };
    }
    
    try {
      // Call the tool handler with appropriate parameters
      switch (toolName) {
        case 'readFile':
          return await readFile(parameters.filePath);
        case 'writeFile':
          return await writeFile(parameters.filePath, parameters.content);
        case 'listDirectory':
          return await listDirectory(parameters.dirPath);
        case 'searchFiles':
          return await searchFiles(parameters.pattern, parameters.directory);
        case 'grepFiles':
          return await grepFiles(parameters.searchTerm, parameters.directory);
        case 'executeCommand':
          return await executeCommand(parameters.command);
        case 'getGitHubInfo':
          return await getGitHubInfo();
        case 'getGitHubRepo':
          return await getGitHubRepo(parameters.owner, parameters.repo);
        case 'getGitStatus':
          return await getGitStatus();
        case 'getProjectStructure':
          return await getProjectStructure();
        default:
          return {
            success: false,
            tool: toolName,
            data: null,
            error: `Unhandled tool: ${toolName}`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        tool: toolName,
        data: null,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const vibeCodingToolService = new VibeCodingToolServiceClass();

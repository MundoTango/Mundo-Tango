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
import { getUncachableGitHubClient, getRepositoryInfo, getLatestCommit } from '../../lib/github-client';

const execAsync = promisify(exec);
const basePath = process.cwd();

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
    const { stdout } = await execAsync(
      `grep -r -l --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "${searchTerm}" ${directory} 2>/dev/null | head -20`,
      { cwd: basePath, timeout: 10000 }
    );
    const files = stdout.trim().split('\n').filter(f => f);
    return {
      success: true,
      tool: 'grepFiles',
      data: { searchTerm, matchingFiles: files, count: files.length }
    };
  } catch (error: any) {
    return {
      success: true,
      tool: 'grepFiles',
      data: { searchTerm, matchingFiles: [], count: 0 }
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
 */
export async function getGitHubInfo(): Promise<ToolResult> {
  try {
    const octokit = await getUncachableGitHubClient();
    
    const { data: user } = await octokit.users.getAuthenticated();
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 10
    });
    
    return {
      success: true,
      tool: 'getGitHubInfo',
      data: {
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
  } catch (error: any) {
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

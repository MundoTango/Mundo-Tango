/**
 * MR. BLUE TOOL SCHEMAS
 * MB.MD Pattern 97 - Tool definitions for Anthropic function calling
 *
 * These schemas define the tools that Claude can use during conversation.
 * Each tool maps to a handler in VibeCodingToolService.
 */

import type { Tool } from '@anthropic-ai/sdk/resources/messages';

/**
 * Tool schemas for Anthropic Claude function calling
 * Compatible with Anthropic's tool_use API
 */
export const MR_BLUE_TOOLS: Tool[] = [
  {
    name: "readFile",
    description: "Read the contents of a file in the project. Use this to examine source code, configuration files, or documentation.",
    input_schema: {
      type: "object" as const,
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file relative to project root (e.g., 'server/routes.ts', 'package.json')"
        }
      },
      required: ["filePath"]
    }
  },
  {
    name: "writeFile",
    description: "Create or overwrite a file in the project. Use this to generate new code or modify existing files.",
    input_schema: {
      type: "object" as const,
      properties: {
        filePath: {
          type: "string",
          description: "Path to the file relative to project root"
        },
        content: {
          type: "string",
          description: "The full content to write to the file"
        }
      },
      required: ["filePath", "content"]
    }
  },
  {
    name: "listDirectory",
    description: "List the contents of a directory in the project. Use this to explore the project structure.",
    input_schema: {
      type: "object" as const,
      properties: {
        dirPath: {
          type: "string",
          description: "Path to the directory relative to project root. Use '.' for root directory."
        }
      },
      required: []
    }
  },
  {
    name: "searchFiles",
    description: "Search for files matching a pattern (glob). Use this to find files by name or extension.",
    input_schema: {
      type: "object" as const,
      properties: {
        pattern: {
          type: "string",
          description: "Glob pattern to match files (e.g., '*.tsx', 'Auth*.ts', 'package.json')"
        },
        directory: {
          type: "string",
          description: "Directory to search in (default: '.')"
        }
      },
      required: ["pattern"]
    }
  },
  {
    name: "grepFiles",
    description: "Search for a text pattern in file contents across the codebase. Use this to find where code, functions, or patterns are used.",
    input_schema: {
      type: "object" as const,
      properties: {
        searchTerm: {
          type: "string",
          description: "Text or regex pattern to search for in file contents"
        },
        directory: {
          type: "string",
          description: "Directory to search in (default: '.')"
        }
      },
      required: ["searchTerm"]
    }
  },
  {
    name: "executeCommand",
    description: "Execute a safe shell command. Limited to: ls, cat, head, tail, grep, find, wc, git, npm, node",
    input_schema: {
      type: "object" as const,
      properties: {
        command: {
          type: "string",
          description: "The shell command to execute (must start with an allowed command)"
        }
      },
      required: ["command"]
    }
  },
  {
    name: "getGitHubInfo",
    description: "Get information about the GitHub repository including recent commits, open issues, and repo stats.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: []
    }
  },
  {
    name: "getGitHubRepo",
    description: "Get details about a specific GitHub repository.",
    input_schema: {
      type: "object" as const,
      properties: {
        owner: {
          type: "string",
          description: "GitHub username or organization"
        },
        repo: {
          type: "string",
          description: "Repository name"
        }
      },
      required: ["owner", "repo"]
    }
  },
  {
    name: "getGitStatus",
    description: "Get the current git status including branch, staged changes, modified files, and recent commits.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: []
    }
  },
  {
    name: "getProjectStructure",
    description: "Get an overview of the project including package.json info, dependencies, scripts, and source files.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: []
    }
  }
];

/**
 * Tool names type for type safety
 */
export type MrBlueToolName =
  | "readFile"
  | "writeFile"
  | "listDirectory"
  | "searchFiles"
  | "grepFiles"
  | "executeCommand"
  | "getGitHubInfo"
  | "getGitHubRepo"
  | "getGitStatus"
  | "getProjectStructure";

/**
 * Get tool by name
 */
export function getToolByName(name: string): Tool | undefined {
  return MR_BLUE_TOOLS.find(t => t.name === name);
}

/**
 * Get subset of tools based on user tier/permissions
 * MB.MD: Tools are ONLY available to god-level users (roleLevel >= 8)
 */
export function getToolsForUser(roleLevel: number): Tool[] {
  if (roleLevel >= 8) {
    // God-level: All tools
    return MR_BLUE_TOOLS;
  }
  if (roleLevel >= 6) {
    // Elite level: Read-only tools
    return MR_BLUE_TOOLS.filter(t =>
      ['readFile', 'listDirectory', 'searchFiles', 'grepFiles', 'getGitStatus', 'getProjectStructure'].includes(t.name)
    );
  }
  // Regular users: No tools
  return [];
}

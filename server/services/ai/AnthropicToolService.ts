/**
 * ANTHROPIC TOOL SERVICE
 * MB.MD Pattern 97 - Claude function calling with VibeCoding tools
 *
 * Enables Claude to use tools during conversation:
 * - Reads tool_use blocks from Claude's response
 * - Executes tools via VibeCodingToolService
 * - Returns tool results to Claude for final response
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  MessageParam,
  ContentBlock,
  ToolUseBlock,
  ToolResultBlockParam,
  TextBlock
} from '@anthropic-ai/sdk/resources/messages';
import { MR_BLUE_TOOLS, getToolsForUser, type MrBlueToolName } from '../mrBlue/MrBlueToolSchemas';
import { vibeCodingToolService, type ToolResult } from '../mrBlue/VibeCodingToolService';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Model configuration
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const MAX_TOOL_ITERATIONS = 5; // Prevent infinite tool loops

export interface ToolCallContext {
  userId: number;
  roleLevel: number;
  sessionId: string;
  conversationHistory?: MessageParam[];
}

export interface ToolCallResponse {
  content: string;
  toolsUsed: Array<{
    tool: string;
    input: Record<string, any>;
    result: ToolResult;
  }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  iterations: number;
}

/**
 * Anthropic Tool Service - Enables Claude to use Mr. Blue tools
 */
export class AnthropicToolService {
  /**
   * Chat with Claude using tools
   * Handles the tool_use → execute → tool_result loop
   */
  static async chatWithTools(
    systemPrompt: string,
    userMessage: string,
    context: ToolCallContext
  ): Promise<ToolCallResponse> {
    const tools = getToolsForUser(context.roleLevel);
    const toolsUsed: ToolCallResponse['toolsUsed'] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let iterations = 0;

    // Build initial messages
    const messages: MessageParam[] = [
      ...(context.conversationHistory || []),
      { role: 'user', content: userMessage }
    ];

    console.log(`[AnthropicToolService] Starting chat with ${tools.length} tools available`);

    // Tool use loop
    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        tools: tools.length > 0 ? tools : undefined,
        messages
      });

      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;

      // Check if Claude wants to use a tool
      const toolUseBlocks = response.content.filter(
        (block): block is ToolUseBlock => block.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
        // No more tools needed - extract final text response
        const textBlocks = response.content.filter(
          (block): block is TextBlock => block.type === 'text'
        );
        const finalContent = textBlocks.map(b => b.text).join('\n');

        console.log(`[AnthropicToolService] ✅ Complete after ${iterations} iteration(s), ${toolsUsed.length} tool(s) used`);

        return {
          content: finalContent,
          toolsUsed,
          usage: {
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens
          },
          iterations
        };
      }

      // Execute each tool and collect results
      const toolResults: ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const toolName = toolUse.name as MrBlueToolName;
        const toolInput = toolUse.input as Record<string, any>;

        console.log(`[AnthropicToolService] 🔧 Executing tool: ${toolName}`, toolInput);

        try {
          const result = await vibeCodingToolService.executeTool(toolName, toolInput);

          toolsUsed.push({
            tool: toolName,
            input: toolInput,
            result
          });

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(result.success ? result.data : { error: result.error })
          });

          console.log(`[AnthropicToolService] ✅ Tool ${toolName} completed: ${result.success ? 'success' : 'failed'}`);
        } catch (error: any) {
          console.error(`[AnthropicToolService] ❌ Tool ${toolName} error:`, error);

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify({ error: error.message }),
            is_error: true
          });
        }
      }

      // Add assistant's response (with tool_use) and tool results to messages
      messages.push({
        role: 'assistant',
        content: response.content
      });
      messages.push({
        role: 'user',
        content: toolResults
      });
    }

    // Reached max iterations - return what we have
    console.warn(`[AnthropicToolService] ⚠️ Reached max iterations (${MAX_TOOL_ITERATIONS})`);

    return {
      content: "I've reached the maximum number of tool operations. Here's what I found so far based on the tools I used.",
      toolsUsed,
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens
      },
      iterations
    };
  }

  /**
   * Simple chat without tools (fallback for non-god users)
   */
  static async chatSimple(
    systemPrompt: string,
    userMessage: string,
    conversationHistory?: MessageParam[]
  ): Promise<{ content: string; usage: { inputTokens: number; outputTokens: number } }> {
    const messages: MessageParam[] = [
      ...(conversationHistory || []),
      { role: 'user', content: userMessage }
    ];

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages
    });

    const textBlocks = response.content.filter(
      (block): block is TextBlock => block.type === 'text'
    );

    return {
      content: textBlocks.map(b => b.text).join('\n'),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  }

  /**
   * Check if tools are available for a user
   */
  static hasToolAccess(roleLevel: number): boolean {
    return getToolsForUser(roleLevel).length > 0;
  }
}

// Export singleton-style functions for easier usage
export const chatWithTools = AnthropicToolService.chatWithTools.bind(AnthropicToolService);
export const chatSimple = AnthropicToolService.chatSimple.bind(AnthropicToolService);
export const hasToolAccess = AnthropicToolService.hasToolAccess.bind(AnthropicToolService);

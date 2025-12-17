/**
 * Vibecoding Router - Intelligent routing for user messages
 * Routes messages to appropriate handlers based on detected intent
 */

import { IntentDetector, type Intent } from './intentDetector';
import { VoiceCommandProcessor, type VoiceCommandContext } from '@/components/visual-editor/VoiceCommandProcessor';

export interface RouteResult {
  intent: Intent;
  success: boolean;
  message: string;
  data?: any;
  requiresAI?: boolean;
}

export class VibecodingRouter {
  private intentDetector: IntentDetector;
  private voiceCommandProcessor: VoiceCommandProcessor;
  
  constructor(context: VoiceCommandContext) {
    this.intentDetector = new IntentDetector();
    this.voiceCommandProcessor = new VoiceCommandProcessor(context);
  }
  
  /**
   * Route a message to the appropriate handler
   */
  async route(message: string): Promise<RouteResult> {
    console.log('[VibeRouter] Processing message:', message);
    
    const intent = this.intentDetector.detectIntent(message);
    console.log('[VibeRouter] Detected intent:', intent);
    
    switch (intent) {
      case 'visual_change':
        return await this.handleVisualChange(message);
      
      case 'code_generation':
        return await this.handleCodeGeneration(message);
      
      case 'command':
        return await this.handleCommand(message);
      
      case 'question':
      default:
        return await this.handleQuestion(message);
    }
  }
  
  /**
   * Handle visual change requests
   */
  private async handleVisualChange(message: string): Promise<RouteResult> {
    const change = this.intentDetector.extractVisualChange(message);
    
    if (!change) {
      return {
        intent: 'visual_change',
        success: false,
        message: 'Could not understand the visual change request',
        requiresAI: true, // Fall back to AI
      };
    }
    
    // Try to apply visual change via IframeInjector (if available)
    const injector = (window as any).iframeInjector;
    if (injector && typeof injector.applyChange === 'function') {
      try {
        await injector.applyChange({
          type: 'style',
          property: change.type,
          value: change.value,
        });
        
        console.log('[VibeRouter] Visual change applied:', change);
        
        return {
          intent: 'visual_change',
          success: true,
          message: `Applied ${change.type} change: ${change.value}`,
          data: change,
        };
      } catch (error) {
        console.error('[VibeRouter] Visual change error:', error);
        return {
          intent: 'visual_change',
          success: false,
          message: 'Failed to apply visual change',
          requiresAI: true, // Fall back to AI
        };
      }
    }
    
    // No injector available, send to AI
    return {
      intent: 'visual_change',
      success: false,
      message: 'Visual editor not available, sending to AI',
      requiresAI: true,
    };
  }
  
  /**
   * Handle code generation requests
   */
  private async handleCodeGeneration(message: string): Promise<RouteResult> {
    try {
      const response = await fetch('/api/mrblue/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          context: {
            currentPage: window.location.pathname,
            theme: 'MT Ocean',
          },
        }),
      });
      
      const result = await response.json();
      
      return {
        intent: 'code_generation',
        success: result.success,
        message: result.explanation || 'Code generated successfully',
        data: result,
      };
    } catch (error) {
      console.error('[VibeRouter] Code generation error:', error);
      return {
        intent: 'code_generation',
        success: false,
        message: 'Code generation failed',
      };
    }
  }
  
  /**
   * Handle command requests
   */
  private async handleCommand(message: string): Promise<RouteResult> {
    const success = this.voiceCommandProcessor.processCommand(message);
    
    if (success) {
      return {
        intent: 'command',
        success: true,
        message: 'Command executed successfully',
      };
    }
    
    // Command not recognized, try AI
    return {
      intent: 'command',
      success: false,
      message: 'Command not recognized, sending to AI',
      requiresAI: true,
    };
  }
  
  /**
   * Handle question requests
   */
  private async handleQuestion(message: string): Promise<RouteResult> {
    // Send to Mr. Blue AI for question answering
    return {
      intent: 'question',
      success: true,
      message: 'Sending to AI',
      requiresAI: true,
    };
  }
  
  /**
   * Update the router context
   */
  updateContext(newContext: Partial<VoiceCommandContext>) {
    this.voiceCommandProcessor.updateContext(newContext);
  }
}

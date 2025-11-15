/**
 * Voice Command Processor
 * Parses and executes voice commands for the Visual Editor
 */

export interface VoiceCommand {
  patterns: RegExp[];
  action: (matches: RegExpMatchArray | null, context: any) => void;
  description: string;
}

export interface VoiceCommandContext {
  setViewMode?: (mode: 'preview' | 'code' | 'history') => void;
  handleUndo?: () => void;
  handleApprove?: () => void;
  handleStopListening?: () => void;
  setPrompt?: (text: string) => void;
  handleSubmit?: () => void;
}

export class VoiceCommandProcessor {
  private commands: VoiceCommand[];
  private context: VoiceCommandContext;

  constructor(context: VoiceCommandContext) {
    this.context = context;
    this.commands = this.initializeCommands();
  }

  private initializeCommands(): VoiceCommand[] {
    return [
      // View switching commands
      {
        patterns: [/show\s+code/i, /view\s+code/i, /code\s+view/i],
        action: () => {
          this.context.setViewMode?.('code');
        },
        description: 'Switch to code view'
      },
      {
        patterns: [/show\s+preview/i, /view\s+preview/i, /preview\s+mode/i],
        action: () => {
          this.context.setViewMode?.('preview');
        },
        description: 'Switch to preview view'
      },
      {
        patterns: [/show\s+history/i, /view\s+history/i, /history\s+view/i],
        action: () => {
          this.context.setViewMode?.('history');
        },
        description: 'Switch to history view'
      },

      // Action commands
      {
        patterns: [/^undo$/i, /undo\s+that/i, /undo\s+last\s+change/i, /revert/i],
        action: () => {
          this.context.handleUndo?.();
        },
        description: 'Undo last change'
      },
      {
        patterns: [/apply\s+changes?/i, /save\s+to\s+codebase/i, /apply\s+to\s+codebase/i],
        action: () => {
          this.context.handleApprove?.();
        },
        description: 'Apply changes to codebase'
      },
      {
        patterns: [/stop\s+listening/i, /exit\s+voice\s+mode/i, /turn\s+off\s+voice/i],
        action: () => {
          this.context.handleStopListening?.();
        },
        description: 'Stop voice mode'
      },

      // Style commands (simple modifications)
      {
        patterns: [
          /make\s+(?:it|that|this)\s+(\w+)/i,
          /change\s+(?:color|colour)\s+to\s+(\w+)/i,
          /turn\s+(?:it|that|this)\s+(\w+)/i
        ],
        action: (matches) => {
          if (matches && matches[1]) {
            const color = matches[1];
            this.context.setPrompt?.(`Make it ${color}`);
            this.context.handleSubmit?.();
          }
        },
        description: 'Change color (e.g., "make it blue")'
      },
      {
        patterns: [
          /center\s+(?:it|that|this)/i,
          /align\s+center/i,
          /center\s+align/i
        ],
        action: () => {
          this.context.setPrompt?.('Center that');
          this.context.handleSubmit?.();
        },
        description: 'Center element'
      },
      {
        patterns: [
          /make\s+(?:it|that|this)\s+(?:bigger|larger)/i,
          /increase\s+size/i,
          /make\s+(?:it|that|this)\s+(?:smaller|tiny)/i,
          /decrease\s+size/i
        ],
        action: (matches) => {
          const isBigger = /bigger|larger|increase/i.test(matches?.[0] || '');
          this.context.setPrompt?.(isBigger ? 'Make it bigger' : 'Make it smaller');
          this.context.handleSubmit?.();
        },
        description: 'Change size'
      }
    ];
  }

  /**
   * Process a voice input and execute matching command
   * @returns true if a command was executed, false otherwise
   */
  processCommand(input: string): boolean {
    const trimmedInput = input.trim();

    for (const command of this.commands) {
      for (const pattern of command.patterns) {
        const matches = trimmedInput.match(pattern);
        if (matches) {
          console.log('[VoiceCommand] Executing command:', command.description);
          command.action(matches, this.context);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get all available commands for help/reference
   */
  getCommands(): VoiceCommand[] {
    return this.commands;
  }

  /**
   * Update context (e.g., when component state changes)
   */
  updateContext(newContext: Partial<VoiceCommandContext>) {
    this.context = { ...this.context, ...newContext };
  }
}

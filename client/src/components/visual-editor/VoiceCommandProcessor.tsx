/**
 * Voice Command Processor - Enhanced with 50+ Commands
 * Parses and executes voice commands for the Visual Editor and app-wide navigation
 */

import Fuse from 'fuse.js';
import { 
  tts, 
  speakCommandConfirmation, 
  speakUnrecognizedCommand,
  speakSuccess,
  extractColor,
  extractDirection,
  extractFont,
  extractNumber
} from '@/lib/voiceCommands';

export interface VoiceCommand {
  patterns: string[];
  action: (matches?: RegExpMatchArray | null, context?: any) => void;
  description: string;
  category: 'navigation' | 'visual-editor' | 'mr-blue' | 'content' | 'system';
  parameterized?: boolean;
}

export interface VoiceCommandContext {
  // View modes
  setViewMode?: (mode: 'preview' | 'code' | 'history') => void;
  
  // Actions
  handleUndo?: () => void;
  handleRedo?: () => void;
  handleApprove?: () => void;
  handleDiscard?: () => void;
  handleStopListening?: () => void;
  handleStartListening?: () => void;
  handleTakeScreenshot?: () => void;
  
  // Prompts
  setPrompt?: (text: string) => void;
  handleSubmit?: () => void;
  
  // Voice features
  toggleContinuousMode?: () => void;
  readLastMessage?: () => void;
  clearConversation?: () => void;
  saveConversation?: () => void;
  loadConversation?: () => void;
  muteAudio?: () => void;
  unmuteAudio?: () => void;
  showSuggestions?: () => void;
  
  // Navigation
  navigate?: (path: string) => void;
  
  // Theme
  setTheme?: (theme: 'light' | 'dark') => void;
  
  // Zoom
  adjustZoom?: (factor: number) => void;
  
  // Fullscreen
  enterFullscreen?: () => void;
  exitFullscreen?: () => void;
}

/**
 * Natural Language Processor for fuzzy command matching
 */
export class NaturalLanguageProcessor {
  private fuse: Fuse<{ pattern: string; command: VoiceCommand }>;

  constructor(commands: VoiceCommand[]) {
    const commandList = commands.flatMap(command =>
      command.patterns.map(pattern => ({
        pattern: pattern.toLowerCase(),
        command,
      }))
    );

    this.fuse = new Fuse(commandList, {
      keys: ['pattern'],
      threshold: 0.4, // 60% similarity required
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 3,
    });
  }

  findBestMatch(text: string): { command: VoiceCommand; pattern: string; score: number } | null {
    const results = this.fuse.search(text.toLowerCase());

    if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.4) {
      return {
        command: results[0].item.command,
        pattern: results[0].item.pattern,
        score: 1 - results[0].score,
      };
    }

    return null;
  }
}

/**
 * Voice Command Processor with 50+ commands
 */
export class VoiceCommandProcessor {
  private commands: VoiceCommand[];
  private context: VoiceCommandContext;
  private nlp: NaturalLanguageProcessor;

  constructor(context: VoiceCommandContext) {
    this.context = context;
    this.commands = this.initializeCommands();
    this.nlp = new NaturalLanguageProcessor(this.commands);
  }

  private initializeCommands(): VoiceCommand[] {
    return [
      // ===== NAVIGATION COMMANDS (10) =====
      {
        patterns: ['go to home', 'open home', 'home page', 'navigate home'],
        action: () => {
          this.context.navigate?.('/');
          window.location.href = '/';
        },
        description: 'Navigate to home page',
        category: 'navigation',
      },
      {
        patterns: ['go to feed', 'open feed', 'show feed', 'view feed'],
        action: () => {
          this.context.navigate?.('/feed');
          window.location.href = '/feed';
        },
        description: 'Navigate to feed',
        category: 'navigation',
      },
      {
        patterns: ['go to profile', 'open profile', 'my profile', 'view profile'],
        action: () => {
          this.context.navigate?.('/profile');
          window.location.href = '/profile';
        },
        description: 'Navigate to profile',
        category: 'navigation',
      },
      {
        patterns: ['go to events', 'show events', 'event page', 'open events'],
        action: () => {
          this.context.navigate?.('/events');
          window.location.href = '/events';
        },
        description: 'Navigate to events',
        category: 'navigation',
      },
      {
        patterns: ['go to messages', 'open messages', 'chat', 'view messages'],
        action: () => {
          this.context.navigate?.('/messages');
          window.location.href = '/messages';
        },
        description: 'Navigate to messages',
        category: 'navigation',
      },
      {
        patterns: ['go to settings', 'open settings', 'settings page'],
        action: () => {
          this.context.navigate?.('/settings');
          window.location.href = '/settings';
        },
        description: 'Navigate to settings',
        category: 'navigation',
      },
      {
        patterns: ['go back', 'navigate back', 'back', 'previous page'],
        action: () => {
          window.history.back();
        },
        description: 'Go back to previous page',
        category: 'navigation',
      },
      {
        patterns: ['go forward', 'navigate forward', 'forward', 'next page'],
        action: () => {
          window.history.forward();
        },
        description: 'Go forward to next page',
        category: 'navigation',
      },
      {
        patterns: ['refresh page', 'reload page', 'refresh', 'reload'],
        action: () => {
          window.location.reload();
        },
        description: 'Refresh the current page',
        category: 'navigation',
      },
      {
        patterns: ['scroll to top', 'go to top', 'top of page', 'scroll up'],
        action: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        description: 'Scroll to top of page',
        category: 'navigation',
      },

      // ===== VISUAL EDITOR COMMANDS (15) =====
      {
        patterns: ['make it bigger', 'increase size', 'larger', 'make larger'],
        action: () => {
          this.context.setPrompt?.('Make it bigger');
          this.context.handleSubmit?.();
        },
        description: 'Make selected element bigger',
        category: 'visual-editor',
      },
      {
        patterns: ['make it smaller', 'decrease size', 'smaller', 'make smaller'],
        action: () => {
          this.context.setPrompt?.('Make it smaller');
          this.context.handleSubmit?.();
        },
        description: 'Make selected element smaller',
        category: 'visual-editor',
      },
      {
        patterns: ['change color', 'make it blue', 'make it red', 'make it green', 'change to red', 'change to blue'],
        action: (matches) => {
          const text = matches?.[0] || '';
          const colorMatch = text.match(/\b(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey)\b/i);
          const color = colorMatch ? colorMatch[1] : 'blue';
          this.context.setPrompt?.(`Change color to ${color}`);
          this.context.handleSubmit?.();
        },
        description: 'Change color of element',
        category: 'visual-editor',
        parameterized: true,
      },
      {
        patterns: ['add padding', 'more padding', 'increase padding'],
        action: () => {
          this.context.setPrompt?.('Add more padding');
          this.context.handleSubmit?.();
        },
        description: 'Add padding to element',
        category: 'visual-editor',
      },
      {
        patterns: ['remove padding', 'less padding', 'decrease padding', 'reduce padding'],
        action: () => {
          this.context.setPrompt?.('Remove padding');
          this.context.handleSubmit?.();
        },
        description: 'Remove padding from element',
        category: 'visual-editor',
      },
      {
        patterns: ['center it', 'center align', 'align center', 'center this'],
        action: () => {
          this.context.setPrompt?.('Center align it');
          this.context.handleSubmit?.();
        },
        description: 'Center align element',
        category: 'visual-editor',
      },
      {
        patterns: ['make it bold', 'bold text', 'make bold'],
        action: () => {
          this.context.setPrompt?.('Make text bold');
          this.context.handleSubmit?.();
        },
        description: 'Make text bold',
        category: 'visual-editor',
      },
      {
        patterns: ['make it italic', 'italic text', 'italicize'],
        action: () => {
          this.context.setPrompt?.('Make text italic');
          this.context.handleSubmit?.();
        },
        description: 'Make text italic',
        category: 'visual-editor',
      },
      {
        patterns: ['undo', 'undo change', 'undo that', 'revert'],
        action: () => {
          this.context.handleUndo?.();
        },
        description: 'Undo last change',
        category: 'visual-editor',
      },
      {
        patterns: ['redo', 'redo change', 'redo that'],
        action: () => {
          this.context.handleRedo?.();
        },
        description: 'Redo change',
        category: 'visual-editor',
      },
      {
        patterns: ['save changes', 'apply changes', 'save to codebase', 'apply to codebase'],
        action: () => {
          this.context.handleApprove?.();
        },
        description: 'Save changes to codebase',
        category: 'visual-editor',
      },
      {
        patterns: ['discard changes', 'cancel changes', 'reject changes', 'revert changes'],
        action: () => {
          this.context.handleDiscard?.();
        },
        description: 'Discard pending changes',
        category: 'visual-editor',
      },
      {
        patterns: ['show preview', 'preview mode', 'view preview'],
        action: () => {
          this.context.setViewMode?.('preview');
        },
        description: 'Switch to preview mode',
        category: 'visual-editor',
      },
      {
        patterns: ['show code', 'code mode', 'view code', 'code view'],
        action: () => {
          this.context.setViewMode?.('code');
        },
        description: 'Switch to code view',
        category: 'visual-editor',
      },
      {
        patterns: ['take screenshot', 'capture screen', 'screenshot', 'capture'],
        action: () => {
          this.context.handleTakeScreenshot?.();
        },
        description: 'Take screenshot of current view',
        category: 'visual-editor',
      },
      {
        patterns: ['move left', 'shift left', 'go left'],
        action: () => {
          this.context.setPrompt?.('Move element left');
          this.context.handleSubmit?.();
        },
        description: 'Move element left',
        category: 'visual-editor',
      },
      {
        patterns: ['move right', 'shift right', 'go right'],
        action: () => {
          this.context.setPrompt?.('Move element right');
          this.context.handleSubmit?.();
        },
        description: 'Move element right',
        category: 'visual-editor',
      },
      {
        patterns: ['move up', 'shift up', 'go up'],
        action: () => {
          this.context.setPrompt?.('Move element up');
          this.context.handleSubmit?.();
        },
        description: 'Move element up',
        category: 'visual-editor',
      },
      {
        patterns: ['move down', 'shift down', 'go down'],
        action: () => {
          this.context.setPrompt?.('Move element down');
          this.context.handleSubmit?.();
        },
        description: 'Move element down',
        category: 'visual-editor',
      },
      {
        patterns: ['change background', 'background color', 'set background'],
        action: (matches) => {
          const text = matches?.[0] || '';
          const color = extractColor(text) || 'blue';
          this.context.setPrompt?.(`Change background to ${color}`);
          this.context.handleSubmit?.();
        },
        description: 'Change background color',
        category: 'visual-editor',
        parameterized: true,
      },
      {
        patterns: ['change font', 'set font', 'font to'],
        action: (matches) => {
          const text = matches?.[0] || '';
          const font = extractFont(text) || 'Arial';
          this.context.setPrompt?.(`Change font to ${font}`);
          this.context.handleSubmit?.();
        },
        description: 'Change font family',
        category: 'visual-editor',
        parameterized: true,
      },
      {
        patterns: ['add margin', 'more margin', 'increase margin'],
        action: () => {
          this.context.setPrompt?.('Add more margin');
          this.context.handleSubmit?.();
        },
        description: 'Add margin to element',
        category: 'visual-editor',
      },
      {
        patterns: ['remove margin', 'less margin', 'decrease margin', 'reduce margin'],
        action: () => {
          this.context.setPrompt?.('Remove margin');
          this.context.handleSubmit?.();
        },
        description: 'Remove margin from element',
        category: 'visual-editor',
      },

      // ===== MR. BLUE COMMANDS (10) =====
      {
        patterns: ['start listening', 'listen to me', 'begin listening', 'voice on'],
        action: () => {
          this.context.handleStartListening?.();
        },
        description: 'Start voice input',
        category: 'mr-blue',
      },
      {
        patterns: ['stop listening', 'stop voice', 'exit voice mode', 'turn off voice'],
        action: () => {
          this.context.handleStopListening?.();
        },
        description: 'Stop voice input',
        category: 'mr-blue',
      },
      {
        patterns: ['read last message', 'repeat that', 'repeat last message', 'what did you say'],
        action: () => {
          this.context.readLastMessage?.();
        },
        description: 'Read last message aloud',
        category: 'mr-blue',
      },
      {
        patterns: ['clear conversation', 'new chat', 'start over', 'clear chat'],
        action: () => {
          this.context.clearConversation?.();
        },
        description: 'Clear conversation history',
        category: 'mr-blue',
      },
      {
        patterns: ['save conversation', 'save chat', 'save this'],
        action: () => {
          this.context.saveConversation?.();
        },
        description: 'Save current conversation',
        category: 'mr-blue',
      },
      {
        patterns: ['load conversation', 'open chat', 'load chat'],
        action: () => {
          this.context.loadConversation?.();
        },
        description: 'Load saved conversation',
        category: 'mr-blue',
      },
      {
        patterns: ['toggle continuous mode', 'continuous mode', 'enable continuous', 'disable continuous'],
        action: () => {
          this.context.toggleContinuousMode?.();
        },
        description: 'Toggle continuous listening mode',
        category: 'mr-blue',
      },
      {
        patterns: ['mute audio', 'silence', 'mute', 'quiet'],
        action: () => {
          this.context.muteAudio?.();
        },
        description: 'Mute audio output',
        category: 'mr-blue',
      },
      {
        patterns: ['unmute audio', 'sound on', 'unmute', 'enable audio'],
        action: () => {
          this.context.unmuteAudio?.();
        },
        description: 'Unmute audio output',
        category: 'mr-blue',
      },
      {
        patterns: ['show suggestions', 'help me', 'suggestions', 'show help'],
        action: () => {
          this.context.showSuggestions?.();
        },
        description: 'Show command suggestions',
        category: 'mr-blue',
      },

      // ===== CONTENT COMMANDS (8) =====
      {
        patterns: ['create post', 'new post', 'make a post', 'write a post'],
        action: () => {
          window.location.href = '/feed?action=create-post';
        },
        description: 'Create a new post',
        category: 'content',
      },
      {
        patterns: ['create event', 'new event', 'make an event'],
        action: () => {
          window.location.href = '/events?action=create';
        },
        description: 'Create a new event',
        category: 'content',
      },
      {
        patterns: ['upload photo', 'add photo', 'upload image', 'add image'],
        action: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.click();
        },
        description: 'Upload a photo',
        category: 'content',
      },
      {
        patterns: ['upload video', 'add video'],
        action: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'video/*';
          input.click();
        },
        description: 'Upload a video',
        category: 'content',
      },
      {
        patterns: ['tag friends', 'mention friends', 'add friends'],
        action: () => {
          console.log('[VoiceCommand] Tag friends - opening friend selector');
        },
        description: 'Tag friends in post',
        category: 'content',
      },
      {
        patterns: ['add location', 'tag location', 'set location'],
        action: () => {
          console.log('[VoiceCommand] Add location - opening location picker');
        },
        description: 'Add location tag',
        category: 'content',
      },
      {
        patterns: ['search for', 'find', 'look for', 'search'],
        action: (matches) => {
          const text = matches?.[0] || '';
          const queryMatch = text.match(/(?:search for|find|look for)\s+(.+)/i);
          const query = queryMatch ? queryMatch[1] : '';
          if (query) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
          }
        },
        description: 'Search for content',
        category: 'content',
        parameterized: true,
      },
      {
        patterns: ['filter by', 'filter', 'show only'],
        action: (matches) => {
          const text = matches?.[0] || '';
          const filterMatch = text.match(/(?:filter by|show only)\s+(.+)/i);
          const filter = filterMatch ? filterMatch[1] : '';
          console.log('[VoiceCommand] Apply filter:', filter);
        },
        description: 'Apply content filter',
        category: 'content',
        parameterized: true,
      },
      {
        patterns: ['add button', 'create button', 'insert button', 'new button'],
        action: () => {
          this.context.setPrompt?.('Add a button element');
          this.context.handleSubmit?.();
        },
        description: 'Add button element',
        category: 'content',
      },
      {
        patterns: ['add text', 'create text', 'insert text', 'add paragraph'],
        action: () => {
          this.context.setPrompt?.('Add a text element');
          this.context.handleSubmit?.();
        },
        description: 'Add text element',
        category: 'content',
      },
      {
        patterns: ['delete element', 'remove element', 'delete this', 'remove this'],
        action: () => {
          this.context.setPrompt?.('Delete selected element');
          this.context.handleSubmit?.();
        },
        description: 'Delete selected element',
        category: 'content',
      },
      {
        patterns: ['duplicate element', 'copy element', 'clone element', 'duplicate this'],
        action: () => {
          this.context.setPrompt?.('Duplicate selected element');
          this.context.handleSubmit?.();
        },
        description: 'Duplicate element',
        category: 'content',
      },

      // ===== SYSTEM COMMANDS (7) =====
      {
        patterns: ['what can you do', 'help', 'show commands', 'available commands', 'command list'],
        action: () => {
          this.context.showSuggestions?.();
        },
        description: 'Show all available commands',
        category: 'system',
      },
      {
        patterns: ['dark mode', 'enable dark mode', 'switch to dark', 'dark theme'],
        action: () => {
          this.context.setTheme?.('dark');
          document.documentElement.classList.add('dark');
        },
        description: 'Enable dark mode',
        category: 'system',
      },
      {
        patterns: ['light mode', 'enable light mode', 'switch to light', 'light theme'],
        action: () => {
          this.context.setTheme?.('light');
          document.documentElement.classList.remove('dark');
        },
        description: 'Enable light mode',
        category: 'system',
      },
      {
        patterns: ['zoom in', 'increase zoom', 'zoom closer'],
        action: () => {
          this.context.adjustZoom?.(1.1);
        },
        description: 'Zoom in',
        category: 'system',
      },
      {
        patterns: ['zoom out', 'decrease zoom', 'zoom farther'],
        action: () => {
          this.context.adjustZoom?.(0.9);
        },
        description: 'Zoom out',
        category: 'system',
      },
      {
        patterns: ['full screen', 'enter full screen', 'fullscreen', 'maximize'],
        action: () => {
          this.context.enterFullscreen?.();
          document.documentElement.requestFullscreen?.();
        },
        description: 'Enter fullscreen mode',
        category: 'system',
      },
      {
        patterns: ['exit full screen', 'leave full screen', 'exit fullscreen', 'minimize'],
        action: () => {
          this.context.exitFullscreen?.();
          document.exitFullscreen?.();
        },
        description: 'Exit fullscreen mode',
        category: 'system',
      },
    ];
  }

  /**
   * Process a voice input and execute matching command
   * Uses exact matching first, then fuzzy matching
   * Provides TTS feedback for every command
   * @returns true if a command was executed, false otherwise
   */
  processCommand(input: string): boolean {
    const trimmedInput = input.trim().toLowerCase();

    // Try exact pattern matching first
    for (const command of this.commands) {
      for (const pattern of command.patterns) {
        const patternLower = pattern.toLowerCase();
        
        // Exact match
        if (trimmedInput === patternLower) {
          console.log('[VoiceCommand] Exact match:', command.description);
          speakCommandConfirmation(command.description);
          command.action([trimmedInput], this.context);
          return true;
        }
        
        // Partial match for parameterized commands
        if (command.parameterized && trimmedInput.includes(patternLower.split(' ')[0])) {
          console.log('[VoiceCommand] Parameterized match:', command.description);
          
          // Extract parameters for better TTS feedback
          const color = extractColor(trimmedInput);
          const direction = extractDirection(trimmedInput);
          const font = extractFont(trimmedInput);
          
          if (color) {
            tts.speak(`Changing color to ${color}`);
          } else if (direction) {
            tts.speak(`Moving ${direction}`);
          } else if (font) {
            tts.speak(`Changing font to ${font}`);
          } else {
            speakCommandConfirmation(command.description);
          }
          
          command.action([trimmedInput], this.context);
          return true;
        }
      }
    }

    // Try fuzzy matching if no exact match
    const fuzzyMatch = this.nlp.findBestMatch(trimmedInput);
    if (fuzzyMatch && fuzzyMatch.score >= 0.6) {
      console.log('[VoiceCommand] Fuzzy match:', fuzzyMatch.command.description, 'Score:', fuzzyMatch.score);
      speakCommandConfirmation(fuzzyMatch.command.description);
      fuzzyMatch.command.action([trimmedInput], this.context);
      return true;
    }

    // No match found - speak error
    console.log('[VoiceCommand] No command matched for:', input);
    speakUnrecognizedCommand();
    return false;
  }

  /**
   * Get all available commands
   */
  getCommands(): VoiceCommand[] {
    return this.commands;
  }

  /**
   * Get commands by category
   */
  getCommandsByCategory(category: VoiceCommand['category']): VoiceCommand[] {
    return this.commands.filter(cmd => cmd.category === category);
  }

  /**
   * Update context (e.g., when component state changes)
   */
  updateContext(newContext: Partial<VoiceCommandContext>) {
    this.context = { ...this.context, ...newContext };
  }

  /**
   * Get total command count
   */
  getTotalCommandCount(): number {
    return this.commands.length;
  }

  /**
   * Get total pattern count (including variations)
   */
  getTotalPatternCount(): number {
    return this.commands.reduce((total, cmd) => total + cmd.patterns.length, 0);
  }
}

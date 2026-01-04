/**
 * MessagesPageAgent - Specialized agent for Messaging functionality
 * 
 * MB.MD Level 3: Complete specification of Messaging system
 */

import { BasePageAgent, ElementLocation } from './BasePageAgent';
import { BaseFeatureAgent, FeaturePRD, TestableBehavior } from './BaseFeatureAgent';

class DirectMessagesFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('direct-messages', 'Direct Messages', 'messages-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'direct-messages',
      featureName: 'Direct Messages',
      description: 'One-on-one private messaging between users with real-time delivery and read receipts.',
      expectedBehaviors: [
        { id: 'test-dm-list', description: 'DM conversations list loads', priority: 'critical', expectedOutcome: 'List of conversations visible', steps: [
          { action: 'navigate', value: '/messages', description: 'Navigate to messages' },
          { action: 'wait', timeout: 2000, description: 'Wait for load' },
          { action: 'assert', target: '[data-testid="conversations-list"]', value: 'visible', description: 'Conversations visible' },
        ]},
        { id: 'test-send-message', description: 'Sending a message works', priority: 'critical', expectedOutcome: 'Message appears in thread', steps: [
          { action: 'navigate', value: '/messages/:threadId', description: 'Navigate to thread' },
          { action: 'type', target: '[data-testid="message-input"]', value: 'Test message ${Date.now()}', description: 'Type message' },
          { action: 'click', target: '[data-testid="send-button"]', description: 'Click send' },
          { action: 'wait', timeout: 1000, description: 'Wait for send' },
          { action: 'assert', target: '[data-testid="message-sent"]', value: 'visible', description: 'Message appears' },
        ]},
        { id: 'test-new-dm', description: 'Starting new conversation works', priority: 'high', expectedOutcome: 'New thread created', steps: [
          { action: 'navigate', value: '/messages', description: 'Navigate to messages' },
          { action: 'click', target: '[data-testid="new-message-button"]', description: 'Click new message' },
          { action: 'assert', target: '[data-testid="user-search"]', value: 'visible', description: 'User search appears' },
        ]},
      ],
      dependencies: ['WebSocket', '/api/messages'],
      apiEndpoints: [
        { endpoint: '/api/messages', method: 'GET', description: 'Get conversations' },
        { endpoint: '/api/messages/:threadId', method: 'GET', description: 'Get messages in thread' },
        { endpoint: '/api/messages', method: 'POST', description: 'Send message' },
      ],
      uiElements: [
        { selector: '[data-testid="conversations-list"]', description: 'Conversations list', testId: 'conversations-list' },
        { selector: '[data-testid="message-input"]', description: 'Message input', testId: 'message-input' },
        { selector: '[data-testid="send-button"]', description: 'Send button', testId: 'send-button' },
        { selector: '[data-testid="new-message-button"]', description: 'New message button', testId: 'new-message-button' },
      ],
      knownIssues: [
        { pattern: 'WebSocket disconnect', fix: 'Implement reconnection with exponential backoff', severity: 'high' },
        { pattern: 'message order wrong', fix: 'Sort by createdAt timestamp descending', severity: 'medium' },
      ],
    };
  }
}

class GroupChatFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('group-chat', 'Group Chat', 'messages-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'group-chat',
      featureName: 'Group Chat',
      description: 'Multi-user group conversations with admin controls, member management, and shared media.',
      expectedBehaviors: [
        { id: 'test-group-list', description: 'Group chats list loads', priority: 'high', expectedOutcome: 'Groups visible in sidebar', steps: [
          { action: 'navigate', value: '/messages/groups', description: 'Navigate to groups' },
          { action: 'assert', target: '[data-testid="groups-list"]', value: 'visible', description: 'Groups list visible' },
        ]},
        { id: 'test-create-group', description: 'Creating new group works', priority: 'high', expectedOutcome: 'New group created', steps: [
          { action: 'navigate', value: '/messages/groups', description: 'Navigate to groups' },
          { action: 'click', target: '[data-testid="create-group-button"]', description: 'Click create group' },
          { action: 'type', target: '[data-testid="group-name-input"]', value: 'Test Group', description: 'Enter name' },
          { action: 'click', target: '[data-testid="save-group-button"]', description: 'Save group' },
        ]},
      ],
      dependencies: ['WebSocket', '/api/groups'],
      apiEndpoints: [
        { endpoint: '/api/groups', method: 'GET', description: 'Get user groups' },
        { endpoint: '/api/groups', method: 'POST', description: 'Create group' },
        { endpoint: '/api/groups/:id/messages', method: 'GET', description: 'Get group messages' },
      ],
      uiElements: [
        { selector: '[data-testid="groups-list"]', description: 'Groups list', testId: 'groups-list' },
        { selector: '[data-testid="create-group-button"]', description: 'Create group button', testId: 'create-group-button' },
        { selector: '[data-testid="group-name-input"]', description: 'Group name input', testId: 'group-name-input' },
      ],
      knownIssues: [],
    };
  }
}

class MessageThreadsFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('message-threads', 'Message Threads', 'messages-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'message-threads',
      featureName: 'Message Threads',
      description: 'Individual conversation thread view with message history, attachments, and reactions.',
      expectedBehaviors: [
        { id: 'test-thread-load', description: 'Thread loads with messages', priority: 'critical', expectedOutcome: 'Messages visible in thread', steps: [
          { action: 'navigate', value: '/messages/:threadId', description: 'Navigate to thread' },
          { action: 'wait', timeout: 2000, description: 'Wait for load' },
          { action: 'assert', target: '[data-testid="messages-container"]', value: 'visible', description: 'Messages visible' },
        ]},
        { id: 'test-scroll-history', description: 'Scrolling loads older messages', priority: 'medium', expectedOutcome: 'More messages loaded on scroll up', steps: [
          { action: 'navigate', value: '/messages/:threadId', description: 'Navigate to thread' },
          { action: 'scroll', value: 'top', description: 'Scroll to top' },
          { action: 'wait', timeout: 1000, description: 'Wait for load' },
        ]},
      ],
      dependencies: ['Infinite scroll', 'WebSocket'],
      apiEndpoints: [
        { endpoint: '/api/messages/:threadId', method: 'GET', description: 'Get thread messages with pagination' },
      ],
      uiElements: [
        { selector: '[data-testid="messages-container"]', description: 'Messages container', testId: 'messages-container' },
        { selector: '[data-testid="message-bubble"]', description: 'Individual message', testId: 'message-bubble' },
        { selector: '[data-testid="typing-indicator"]', description: 'Typing indicator', testId: 'typing-indicator' },
      ],
      knownIssues: [
        { pattern: 'scroll jump on new message', fix: 'Only auto-scroll if user is at bottom', severity: 'medium' },
      ],
    };
  }
}

class UnifiedInboxFeatureAgent extends BaseFeatureAgent {
  constructor() {
    super('unified-inbox', 'Unified Inbox', 'messages-page');
  }

  initializePRD(): FeaturePRD {
    return {
      featureId: 'unified-inbox',
      featureName: 'Unified Inbox',
      description: 'Combined view of all message types including DMs, groups, and notifications.',
      expectedBehaviors: [
        { id: 'test-inbox-load', description: 'Unified inbox loads all message types', priority: 'high', expectedOutcome: 'Combined list visible', steps: [
          { action: 'navigate', value: '/messages/inbox', description: 'Navigate to inbox' },
          { action: 'wait', timeout: 2000, description: 'Wait for load' },
          { action: 'assert', target: '[data-testid="unified-inbox"]', value: 'visible', description: 'Inbox visible' },
        ]},
        { id: 'test-filter-messages', description: 'Filtering by type works', priority: 'medium', expectedOutcome: 'Filtered results shown', steps: [
          { action: 'navigate', value: '/messages/inbox', description: 'Navigate to inbox' },
          { action: 'click', target: '[data-testid="filter-dms"]', description: 'Filter to DMs only' },
          { action: 'assert', target: '[data-testid="dm-only-list"]', value: 'visible', description: 'Only DMs shown' },
        ]},
      ],
      dependencies: ['/api/messages/unified'],
      apiEndpoints: [
        { endpoint: '/api/messages/unified', method: 'GET', description: 'Get unified message list' },
      ],
      uiElements: [
        { selector: '[data-testid="unified-inbox"]', description: 'Unified inbox container', testId: 'unified-inbox' },
        { selector: '[data-testid="filter-dms"]', description: 'DMs filter', testId: 'filter-dms' },
        { selector: '[data-testid="filter-groups"]', description: 'Groups filter', testId: 'filter-groups' },
      ],
      knownIssues: [],
    };
  }
}

export class MessagesPageAgent extends BasePageAgent {
  private featureAgents: Map<string, BaseFeatureAgent>;

  constructor() {
    super(
      'messages-page',
      'Messages Page Agent',
      [
        'client/src/pages/messages/DirectMessages.tsx',
        'client/src/pages/messages/GroupChat.tsx',
        'client/src/pages/messages/MessageThreads.tsx',
        'client/src/pages/messages/UnifiedInbox.tsx',
        'client/src/components/messages/MessageBubble.tsx',
        'client/src/components/messages/ConversationList.tsx',
        'server/routes/messages.ts',
      ]
    );

    this.featureAgents = new Map();
    this.initializeFeatureAgents();
  }

  private initializeFeatureAgents() {
    const agents = [
      new DirectMessagesFeatureAgent(),
      new GroupChatFeatureAgent(),
      new MessageThreadsFeatureAgent(),
      new UnifiedInboxFeatureAgent(),
    ];
    agents.forEach(a => this.featureAgents.set(a.getFeatureId(), a));
    console.log(`[Messages Page Agent] Initialized ${this.featureAgents.size} feature agents`);
  }

  getFeatureAgents(): BaseFeatureAgent[] {
    return Array.from(this.featureAgents.values());
  }

  getFeatureAgent(id: string): BaseFeatureAgent | undefined {
    return this.featureAgents.get(id);
  }

  async canHandle(query: string): Promise<{ canHandle: boolean; confidence: number; element: ElementLocation | null; reason: string }> {
    const lower = query.toLowerCase();
    if (lower.includes('message') || lower.includes('chat') || lower.includes('inbox') || lower.includes('dm')) {
      return { canHandle: true, confidence: 0.90, element: null, reason: 'Messages Page Agent owns all messaging functionality' };
    }
    return { canHandle: false, confidence: 0, element: null, reason: 'Query does not match Messages domain' };
  }

  async findElement(query: string): Promise<ElementLocation | null> {
    return null;
  }
}

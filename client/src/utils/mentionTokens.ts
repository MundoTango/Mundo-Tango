/**
 * @Mentions Token System
 * 
 * Handles parsing and transformation of mention tokens between:
 * - Canonical format (database storage): "@user:user_123:maria_rodriguez"
 * - Display format (UI rendering): "@maria_rodriguez"
 * - Token format (internal state): [{ kind: 'mention', type: 'user', id: 'user_123', name: 'maria_rodriguez' }]
 */

export type EntityType = 'user' | 'event' | 'group' | 'city';

export type Token = TextToken | MentionToken;

export interface TextToken {
  kind: 'text';
  text: string;
}

export interface MentionToken {
  kind: 'mention';
  type: EntityType;
  id: string;
  name: string;
  groupType?: string; // Optional: 'professional' | 'city' for groups
}

/**
 * Parse canonical format string into token array
 * 
 * Supports three formats:
 * 1. Standard: @type:id:name
 * 2. Group with type: @group:groupType:id:name
 * 3. Plain mention: @username (treated as user mention with placeholder ID)
 * 
 * Example:
 * Input: "Dancing with @user:user_123:maria_rodriguez at @group:professional:group_1:Buenos_Aires_Tango"
 * Output: [
 *   { kind: 'text', text: 'Dancing with ' },
 *   { kind: 'mention', type: 'user', id: 'user_123', name: 'maria_rodriguez' },
 *   { kind: 'text', text: ' at ' },
 *   { kind: 'mention', type: 'group', id: 'group_1', name: 'Buenos_Aires_Tango', groupType: 'professional' }
 * ]
 * 
 * Plain mention example:
 * Input: "@scott_the_tango_nomad @elena_tango "
 * Output: [
 *   { kind: 'mention', type: 'user', id: 'user_scott_the_tango_nomad', name: 'scott_the_tango_nomad' },
 *   { kind: 'text', text: ' ' },
 *   { kind: 'mention', type: 'user', id: 'user_elena_tango', name: 'elena_tango' },
 *   { kind: 'text', text: ' ' }
 * ]
 */
export function parseCanonicalToTokens(canonical: string): Token[] {
  if (!canonical) return [];
  
  const tokens: Token[] = [];
  
  // Combined regex that matches:
  // 1. Full canonical format: @type:id:name or @group:groupType:id:name
  // 2. Plain mention format: @username (must be preceded by whitespace or start of string, not part of email)
  const canonicalRegex = /@(user|event|group|city):(?:(professional|city):)?([^:\s]+):([^@\s\n]+)/g;
  
  // First pass: find all canonical mentions
  const canonicalMatches: Array<{ index: number; length: number; token: MentionToken }> = [];
  let match: RegExpExecArray | null;
  
  while ((match = canonicalRegex.exec(canonical)) !== null) {
    const [fullMatch, type, groupType, id, name] = match;
    const token: MentionToken = {
      kind: 'mention',
      type: type as EntityType,
      id,
      name: name,
    };
    if (type === 'group' && groupType) {
      token.groupType = groupType;
    }
    canonicalMatches.push({ index: match.index, length: fullMatch.length, token });
  }
  
  // Second pass: find plain mentions that aren't part of canonical mentions
  // Plain mentions must be preceded by whitespace or start of string (to avoid matching emails)
  const plainMatches: Array<{ index: number; length: number; token: MentionToken }> = [];
  const plainMentionRegex = /(?:^|[\s\n])@([a-zA-Z][a-zA-Z0-9_]*)/g;
  
  while ((match = plainMentionRegex.exec(canonical)) !== null) {
    const [fullMatch, username] = match;
    // Calculate actual @ position (may have leading whitespace)
    const atIndex = canonical.indexOf('@', match.index);
    const mentionLength = username.length + 1; // +1 for @
    const matchEnd = atIndex + mentionLength;
    
    // Check if this plain mention overlaps with any canonical mention
    const overlapsWithCanonical = canonicalMatches.some(cm => {
      const cmEnd = cm.index + cm.length;
      return (atIndex >= cm.index && atIndex < cmEnd) || 
             (matchEnd > cm.index && matchEnd <= cmEnd) ||
             (atIndex <= cm.index && matchEnd >= cmEnd);
    });
    
    if (!overlapsWithCanonical) {
      plainMatches.push({
        index: atIndex,
        length: mentionLength,
        token: {
          kind: 'mention',
          type: 'user',
          id: `user_${username}`, // Placeholder ID based on username
          name: username,
        }
      });
    }
  }
  
  // Combine and sort all matches by index
  const allMatches = [...canonicalMatches, ...plainMatches].sort((a, b) => a.index - b.index);
  
  // Build tokens array
  let lastIndex = 0;
  for (const m of allMatches) {
    // Add text before this mention
    if (m.index > lastIndex) {
      const text = canonical.substring(lastIndex, m.index);
      tokens.push({ kind: 'text', text });
    }
    
    tokens.push(m.token);
    lastIndex = m.index + m.length;
  }
  
  // Add remaining text
  if (lastIndex < canonical.length) {
    const text = canonical.substring(lastIndex);
    tokens.push({ kind: 'text', text });
  }
  
  return tokens;
}

/**
 * Convert token array to canonical format (for database storage)
 * 
 * Outputs:
 * - Groups with type: @group:professional:group_1:name or @group:city:group_1:name
 * - Others: @type:id:name
 * 
 * Example:
 * Input: [
 *   { kind: 'text', text: 'Dancing with ' },
 *   { kind: 'mention', type: 'group', id: 'group_1', name: 'Buenos Aires Tango Community', groupType: 'professional' }
 * ]
 * Output: "Dancing with @group:professional:group_1:Buenos Aires Tango Community"
 */
export function tokensToCanonical(tokens: Token[]): string {
  return tokens.map(token => {
    if (token.kind === 'text') {
      return token.text;
    } else {
      // For groups, include groupType in canonical format
      if (token.type === 'group' && token.groupType) {
        return `@${token.type}:${token.groupType}:${token.id}:${token.name}`;
      }
      return `@${token.type}:${token.id}:${token.name}`;
    }
  }).join('');
}

/**
 * Convert token array to display format (for UI rendering)
 * 
 * Example:
 * Input: [
 *   { kind: 'text', text: 'Dancing with ' },
 *   { kind: 'mention', type: 'user', id: 'user_123', name: 'maria_rodriguez' }
 * ]
 * Output: "Dancing with @maria_rodriguez"
 */
export function tokensToDisplay(tokens: Token[]): string {
  return tokens.map(token => {
    if (token.kind === 'text') {
      return token.text;
    } else {
      return `@${token.name}`;
    }
  }).join('');
}

/**
 * Find mention trigger (@) at cursor position
 * Returns the start position and search query if found
 * 
 * Example:
 * Input: text="Hello @maria", cursorPos=12
 * Output: { start: 6, query: "maria" }
 */
export function findMentionTriggerAtCursor(
  text: string,
  cursorPos: number
): { start: number; query: string } | null {
  // Find the last '@' before cursor
  let atPos = -1;
  for (let i = cursorPos - 1; i >= 0; i--) {
    if (text[i] === '@') {
      atPos = i;
      break;
    }
    // Stop at whitespace
    if (/\s/.test(text[i])) {
      break;
    }
  }
  
  if (atPos === -1) return null;
  
  // Extract query between '@' and cursor
  const query = text.substring(atPos + 1, cursorPos);
  
  // Must not contain whitespace
  if (/\s/.test(query)) return null;
  
  return { start: atPos, query };
}

/**
 * Replace mention trigger with actual mention token
 * Finds the @ trigger in the token array and replaces it with a mention
 * 
 * Example:
 * Input: 
 *   tokens = [{ kind: 'text', text: 'Dancing with @mar' }]
 *   displayText = "Dancing with @mar"
 *   cursorPos = 17
 *   mention = { kind: 'mention', type: 'user', id: 'user_123', name: 'maria_rodriguez' }
 * Output: [
 *   { kind: 'text', text: 'Dancing with ' },
 *   { kind: 'mention', type: 'user', id: 'user_123', name: 'maria_rodriguez' }
 * ]
 */
export function replaceTriggerWithMention(
  tokens: Token[],
  displayText: string,
  cursorPos: number,
  mention: MentionToken
): Token[] {
  const trigger = findMentionTriggerAtCursor(displayText, cursorPos);
  if (!trigger) return tokens;
  
  const newTokens: Token[] = [];
  let charCount = 0;
  
  // The mention ends right after the query text, not at cursor position
  // trigger.start = position of "@"
  // trigger.start + 1 = position after "@"
  // trigger.start + 1 + trigger.query.length = position after the complete mention
  const mentionEndPos = trigger.start + 1 + trigger.query.length;
  
  for (const token of tokens) {
    if (token.kind === 'text') {
      const tokenStart = charCount;
      const tokenEnd = charCount + token.text.length;
      
      // Check if trigger overlaps with this text token
      if (tokenStart <= trigger.start && tokenEnd >= mentionEndPos) {
        // Split text token around trigger
        const before = token.text.substring(0, trigger.start - tokenStart);
        let after = token.text.substring(mentionEndPos - tokenStart);
        
        if (before) {
          newTokens.push({ kind: 'text', text: before });
        }
        newTokens.push(mention);
        
        // Add space after mention if not already present
        if (after && !after.startsWith(' ')) {
          after = ' ' + after;
        } else if (!after) {
          // If no text after, add a space for proper spacing
          after = ' ';
        }
        
        if (after) {
          newTokens.push({ kind: 'text', text: after });
        }
      } else {
        newTokens.push(token);
      }
      
      charCount += token.text.length;
    } else {
      newTokens.push(token);
      charCount += token.name.length + 1; // +1 for '@'
    }
  }
  
  return newTokens;
}

/**
 * Extract mention IDs from tokens
 * Returns array of entity IDs (e.g., ["user_123", "event_456", "city_789"])
 */
export function extractMentionIds(tokens: Token[]): string[] {
  return tokens
    .filter((t): t is MentionToken => t.kind === 'mention')
    .map(t => t.id);
}

/**
 * Extract plain text content from tokens (no mention markers)
 * Useful for character count, search indexing, etc.
 */
export function extractPlainText(tokens: Token[]): string {
  return tokens.map(token => {
    if (token.kind === 'text') {
      return token.text;
    } else {
      return `@${token.name}`;
    }
  }).join('');
}

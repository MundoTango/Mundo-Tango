/**
 * Utility to render @mentions as MT Ocean-themed pills in post content
 * Parses canonical format (@user:user_123:maria) and renders styled pills
 */

import React from 'react';
import { parseCanonicalToTokens, type EntityType } from './mentionTokens';
import { Users, Calendar, Building2, MapPin } from 'lucide-react';

// Get navigation path based on mention type and ID
const getMentionPath = (type: EntityType, id: string): string => {
  // Extract numeric ID from format like "user_123" -> "123"
  const numericId = id.split('_')[1] || id;
  
  switch (type) {
    case 'user':
      return `/profile/${numericId}`;
    case 'event':
      return `/events/${numericId}`;
    case 'group':
      // Groups still use /groups/ route for non-city groups
      return `/groups/${numericId}`;
    case 'city':
      // Cities use /cities/:slug route (MB.MD v9.9.3 compliance)
      // Extract name from ID if possible, or use ID directly
      const citySlug = id.toLowerCase().replace(/\s+/g, '-');
      return `/cities/${citySlug}-tango`;
    default:
      return '#';
  }
};

// Get Tailwind classes for mention pills - styled pill with background and border
const getMentionPillClasses = (type: EntityType, groupType?: string): string => {
  const baseClasses = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-all border";
  
  switch (type) {
    case 'group':
      if (groupType === 'professional') {
        return `${baseClasses} bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-800/40`;
      }
      return `${baseClasses} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-800/40`;
    case 'city':
      return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800/40`;
    case 'event':
      return `${baseClasses} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/40`;
    default: // user - teal/cyan theme
      return `${baseClasses} bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 hover:bg-cyan-200 dark:hover:bg-cyan-800/40`;
  }
};

const getMentionIcon = (type: EntityType) => {
  const iconProps = { className: "w-3 h-3", style: { flexShrink: 0 } };
  switch (type) {
    case 'group': return <Building2 {...iconProps} />;
    case 'city': return <MapPin {...iconProps} />;
    case 'event': return <Calendar {...iconProps} />;
    default: return <Users {...iconProps} />;
  }
};

/**
 * Clickable Mention Pill Component (like Facebook)
 * Navigates to the mentioned entity when clicked
 * Uses simple Tailwind classes for clean, Facebook-style mentions
 */
function ClickableMentionPill({ 
  type, 
  id, 
  name,
  groupType
}: { 
  type: EntityType; 
  id: string; 
  name: string;
  groupType?: string;
}) {
  const path = getMentionPath(type, id);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click handlers
    window.location.href = path; // Navigate like Facebook does
  };
  
  return (
    <span
      onClick={handleClick}
      className={getMentionPillClasses(type, groupType)}
      data-mention-id={id}
      data-mention-type={type}
      data-testid={`mention-pill-${type}-${id}`}
      title={`Click to view ${type}: ${name.replace(/_/g, ' ')}`}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      {getMentionIcon(type)}
      <span>{name.replace(/_/g, ' ')}</span>
    </span>
  );
}

/**
 * Render post content with @mentions as interactive MT Ocean-themed pills
 * 
 * @param content - Canonical format content from database
 * @returns JSX elements with styled, clickable mention pills (like Facebook)
 * 
 * @example
 * ```tsx
 * const content = "Dancing with @user:user_123:maria at @event:evt_456:Friday_Milonga";
 * return <div>{renderMentionPills(content)}</div>;
 * // Renders: "Dancing with [pill: @maria] at [pill: @Friday_Milonga]"
 * // Pills are clickable and navigate to user profile / event page
 * ```
 */
export function renderMentionPills(content: string): React.ReactNode {
  if (!content) return null;

  const tokens = parseCanonicalToTokens(content);
  
  return tokens.map((token, index) => {
    if (token.kind === 'text') {
      // Preserve whitespace and line breaks
      return token.text.split('\n').map((line, lineIndex, lines) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ));
    } else {
      // Render mention as clickable MT Ocean-themed pill
      return (
        <span key={`mention-wrapper-${index}`}>
          <ClickableMentionPill 
            type={token.type} 
            id={token.id} 
            name={token.name}
            groupType={token.groupType}
          />
          {' '}
        </span>
      );
    }
  });
}

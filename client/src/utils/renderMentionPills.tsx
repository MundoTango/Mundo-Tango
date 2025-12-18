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
      return `/groups/${numericId}`;
    case 'city':
      // Cities might have a community page or search results
      return `/communities?city=${encodeURIComponent(id)}`;
    default:
      return '#';
  }
};

// MT Ocean theme pill styles
const getMentionPillStyle = (type: EntityType, isHovered: boolean = false, groupType?: string): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '9999px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 500,
    marginLeft: '2px',
    marginRight: '2px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };

  switch (type) {
    case 'group':
      // Professional groups get orange/amber gradient, regular groups get purple
      if (groupType === 'professional') {
        return {
          ...baseStyle,
          background: isHovered 
            ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.3), rgba(251, 191, 36, 0.3))'
            : 'linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 191, 36, 0.2))',
          borderColor: isHovered ? 'rgba(251, 146, 60, 0.7)' : 'rgba(251, 146, 60, 0.5)',
          color: 'rgb(251, 146, 60)',
        };
      }
      return {
        ...baseStyle,
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(168, 85, 247, 0.3))'
          : 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(168, 85, 247, 0.2))',
        borderColor: isHovered ? 'rgba(147, 51, 234, 0.7)' : 'rgba(147, 51, 234, 0.5)',
        color: 'rgb(147, 51, 234)',
      };
    case 'city':
      return {
        ...baseStyle,
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(74, 222, 128, 0.3))'
          : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(74, 222, 128, 0.2))',
        borderColor: isHovered ? 'rgba(34, 197, 94, 0.7)' : 'rgba(34, 197, 94, 0.5)',
        color: 'rgb(34, 197, 94)',
      };
    case 'event':
      return {
        ...baseStyle,
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(30, 144, 255, 0.3), rgba(59, 130, 246, 0.3))'
          : 'linear-gradient(135deg, rgba(30, 144, 255, 0.2), rgba(59, 130, 246, 0.2))',
        borderColor: isHovered ? 'rgba(30, 144, 255, 0.7)' : 'rgba(30, 144, 255, 0.5)',
        color: 'rgb(30, 144, 255)',
      };
    default: // user
      return {
        ...baseStyle,
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(64, 224, 208, 0.3), rgba(34, 211, 238, 0.3))'
          : 'linear-gradient(135deg, rgba(64, 224, 208, 0.2), rgba(34, 211, 238, 0.2))',
        borderColor: isHovered ? 'rgba(64, 224, 208, 0.7)' : 'rgba(64, 224, 208, 0.5)',
        color: 'rgb(64, 224, 208)',
      };
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
  const [isHovered, setIsHovered] = React.useState(false);
  const path = getMentionPath(type, id);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click handlers
    window.location.href = path; // Navigate like Facebook does
  };
  
  return (
    <span
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={getMentionPillStyle(type, isHovered, groupType)}
      className="mention-pill"
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
      <span>@{name.replace(/_/g, ' ')}</span>
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

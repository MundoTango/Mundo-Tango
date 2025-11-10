/**
 * Utility to render @mentions as MT Ocean-themed pills in post content
 * Parses canonical format (@user:user_123:maria) and renders styled pills
 */

import { parseCanonicalToTokens, type EntityType } from './mentionTokens';
import { Users, Calendar, Building2, MapPin } from 'lucide-react';

// MT Ocean theme pill styles
const getMentionPillStyle = (type: EntityType): React.CSSProperties => {
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
  };

  switch (type) {
    case 'group':
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(168, 85, 247, 0.2))',
        borderColor: 'rgba(147, 51, 234, 0.5)',
        color: 'rgb(147, 51, 234)',
      };
    case 'city':
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(74, 222, 128, 0.2))',
        borderColor: 'rgba(34, 197, 94, 0.5)',
        color: 'rgb(34, 197, 94)',
      };
    case 'event':
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.2), rgba(59, 130, 246, 0.2))',
        borderColor: 'rgba(30, 144, 255, 0.5)',
        color: 'rgb(30, 144, 255)',
      };
    default: // user
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.2), rgba(34, 211, 238, 0.2))',
        borderColor: 'rgba(64, 224, 208, 0.5)',
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
 * Render post content with @mentions as interactive MT Ocean-themed pills
 * 
 * @param content - Canonical format content from database
 * @returns JSX elements with styled mention pills
 * 
 * @example
 * ```tsx
 * const content = "Dancing with @user:user_123:maria at @event:evt_456:Friday_Milonga";
 * return <div>{renderMentionPills(content)}</div>;
 * // Renders: "Dancing with [pill: @maria] at [pill: @Friday_Milonga]"
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
      // Render mention as MT Ocean-themed pill with auto spacing
      return (
        <span key={`mention-wrapper-${index}`}>
          <span
            style={getMentionPillStyle(token.type)}
            className="mention-pill hover:scale-105 active:scale-95"
            data-mention-id={token.id}
            data-mention-type={token.type}
            title={`${token.type}: ${token.name}`}
          >
            {getMentionIcon(token.type)}
            <span>@{token.name.replace(/_/g, ' ')}</span>
          </span>
          {' '}
        </span>
      );
    }
  });
}

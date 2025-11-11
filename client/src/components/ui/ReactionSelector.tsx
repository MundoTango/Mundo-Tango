import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export interface Reaction {
  id: string;
  emoji: string;
  label: string;
  color: string;
  category: 'love' | 'joy' | 'tango' | 'support' | 'sad';
}

export const REACTION_TYPES: Reaction[] = [
  // Love & Passion (3 types)
  { id: 'love', emoji: '❤️', label: 'Love', color: '#EF4444', category: 'love' },
  { id: 'passion', emoji: '🔥', label: 'Passion', color: '#F97316', category: 'love' },
  { id: 'romance', emoji: '🌹', label: 'Romance', color: '#EC4899', category: 'love' },
  
  // Joy & Celebration (3 types)
  { id: 'joy', emoji: '😊', label: 'Joy', color: '#EAB308', category: 'joy' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: '#3B82F6', category: 'joy' },
  { id: 'celebration', emoji: '🎉', label: 'Celebration', color: '#A855F7', category: 'joy' },
  
  // Tango-Specific (4 types)
  { id: 'tango_dancer', emoji: '💃', label: 'Beautiful Dancing', color: '#DB2777', category: 'tango' },
  { id: 'tango_leader', emoji: '🕺', label: 'Strong Lead', color: '#2563EB', category: 'tango' },
  { id: 'music', emoji: '🎵', label: 'Great Music', color: '#6366F1', category: 'tango' },
  { id: 'elegance', emoji: '✨', label: 'Elegance', color: '#F59E0B', category: 'tango' },
  
  // Support & Encouragement (2 types)
  { id: 'support', emoji: '👏', label: 'Applause', color: '#10B981', category: 'support' },
  { id: 'inspiration', emoji: '💫', label: 'Inspiring', color: '#06B6D4', category: 'support' },
  
  // Sadness (1 type)
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#6B7280', category: 'sad' }
];

interface ReactionSelectorProps {
  postId: number;
  currentReaction?: string;
  reactions?: { [key: string]: number };
  totalCount?: number;
  onReact: (reactionId: string) => void;
  className?: string;
}

export const ReactionSelector = ({
  postId,
  currentReaction,
  reactions = {},
  totalCount,
  onReact,
  className = ''
}: ReactionSelectorProps) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleReactionClick = (reactionId: string) => {
    if (currentReaction === reactionId) {
      onReact('');
    } else {
      onReact(reactionId);
    }
    setShowReactions(false);
  };

  const getTotalReactions = () => {
    if (totalCount !== undefined) return totalCount;
    return Object.values(reactions).reduce((sum, count) => sum + count, 0);
  };

  const getCurrentReactionEmoji = () => {
    if (currentReaction) {
      const reaction = REACTION_TYPES.find(r => r.id === currentReaction);
      return reaction?.emoji || '❤️';
    }
    return null;
  };

  const getCurrentReactionColor = () => {
    if (currentReaction) {
      const reaction = REACTION_TYPES.find(r => r.id === currentReaction);
      return reaction?.color || '#40E0D0';
    }
    return '#40E0D0';
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    hoverTimeoutRef.current = setTimeout(() => {
      if (isHovering) {
        setShowReactions(true);
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setTimeout(() => {
      if (!isHovering) {
        setShowReactions(false);
      }
    }, 300);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Main Like/React Button */}
      <button
        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover-elevate"
        style={{
          background: currentReaction 
            ? `linear-gradient(135deg, ${getCurrentReactionColor()}15, ${getCurrentReactionColor()}25)`
            : 'transparent',
          color: currentReaction ? getCurrentReactionColor() : 'var(--muted-foreground)',
        }}
        onClick={() => currentReaction ? onReact('') : onReact('love')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-testid={`button-react-${postId}`}
      >
        {currentReaction ? (
          <span className="text-lg transition-transform group-hover:scale-110">
            {getCurrentReactionEmoji()}
          </span>
        ) : (
          <Heart className="w-5 h-5 transition-transform group-hover:scale-110" />
        )}
        {getTotalReactions() > 0 && (
          <span className="text-sm font-medium" data-testid={`text-reaction-count-${postId}`}>
            {getTotalReactions()}
          </span>
        )}
      </button>

      {/* Reaction Picker Popup */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 z-50"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={handleMouseLeave}
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.95), rgba(30, 144, 255, 0.95))',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 8px 32px rgba(64, 224, 208, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
            data-testid={`popup-reactions-${postId}`}
          >
            <div className="flex gap-2">
              {REACTION_TYPES.map((reaction) => (
                <button
                  key={reaction.id}
                  onClick={() => handleReactionClick(reaction.id)}
                  className="group relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover-elevate"
                  style={{
                    background: currentReaction === reaction.id 
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                  }}
                  title={reaction.label}
                  data-testid={`button-reaction-${reaction.id}-${postId}`}
                >
                  <span className="text-2xl transition-transform group-hover:scale-125">
                    {reaction.emoji}
                  </span>
                  <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {reaction.label}
                  </span>
                  {reactions[reaction.id] && reactions[reaction.id] > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ color: reaction.color }}
                    >
                      {reactions[reaction.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction Breakdown (if there are multiple reactions) */}
      {getTotalReactions() > 0 && Object.keys(reactions).filter(k => reactions[k] > 0).length > 1 && (
        <div className="absolute top-full left-0 mt-1 text-xs text-muted-foreground flex gap-1 flex-wrap">
          {Object.entries(reactions)
            .filter(([_, count]) => count > 0)
            .map(([reactionId, count]) => {
              const reaction = REACTION_TYPES.find(r => r.id === reactionId);
              if (!reaction) return null;
              return (
                <span key={reactionId} className="flex items-center gap-0.5">
                  {reaction.emoji} {count}
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
};

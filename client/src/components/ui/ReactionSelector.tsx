import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Heart, 
  Flame, 
  Flower2, 
  Smile, 
  Eye, 
  PartyPopper, 
  User, 
  Users, 
  Music, 
  Sparkles, 
  HandMetal, 
  Lightbulb, 
  Frown,
  type LucideIcon
} from "lucide-react";

export interface Reaction {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
  category: 'love' | 'joy' | 'tango' | 'support' | 'sad';
}

export const REACTION_TYPES: Reaction[] = [
  { id: 'love', icon: Heart, label: 'Love', color: '#EF4444', category: 'love' },
  { id: 'passion', icon: Flame, label: 'Passion', color: '#F97316', category: 'love' },
  { id: 'joy', icon: Smile, label: 'Joy', color: '#FBBF24', category: 'joy' },
  { id: 'wow', icon: Eye, label: 'Wow', color: '#3B82F6', category: 'joy' },
  { id: 'music', icon: Music, label: 'Music', color: '#A855F7', category: 'tango' },
  { id: 'inspiration', icon: Lightbulb, label: 'Inspiration', color: '#10B981', category: 'support' },
];

interface ReactionSelectorProps {
  targetId: number;
  targetType: 'post' | 'comment';
  postId?: number;
  currentReaction?: string;
  reactions?: { [key: string]: number };
  totalCount?: number;
  className?: string;
  isLoading?: boolean;
  onReact?: (reactionId: string) => Promise<void> | void;
  onCountClick?: () => void;
  'data-testid'?: string;
}

export const ReactionSelector = ({
  targetId,
  targetType,
  postId,
  currentReaction,
  reactions = {},
  totalCount,
  className = '',
  isLoading = false,
  onReact,
  onCountClick,
  'data-testid': dataTestId
}: ReactionSelectorProps) => {
  const queryClient = useQueryClient();
  const [showReactions, setShowReactions] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [localReaction, setLocalReaction] = useState(currentReaction);
  const [localReactions, setLocalReactions] = useState(reactions);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalReaction(currentReaction);
  }, [currentReaction]);

  useEffect(() => {
    setLocalReactions(reactions);
  }, [reactions]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const handleReactionClick = async (reactionId: string) => {
    // If the user clicks the same reaction, it should toggle off (standard behavior)
    // but the user wants it to "persist" and "change to the new icon" if they change their mind.
    // The current logic already handles changing (previous reaction is decremented, new one incremented).
    // Let's ensure the toggledReaction logic is solid for "changing mind".
    const toggledReaction = reactionId;
    const previousReaction = localReaction;
    const previousReactions = { ...localReactions };
    
    // Optimistically update local state
    setLocalReaction(toggledReaction);
    const newReactions = { ...localReactions };
    
    if (previousReaction && previousReaction === reactionId) {
      // Toggling off the same reaction
      setLocalReaction(undefined);
      newReactions[reactionId] = Math.max(0, newReactions[reactionId] - 1);
      setLocalReactions(newReactions);
      
      try {
        const toggledOffReaction = '';
        if (onReact) {
          await onReact(toggledOffReaction);
        } else {
          const endpoint = targetType === 'post' 
            ? `/api/posts/${targetId}/react`
            : `/api/comments/${targetId}/react`;
          
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ reactionType: toggledOffReaction })
          });
          
          if (targetType === 'comment' && postId) {
            queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'comments'] });
          } else if (targetType === 'post') {
            queryClient.invalidateQueries({ queryKey: ['/api/posts', targetId] });
          }
        }
      } catch (error) {
        console.error('Reaction failed:', error);
        setLocalReaction(previousReaction);
        setLocalReactions(previousReactions);
      }
      setShowReactions(false);
      return;
    }

    // Changing mind or first time reacting
    if (previousReaction && previousReaction !== reactionId) {
      if (newReactions[previousReaction]) {
        newReactions[previousReaction] = Math.max(0, newReactions[previousReaction] - 1);
      }
    }
    newReactions[reactionId] = (newReactions[reactionId] || 0) + 1;
    setLocalReactions(newReactions);
    
    try {
      if (onReact) {
        await onReact(toggledReaction);
      } else {
        const endpoint = targetType === 'post' 
          ? `/api/posts/${targetId}/react`
          : `/api/comments/${targetId}/react`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reactionType: toggledReaction })
        });
        
        if (!response.ok) {
          throw new Error(`Reaction failed: ${response.status}`);
        }
        
        if (targetType === 'comment' && postId) {
          queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'comments'] });
        } else if (targetType === 'post') {
          queryClient.invalidateQueries({ queryKey: ['/api/posts', targetId] });
        }
      }
      setShowReactions(false);
    } catch (error) {
      console.error('Reaction failed:', error);
      setLocalReaction(previousReaction);
      setLocalReactions(previousReactions);
    }
  };

  const getTotalReactions = () => {
    if (totalCount !== undefined) return totalCount;
    return Object.values(localReactions).reduce((sum, count) => sum + count, 0);
  };

  const getCurrentReactionIcon = () => {
    if (localReaction) {
      const reaction = REACTION_TYPES.find(r => r.id === localReaction);
      return reaction?.icon || Heart;
    }
    return null;
  };

  const getCurrentReactionColor = () => {
    if (localReaction) {
      const reaction = REACTION_TYPES.find(r => r.id === localReaction);
      return reaction?.color || '#40E0D0';
    }
    return '#40E0D0';
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactions(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 100);
  };

  return (
    <div 
      className={`relative ${className}`} 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Like/React Button */}
      <button
        type="button"
        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover-elevate bg-black/5 dark:bg-white/10"
        style={{
          ...(localReaction && {
            background: `linear-gradient(135deg, ${getCurrentReactionColor()}15, ${getCurrentReactionColor()}25)`,
          }),
          color: localReaction ? getCurrentReactionColor() : 'inherit',
        }}
        onClick={() => handleReactionClick(localReaction || 'love')}
        data-testid={`button-react-${targetId}`}
      >
        {localReaction ? (() => {
          const IconComponent = getCurrentReactionIcon();
          return IconComponent ? (
            <IconComponent 
              className="w-5 h-5 transition-transform group-hover:scale-110" 
              fill="currentColor"
              strokeWidth={2}
            />
          ) : (
            <Heart 
              className="w-5 h-5 transition-transform group-hover:scale-110" 
              strokeWidth={2}
            />
          );
        })() : (
          <Heart 
            className="w-5 h-5 transition-transform group-hover:scale-110" 
            strokeWidth={2}
          />
        )}
        {getTotalReactions() > 0 && (
          <span 
            className={`text-sm font-medium ${onCountClick ? 'hover:underline cursor-pointer' : ''}`}
            data-testid={`text-reaction-count-${targetId}`}
            onClick={(e) => {
              if (onCountClick) {
                e.stopPropagation();
                onCountClick();
              }
            }}
          >
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
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.95), rgba(30, 144, 255, 0.95))',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 8px 32px rgba(64, 224, 208, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              pointerEvents: 'auto',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-testid={`popup-reactions-${targetId}`}
          >
            <div className="flex gap-2">
              {REACTION_TYPES.map((reaction) => {
                const IconComponent = reaction.icon;
                return (
                  <button
                    type="button"
                    key={reaction.id}
                    onClick={() => handleReactionClick(reaction.id)}
                    className="group relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover-elevate"
                    style={{
                      background: localReaction === reaction.id 
                        ? 'rgba(255, 255, 255, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)',
                    }}
                    title={reaction.label}
                    data-testid={`button-reaction-${reaction.id}-${targetId}`}
                  >
                    <IconComponent 
                      className="w-6 h-6 transition-transform group-hover:scale-125"
                      style={{ color: reaction.color }}
                      fill={localReaction === reaction.id ? reaction.color : 'none'}
                      strokeWidth={2}
                    />
                    {localReactions[reaction.id] && localReactions[reaction.id] > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        style={{ color: reaction.color }}
                      >
                        {localReactions[reaction.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction Breakdown (if there are multiple reactions) */}
      {getTotalReactions() > 0 && Object.keys(localReactions).filter(k => localReactions[k] > 0).length > 1 && (
        <div className="absolute top-full left-0 mt-1 text-xs text-muted-foreground flex gap-1 flex-wrap">
          {Object.entries(localReactions)
            .filter(([_, count]) => count > 0)
            .map(([reactionId, count]) => {
              const reaction = REACTION_TYPES.find(r => r.id === reactionId);
              if (!reaction) return null;
              const IconComponent = reaction.icon;
              return (
                <span key={reactionId} className="flex items-center gap-0.5">
                  <IconComponent className="w-3 h-3" style={{ color: reaction.color }} /> {count}
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
};

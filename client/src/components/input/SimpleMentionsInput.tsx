import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Loader2, AtSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface MentionUser {
  id: number;
  name: string;
  username: string | null;
  profileImage?: string | null;
  type?: string;
  displayType?: string;
  displayName?: string;
}

interface SimpleMentionsInputProps {
  value: string;
  onChange: (value: string, mentions: MentionUser[]) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  maxRows?: number;
}

export function SimpleMentionsInput({
  value,
  onChange,
  placeholder = "What's on your mind?",
  className = "",
  minRows = 3,
  maxRows = 10,
}: SimpleMentionsInputProps) {
  const [mentions, setMentions] = useState<MentionUser[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Get mention pill colors based on type
  const getMentionPillStyle = (type?: string) => {
    switch (type) {
      case 'professional-group':
        return {
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(168, 85, 247, 0.2))',
          borderColor: 'rgba(147, 51, 234, 0.5)',
          color: 'rgb(147, 51, 234)',
        };
      case 'city-group':
        return {
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(74, 222, 128, 0.2))',
          borderColor: 'rgba(34, 197, 94, 0.5)',
          color: 'rgb(34, 197, 94)',
        };
      case 'event':
        return {
          background: 'linear-gradient(135deg, rgba(30, 144, 255, 0.2), rgba(59, 130, 246, 0.2))',
          borderColor: 'rgba(30, 144, 255, 0.5)',
          color: 'rgb(30, 144, 255)',
        };
      default: // user
        return {
          background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.2), rgba(34, 211, 238, 0.2))',
          borderColor: 'rgba(64, 224, 208, 0.5)',
          color: 'rgb(64, 224, 208)',
        };
    }
  };

  const getMentionIcon = (type?: string) => {
    switch (type) {
      case 'professional-group': return '👔';
      case 'city-group': return '🏙️';
      case 'event': return '📅';
      default: return '👤';
    }
  };

  // Update dropdown position
  useEffect(() => {
    if (showMentionDropdown && editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showMentionDropdown]);

  // Search for users when @ is typed
  useEffect(() => {
    if (showMentionDropdown) {
      setIsSearching(true);
      const searchUsers = async () => {
        try {
          const response = await fetch(
            `/api/mentions/search?query=${encodeURIComponent(mentionSearchQuery)}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
            }
          );
          if (response.ok) {
            const results = await response.json();
            // Map the results to MentionUser format
            const mappedUsers = results.map((r: any) => ({
              id: r.id,
              name: r.name,
              username: r.username,
              profileImage: r.avatar,
              type: r.type,
              displayType: r.type === 'professional-group' ? 'Professional Group' : r.type === 'city-group' ? 'City Group' : r.type,
              displayName: r.name,
            }));
            setMentionUsers(mappedUsers);
          }
        } catch (error) {
          console.error('Failed to search users:', error);
        } finally {
          setIsSearching(false);
        }
      };
      
      const debounce = setTimeout(searchUsers, 300);
      return () => clearTimeout(debounce);
    } else {
      setMentionUsers([]);
    }
  }, [mentionSearchQuery, showMentionDropdown]);

  // Parse content to render mentions as pills
  const renderContent = () => {
    if (!value) {
      return <span className="text-muted-foreground pointer-events-none">{placeholder}</span>;
    }

    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    
    // Find all @mentions in the content
    const mentionRegex = /@\[([^\]]+)\]\((\d+):([^)]+)\)/g;
    let match;

    while ((match = mentionRegex.exec(value)) !== null) {
      const [fullMatch, displayName, mentionId, mentionType] = match;
      const startIndex = match.index;
      
      // Add text before mention
      if (startIndex > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {value.substring(lastIndex, startIndex)}
          </span>
        );
      }

      // Find the full mention object
      const mention = mentions.find(m => m.id === parseInt(mentionId));
      const pillStyle = getMentionPillStyle(mentionType);
      const icon = getMentionIcon(mentionType);

      // Add mention pill
      parts.push(
        <span
          key={`mention-${mentionId}-${startIndex}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium mx-0.5"
          style={pillStyle}
          contentEditable={false}
          data-mention-id={mentionId}
          data-mention-type={mentionType}
        >
          <span>{icon}</span>
          <span>{displayName}</span>
        </span>
      );

      lastIndex = startIndex + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < value.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {value.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="text-muted-foreground pointer-events-none">{placeholder}</span>;
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || "";
    
    // Check if user is typing a mention
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textBeforeCursor = range.startContainer.textContent?.substring(0, range.startOffset) || "";
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
      // Check if there's no space after @ (still typing mention)
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setShowMentionDropdown(true);
        setMentionSearchQuery(textAfterAt);
        setSelectedMentionIndex(0);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }

    onChange(text, mentions);
  };

  const insertMention = (user: MentionUser) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const textBeforeCursor = range.startContainer.textContent || "";
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      // Get all text content
      const fullText = editorRef.current.textContent || "";
      
      // Find the position of @ in the full text
      let cursorOffset = 0;
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let currentNode;
      while ((currentNode = walker.nextNode())) {
        if (currentNode === range.startContainer) {
          cursorOffset += range.startOffset;
          break;
        }
        cursorOffset += currentNode.textContent?.length || 0;
      }

      const atPosition = fullText.lastIndexOf('@', cursorOffset);
      
      if (atPosition !== -1) {
        const beforeAt = fullText.substring(0, atPosition);
        const afterMention = fullText.substring(cursorOffset);
        
        // Create mention marker: @[DisplayName](id:type)
        const mentionMarker = `@[${user.displayName || user.name}](${user.id}:${user.type || 'user'})`;
        const newValue = beforeAt + mentionMarker + ' ' + afterMention;

        // Add user to mentions array if not already there
        const newMentions = mentions.find(m => m.id === user.id)
          ? mentions
          : [...mentions, user];
        
        setMentions(newMentions);
        onChange(newValue, newMentions);
        setShowMentionDropdown(false);
        setMentionSearchQuery("");

        // Update the editor content
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            // Move cursor to end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }, 0);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (showMentionDropdown && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => 
          prev < mentionUsers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        insertMention(mentionUsers[selectedMentionIndex]);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionUsers[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentionDropdown(false);
      }
    }
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-y-auto ${className}`}
        style={{ minHeight: `${minRows * 24}px`, maxHeight: `${maxRows * 24}px` }}
        data-testid="input-mentions-content"
        suppressContentEditableWarning
      >
        {renderContent()}
      </div>

      {/* Mention Autocomplete Dropdown - Portal to body for highest z-index */}
      {showMentionDropdown && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top + 4}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 999999,
            }}
          >
            <Card 
              className="p-2 max-h-64 overflow-y-auto shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgb(64, 224, 208), rgb(30, 144, 255))',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgb(64, 224, 208)',
                boxShadow: '0 12px 40px rgba(64, 224, 208, 0.5), 0 0 20px rgba(30, 144, 255, 0.3)',
              }}
              data-testid="mentions-dropdown"
            >
              {isSearching ? (
                <div className="flex items-center justify-center py-4 text-white">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </div>
              ) : mentionUsers.length > 0 ? (
                <div className="space-y-1">
                  {mentionUsers.map((user, index) => (
                    <button
                      key={user.id}
                      onClick={() => insertMention(user)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all text-white font-medium ${
                        index === selectedMentionIndex
                          ? 'scale-105'
                          : 'hover:scale-102'
                      }`}
                      style={{
                        background: index === selectedMentionIndex 
                          ? 'rgba(255, 255, 255, 0.25)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index === selectedMentionIndex 
                          ? 'rgba(255, 255, 255, 0.25)'
                          : 'transparent';
                      }}
                      data-testid={`mention-result-${user.id}`}
                    >
                      <Avatar className="w-8 h-8 border-2 border-white/50">
                        <AvatarImage src={user.profileImage || undefined} />
                        <AvatarFallback className="bg-white/20 text-white">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate text-white">{user.name}</div>
                        <div className="text-xs truncate flex items-center gap-1.5">
                          {user.username && <span className="text-white/80">@{user.username}</span>}
                          {user.displayType && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-white/20 text-white">
                              {user.displayType === 'User' && '👤'}
                              {user.displayType === 'City Group' && '🏙️'}
                              {user.displayType === 'Professional Group' && '👔'}
                              {user.displayType === 'Event' && '📅'}
                              {' '}{user.displayType}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="text-center py-4 text-sm text-white/80">
                  No results found
                </div>
              ) : (
                <div className="flex items-center gap-2 py-4 text-sm text-white/80 justify-center">
                  <AtSign className="w-4 h-4" />
                  Type to search
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Loader2, AtSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MentionUser {
  id: number;
  name: string;
  username: string | null;
  profileImage?: string | null;
  type?: string;
  displayType?: string;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24; // Approximate line height
      const rows = Math.min(Math.max(Math.ceil(scrollHeight / lineHeight), minRows), maxRows);
      textareaRef.current.style.height = `${rows * lineHeight}px`;
    }
  }, [value, minRows, maxRows]);

  // Search for users when @ is typed
  useEffect(() => {
    if (showMentionDropdown) {
      setIsSearching(true);
      const searchUsers = async () => {
        try {
          const response = await fetch(
            `/api/user/mention-search?q=${encodeURIComponent(mentionSearchQuery)}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          if (response.ok) {
            const users = await response.json();
            setMentionUsers(users);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);

    // Check if user is typing a mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
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

    onChange(newValue, mentions);
  };

  const insertMention = (user: MentionUser) => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    // Find the @ symbol position
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const beforeAt = value.substring(0, lastAtSymbol);
      const mentionText = user.username ? `@${user.username} ` : `@${user.name.replace(/\s+/g, '-')} `;
      const newValue = beforeAt + mentionText + textAfterCursor;
      const newCursorPos = beforeAt.length + mentionText.length;

      // Add user to mentions array if not already there
      const newMentions = mentions.find(m => m.id === user.id)
        ? mentions
        : [...mentions, user];
      
      setMentions(newMentions);
      onChange(newValue, newMentions);
      setShowMentionDropdown(false);
      setMentionSearchQuery("");

      // Set cursor position after mention
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionDropdown && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => 
          prev < mentionUsers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionUsers[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentionDropdown(false);
      }
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        style={{ minHeight: `${minRows * 24}px`, maxHeight: `${maxRows * 24}px` }}
        data-testid="input-mentions-content"
      />

      {/* Mention Autocomplete Dropdown */}
      <AnimatePresence>
        {showMentionDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full"
          >
            <Card 
              className="p-2 max-h-64 overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.08), rgba(30, 144, 255, 0.05))',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(64, 224, 208, 0.3)',
              }}
              data-testid="mentions-dropdown"
            >
              {isSearching ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </div>
              ) : mentionUsers.length > 0 ? (
                <div className="space-y-1">
                  {mentionUsers.map((user, index) => (
                    <button
                      key={user.id}
                      onClick={() => insertMention(user)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        index === selectedMentionIndex
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
                          : 'hover:bg-muted/50'
                      }`}
                      data-testid={`mention-result-${user.id}`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profileImage || undefined} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          {user.username && <span>@{user.username}</span>}
                          {user.displayType && (
                            <span className="text-cyan-500">• {user.displayType}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground justify-center">
                  <AtSign className="w-4 h-4" />
                  Type to search users
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

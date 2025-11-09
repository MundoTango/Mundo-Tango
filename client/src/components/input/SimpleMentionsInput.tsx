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
  const [isFocused, setIsFocused] = useState(false);

  // Get mention pill colors based on type
  const getMentionPillStyle = (type?: string): React.CSSProperties => {
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
    };

    switch (type) {
      case 'professional-group':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(168, 85, 247, 0.2))',
          borderColor: 'rgba(147, 51, 234, 0.5)',
          color: 'rgb(147, 51, 234)',
        };
      case 'city-group':
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

  // Render content with inline pills using innerHTML
  useEffect(() => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const currentHTML = editor.innerHTML;
    
    // Parse mentions from value and create HTML with pills
    let html = value || '';
    
    // Show placeholder only if not focused and empty
    if (!html && !isFocused) {
      editor.innerHTML = `<span class="placeholder-text" style="color: var(--muted-foreground); pointer-events: none; user-select: none;">${placeholder}</span>`;
      return;
    } else if (!html && isFocused) {
      // Clear placeholder when focused
      editor.innerHTML = '';
      return;
    }

    // Find all @mentions in format @[DisplayName](id:type)
    const mentionRegex = /@\[([^\]]+)\]\((\d+):([^)]+)\)/g;
    html = html.replace(mentionRegex, (match, displayName, mentionId, mentionType) => {
      const style = getMentionPillStyle(mentionType);
      const icon = getMentionIcon(mentionType);
      const styleStr = Object.entries(style)
        .map(([key, val]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val}`)
        .join('; ');
      
      return `<span class="mention-pill" data-mention-id="${mentionId}" data-mention-type="${mentionType}" contenteditable="false" style="${styleStr}"><span>${icon}</span><span>${displayName}</span></span>`;
    });

    // Only update if different to avoid cursor issues
    if (currentHTML !== html) {
      const selection = window.getSelection();
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const cursorOffset = range ? range.startOffset : 0;
      
      editor.innerHTML = html;
      
      // Restore cursor position
      if (range && editor.firstChild) {
        try {
          const newRange = document.createRange();
          const textNode = editor.firstChild;
          newRange.setStart(textNode, Math.min(cursorOffset, (textNode.textContent || '').length));
          newRange.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(newRange);
        } catch (e) {
          // Cursor restoration failed, no big deal
        }
      }
    }
  }, [value, placeholder, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    
    // Clear placeholder immediately on focus
    if (editorRef.current && !value) {
      editorRef.current.innerHTML = '';
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    
    // Extract text value while preserving mention markers
    let extractedValue = '';
    const editor = editorRef.current;
    
    // Walk through all child nodes and reconstruct the value
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        
        // Check if it's a mention pill
        if (element.classList.contains('mention-pill')) {
          const mentionId = element.getAttribute('data-mention-id');
          const mentionType = element.getAttribute('data-mention-type');
          const displayName = element.textContent?.replace(/^👤|^📅|^👔|^🏙️/, '').trim() || '';
          
          if (mentionId && mentionType && displayName) {
            return `@[${displayName}](${mentionId}:${mentionType})`;
          }
        }
        
        // Recursively process child nodes
        let result = '';
        node.childNodes.forEach(child => {
          result += processNode(child);
        });
        return result;
      }
      return '';
    };
    
    editor.childNodes.forEach(child => {
      extractedValue += processNode(child);
    });
    
    // Use textContent for cursor position detection
    const text = editor.textContent || "";
    
    // Check if user is typing a mention
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      onChange(extractedValue, mentions);
      return;
    }

    const range = selection.getRangeAt(0);
    let textBeforeCursor = '';
    
    // Get text before cursor
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    textBeforeCursor = preCaretRange.toString();

    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    console.log('[Mention Debug] Text before cursor:', textBeforeCursor);
    console.log('[Mention Debug] Last @ position:', lastAtSymbol);
    
    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
      console.log('[Mention Debug] Text after @:', textAfterAt);
      console.log('[Mention Debug] Has space?:', textAfterAt.includes(' '));
      
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        console.log('[Mention Debug] ✅ Showing dropdown, search query:', textAfterAt);
        setShowMentionDropdown(true);
        setMentionSearchQuery(textAfterAt);
        setSelectedMentionIndex(0);
      } else {
        console.log('[Mention Debug] ❌ Hiding dropdown (has space)');
        setShowMentionDropdown(false);
      }
    } else {
      console.log('[Mention Debug] ❌ No @ found');
      setShowMentionDropdown(false);
    }

    onChange(extractedValue, mentions);
  };

  const insertMention = (user: MentionUser) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const text = editorRef.current.textContent || "";
    const range = selection.getRangeAt(0);
    
    // Get cursor position
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const cursorOffset = preCaretRange.toString().length;

    const lastAtSymbol = text.lastIndexOf('@', cursorOffset);

    if (lastAtSymbol !== -1) {
      const beforeAt = text.substring(0, lastAtSymbol);
      const afterCursor = text.substring(cursorOffset);
      
      // Create mention marker: @[DisplayName](id:type)
      const mentionMarker = `@[${user.displayName || user.name}](${user.id}:${user.type || 'user'})`;
      const newValue = beforeAt + mentionMarker + ' ' + afterCursor;

      // Add user to mentions array if not already there
      const newMentions = mentions.find(m => m.id === user.id)
        ? mentions
        : [...mentions, user];
      
      setMentions(newMentions);
      onChange(newValue, newMentions);
      setShowMentionDropdown(false);
      setMentionSearchQuery("");

      // Position cursor after the mention + space
      setTimeout(() => {
        if (!editorRef.current) return;
        
        editorRef.current.focus();
        
        // Calculate the position after the inserted mention marker + space
        const newCursorPos = beforeAt.length + mentionMarker.length + 1; // +1 for space
        
        // Find the text node and set cursor position
        const walker = document.createTreeWalker(
          editorRef.current,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let currentPos = 0;
        let targetNode: Node | null = null;
        let targetOffset = 0;
        
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const nodeLength = (node.textContent || '').length;
          
          if (currentPos + nodeLength >= newCursorPos) {
            targetNode = node;
            targetOffset = newCursorPos - currentPos;
            break;
          }
          
          currentPos += nodeLength;
        }
        
        if (targetNode) {
          const newRange = document.createRange();
          newRange.setStart(targetNode, Math.min(targetOffset, (targetNode.textContent || '').length));
          newRange.collapse(true);
          
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(newRange);
        }
      }, 50); // Increased timeout to ensure DOM is updated
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
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-y-auto ${className}`}
        style={{ minHeight: `${minRows * 24}px`, maxHeight: `${maxRows * 24}px` }}
        data-testid="input-mentions-content"
        suppressContentEditableWarning
      />

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

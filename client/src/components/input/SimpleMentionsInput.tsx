import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Loader2, Users, Calendar, Building2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Token,
  MentionToken,
  EntityType,
  parseCanonicalToTokens,
  tokensToCanonical,
  tokensToDisplay,
  findMentionTriggerAtCursor,
  replaceTriggerWithMention,
  extractMentionIds,
} from "@/utils/mentionTokens";

export interface MentionEntity {
  id: string; // Format: "user_123", "event_456", "group_789", "city_012"
  type: EntityType;
  display: string; // Username or entity name
  name?: string;
  avatar?: string | null;
  subtitle?: string;
  metadata?: any;
}

interface SimpleMentionsInputProps {
  value: string; // Canonical format: "Hello @user:user_123:maria at @event:evt_456:Friday_Milonga"
  onChange: (canonicalValue: string, mentions: MentionEntity[]) => void;
  onMentionsChange?: (mentionIds: string[]) => void; // NEW: Separate mention IDs callback
  placeholder?: string;
  className?: string;
  minRows?: number;
  maxRows?: number;
}

export function SimpleMentionsInput({
  value,
  onChange,
  onMentionsChange,
  placeholder = "What's on your mind?",
  className = "",
  minRows = 3,
  maxRows = 10,
}: SimpleMentionsInputProps) {
  const [tokens, setTokens] = useState<Token[]>(() => parseCanonicalToTokens(value));
  const [mentions, setMentions] = useState<MentionEntity[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<MentionEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false); // IME composition handling
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const lastCanonicalRef = useRef<string>(value);
  const isUpdatingRef = useRef(false); // Prevent render loops

  // Get mention pill colors/icons based on type (MT Ocean theme)
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
    switch (type) {
      case 'group': return <Building2 className="w-3 h-3" />;
      case 'city': return <MapPin className="w-3 h-3" />;
      case 'event': return <Calendar className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  // Sync tokens when value changes externally
  useEffect(() => {
    const canonical = tokensToCanonical(tokens);
    if (canonical !== lastCanonicalRef.current && value !== canonical) {
      const newTokens = parseCanonicalToTokens(value);
      setTokens(newTokens);
      lastCanonicalRef.current = value;
    }
  }, [value]);

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

  // Search for mentions when @ is typed (debounced 300ms)
  useEffect(() => {
    if (!showMentionDropdown) {
      setMentionResults([]);
      return;
    }

    setIsSearching(true);
    const searchMentions = async () => {
      try {
        // Use SEPARATE endpoints for better performance
        const endpoints: Record<EntityType, string> = {
          user: `/api/mentions/users/search?q=${encodeURIComponent(mentionSearchQuery)}`,
          event: `/api/mentions/events/search?q=${encodeURIComponent(mentionSearchQuery)}`,
          group: `/api/mentions/groups/search?q=${encodeURIComponent(mentionSearchQuery)}`,
          city: `/api/mentions/cities/search?q=${encodeURIComponent(mentionSearchQuery)}`,
        };

        // Fetch all entity types in parallel
        const responses = await Promise.all(
          (Object.keys(endpoints) as EntityType[]).map(async (type) => {
            const response = await fetch(endpoints[type], {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              },
            });
            if (response.ok) {
              const { data } = await response.json();
              return data as MentionEntity[];
            }
            return [];
          })
        );

        const allResults = responses.flat();
        setMentionResults(allResults.slice(0, 10));
      } catch (error) {
        console.error('Failed to search mentions:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchMentions, 300);
    return () => clearTimeout(debounce);
  }, [mentionSearchQuery, showMentionDropdown]);

  // Render content with inline pills
  useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current) return;

    const editor = editorRef.current;
    const displayText = tokensToDisplay(tokens);

    // Show placeholder if empty and not focused
    if (!displayText && !isFocused) {
      editor.innerHTML = `<span class="placeholder-text" style="color: var(--muted-foreground); pointer-events: none;">${placeholder}</span>`;
      return;
    }

    // Build HTML with mention pills
    let html = '';
    for (const token of tokens) {
      if (token.kind === 'text') {
        // Escape HTML and preserve whitespace
        html += token.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
      } else {
        const style = getMentionPillStyle(token.type);
        const styleStr = Object.entries(style)
          .map(([key, val]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val}`)
          .join('; ');
        
        html += `<span class="mention-pill" data-mention-id="${token.id}" data-mention-type="${token.type}" contenteditable="false" style="${styleStr}">`;
        html += `<span class="mention-icon"></span>`;
        html += `<span>@${token.name}</span>`;
        html += `</span>`;
      }
    }

    // Only update if content actually changed
    if (editor.innerHTML !== html) {
      const selection = window.getSelection();
      let cursorOffset = 0;
      
      // Save cursor position if focused
      if (selection && selection.rangeCount > 0 && isFocused) {
        try {
          const range = selection.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(editor);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          cursorOffset = preCaretRange.toString().length;
        } catch (e) {
          // Ignore cursor save errors
        }
      }

      editor.innerHTML = html || '';

      // Restore cursor after DOM update
      if (isFocused && cursorOffset > 0 && html) {
        requestAnimationFrame(() => {
          try {
            const range = document.createRange();
            const sel = window.getSelection();
            let charCount = 0;
            let found = false;

            const findPosition = (node: Node): boolean => {
              if (node.nodeType === Node.TEXT_NODE) {
                const textLength = (node.textContent || '').length;
                if (charCount + textLength >= cursorOffset) {
                  range.setStart(node, Math.min(cursorOffset - charCount, textLength));
                  range.collapse(true);
                  found = true;
                  return true;
                }
                charCount += textLength;
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                if (element.classList?.contains('mention-pill')) {
                  const textLength = (element.textContent || '').length;
                  if (charCount + textLength >= cursorOffset) {
                    // Place cursor after pill
                    if (element.nextSibling) {
                      if (element.nextSibling.nodeType === Node.TEXT_NODE) {
                        range.setStart(element.nextSibling, 0);
                      } else {
                        range.setStartAfter(element);
                      }
                    } else {
                      range.setStartAfter(element);
                    }
                    range.collapse(true);
                    found = true;
                    return true;
                  }
                  charCount += textLength;
                  return false;
                }
                // Recursively search child nodes
                for (const child of Array.from(element.childNodes)) {
                  if (findPosition(child)) return true;
                }
              }
              return false;
            };

            findPosition(editor);

            if (found && sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch (e) {
            console.error('Cursor restore error:', e);
          }
        });
      }
    }
  }, [tokens, isFocused, placeholder]);

  // Handle paste - plain text only
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Extract tokens from DOM (preserves mentions)
  const extractTokensFromDOM = (): Token[] => {
    if (!editorRef.current) return [];
    
    const newTokens: Token[] = [];
    const traverseNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          const lastToken = newTokens[newTokens.length - 1];
          if (lastToken && lastToken.kind === 'text') {
            lastToken.text += text;
          } else {
            newTokens.push({ kind: 'text', text });
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        
        // Extract mention pills
        if (element.classList.contains('mention-pill')) {
          const type = element.getAttribute('data-mention-type') as EntityType || 'user';
          const id = element.getAttribute('data-mention-id') || '';
          const name = element.textContent?.replace('@', '') || '';
          newTokens.push({ kind: 'mention', type, id, name });
        } else if (element.tagName === 'BR') {
          const lastToken = newTokens[newTokens.length - 1];
          if (lastToken && lastToken.kind === 'text') {
            lastToken.text += '\n';
          } else {
            newTokens.push({ kind: 'text', text: '\n' });
          }
        } else {
          // Recursively traverse children
          Array.from(element.childNodes).forEach(traverseNode);
        }
      }
    };
    
    Array.from(editorRef.current.childNodes).forEach(traverseNode);
    return newTokens;
  };

  const handleInput = () => {
    if (!editorRef.current || isComposingRef.current || isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    const editor = editorRef.current;
    const displayText = editor.textContent || '';
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      isUpdatingRef.current = false;
      return;
    }

    // Get cursor position
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editor);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const cursorPos = preCaretRange.toString().length;

    // Check for mention trigger
    const trigger = findMentionTriggerAtCursor(displayText, cursorPos);
    
    if (trigger) {
      setShowMentionDropdown(true);
      setMentionSearchQuery(trigger.query);
      setSelectedMentionIndex(0);
    } else {
      setShowMentionDropdown(false);
    }

    // Extract tokens from DOM (preserves mentions!)
    const newTokens = extractTokensFromDOM();
    setTokens(newTokens);

    const canonical = tokensToCanonical(newTokens);
    const mentionIds = extractMentionIds(newTokens);
    lastCanonicalRef.current = canonical;
    
    onChange(canonical, mentions);
    onMentionsChange?.(mentionIds);
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  };

  const insertMention = (entity: MentionEntity) => {
    if (!editorRef.current) return;

    const displayText = editorRef.current.textContent || '';
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const cursorPos = preCaretRange.toString().length;

    // Create mention token
    const mentionToken: MentionToken = {
      kind: 'mention',
      type: entity.type,
      id: entity.id,
      name: entity.display,
    };

    // Replace @ trigger with mention
    const newTokens = replaceTriggerWithMention(tokens, displayText, cursorPos, mentionToken);
    setTokens(newTokens);

    // Update mentions array
    const newMentions = mentions.find(m => m.id === entity.id)
      ? mentions
      : [...mentions, entity];
    setMentions(newMentions);

    const canonical = tokensToCanonical(newTokens);
    const mentionIds = extractMentionIds(newTokens);
    lastCanonicalRef.current = canonical;

    onChange(canonical, newMentions);
    onMentionsChange?.(mentionIds);

    setShowMentionDropdown(false);
    setMentionSearchQuery("");

    // Restore focus
    setTimeout(() => editorRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Scroll selected item into view
    const scrollIntoView = (index: number) => {
      const dropdown = dropdownRef.current;
      if (!dropdown) return;
      const item = dropdown.querySelector(`[data-mention-index="${index}"]`);
      item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    if (showMentionDropdown && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = selectedMentionIndex < mentionResults.length - 1 ? selectedMentionIndex + 1 : selectedMentionIndex;
        setSelectedMentionIndex(newIndex);
        scrollIntoView(newIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = selectedMentionIndex > 0 ? selectedMentionIndex - 1 : 0;
        setSelectedMentionIndex(newIndex);
        scrollIntoView(newIndex);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        insertMention(mentionResults[selectedMentionIndex]);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionResults[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionDropdown(false);
      }
    }
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          const relatedTarget = e.relatedTarget as HTMLElement;
          if (relatedTarget && dropdownRef.current?.contains(relatedTarget)) {
            e.preventDefault();
            return;
          }
          setTimeout(() => setIsFocused(false), 200);
        }}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => { isComposingRef.current = true; }}
        onCompositionEnd={() => { isComposingRef.current = false; handleInput(); }}
        className={`w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-y-auto ${className}`}
        style={{ minHeight: `${minRows * 24}px`, maxHeight: `${maxRows * 24}px` }}
        data-testid="input-mentions-content"
        suppressContentEditableWarning
      />

      {/* Mention Autocomplete Dropdown */}
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
                boxShadow: '0 12px 40px rgba(64, 224, 208, 0.5)',
              }}
              data-testid="mentions-dropdown"
            >
              {isSearching ? (
                <div className="flex items-center justify-center py-4 text-white">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </div>
              ) : mentionResults.length > 0 ? (
                <div className="space-y-1">
                  {mentionResults.map((entity, index) => (
                    <button
                      key={entity.id}
                      data-mention-index={index}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertMention(entity);
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all text-white font-medium ${
                        index === selectedMentionIndex ? 'scale-105' : 'hover:scale-102'
                      }`}
                      style={{
                        background: index === selectedMentionIndex 
                          ? 'rgba(255, 255, 255, 0.25)'
                          : 'transparent',
                      }}
                      data-testid={`mention-result-${entity.id}`}
                    >
                      <Avatar className="w-8 h-8 border-2 border-white/50">
                        <AvatarImage src={entity.avatar || undefined} />
                        <AvatarFallback className="bg-white/20 text-white">
                          {entity.display.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate text-white">
                          @{entity.display}
                        </div>
                        {entity.subtitle && (
                          <div className="text-xs truncate text-white/80">
                            {entity.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="text-white/60">
                        {getMentionIcon(entity.type)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-white/80">
                  No results found
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

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Calendar, Users, MapPin } from "lucide-react";

interface MentionOption {
  id: number;
  type: "user" | "event" | "professional-group" | "city-group";
  name: string;
  username?: string;
  avatar?: string;
  icon?: string;
  subtitle?: string;
}

interface MentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onMention?: (mention: MentionOption) => void;
  placeholder?: string;
  className?: string;
}

export function MentionAutocomplete({
  value,
  onChange,
  onMention,
  placeholder = "Add a comment... Use @ to mention people, events, or groups",
  className = "",
}: MentionAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionType, setMentionType] = useState<"user" | "event" | "professional-group" | "city-group" | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Search for mention options
  const { data: mentionOptions = [] } = useQuery<MentionOption[]>({
    queryKey: ["/api/mentions/search", mentionQuery, mentionType],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('query', mentionQuery);
      if (mentionType) params.append('type', mentionType);
      
      const response = await fetch(`/api/mentions/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch mentions');
      return response.json();
    },
    enabled: open && mentionQuery.length > 0,
  });

  // Handle @ detection and autocomplete
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Detect @ mention trigger
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      
      // Detect mention type based on prefix
      if (query.startsWith("event-") || textBeforeCursor.includes("@event")) {
        setMentionType("event");
      } else if (query.startsWith("group-") || textBeforeCursor.includes("@group")) {
        setMentionType("professional-group");
      } else if (query.startsWith("city-") || textBeforeCursor.includes("@city")) {
        setMentionType("city-group");
      } else {
        setMentionType("user");
      }
      
      setOpen(true);
    } else {
      setOpen(false);
      setMentionQuery("");
      setMentionType(null);
    }
  };

  // Insert mention into text
  const insertMention = (mention: MentionOption) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    // Remove the partial @ query
    const mentionStart = textBeforeCursor.lastIndexOf("@");
    const newText = 
      textBeforeCursor.slice(0, mentionStart) + 
      `@${mention.username || mention.name}` + 
      " " + 
      textAfterCursor;
    
    onChange(newText);
    setOpen(false);
    setMentionQuery("");
    
    // Notify parent component
    if (onMention) {
      onMention(mention);
    }

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = mentionStart + (mention.username || mention.name).length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Get icon for mention type
  const getMentionIcon = (type: MentionOption["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4 text-primary" />;
      case "professional-group":
        return <Users className="h-4 w-4 text-secondary" />;
      case "city-group":
        return <MapPin className="h-4 w-4 text-accent" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            data-testid="textarea-mention-input"
          />
        </PopoverTrigger>
        <PopoverContent 
          className="w-[300px] p-0"
          align="start"
          side="bottom"
          data-testid="popover-mention-suggestions"
        >
          <Command>
            <CommandList>
              <CommandEmpty>No results found</CommandEmpty>
              <CommandGroup heading={mentionType ? `@${mentionType}s` : "@mentions"}>
                {mentionOptions.map((option) => (
                  <CommandItem
                    key={`${option.type}-${option.id}`}
                    value={option.username || option.name}
                    onSelect={() => insertMention(option)}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover-elevate"
                    data-testid={`mention-option-${option.type}-${option.id}`}
                  >
                    {option.type === "user" ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={option.avatar} />
                        <AvatarFallback>
                          {option.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {getMentionIcon(option.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {option.name}
                      </div>
                      {option.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {option.subtitle}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {option.type === "event" && "Event"}
                      {option.type === "professional-group" && "Group"}
                      {option.type === "city-group" && "City"}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper text */}
      <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>💡 Tips:</span>
        <span><code className="px-1 py-0.5 bg-muted rounded">@</code> for people</span>
        <span><code className="px-1 py-0.5 bg-muted rounded">@event-</code> for events</span>
        <span><code className="px-1 py-0.5 bg-muted rounded">@group-</code> for groups</span>
        <span><code className="px-1 py-0.5 bg-muted rounded">@city-</code> for cities</span>
      </div>
    </div>
  );
}

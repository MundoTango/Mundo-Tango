import { Globe, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type PrivacyLevel = 'public' | 'friends' | 'private';

interface PrivacyToggleProps {
  value: PrivacyLevel;
  onChange: (value: PrivacyLevel) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

const privacyOptions = [
  { value: 'public' as const, label: 'Public', description: 'Everyone can see', icon: Globe },
  { value: 'friends' as const, label: 'Friends', description: 'Only friends can see', icon: Users },
  { value: 'private' as const, label: 'Private', description: 'Only you can see', icon: Lock },
];

export function PrivacyToggle({ 
  value, 
  onChange, 
  disabled = false, 
  compact = false,
  className 
}: PrivacyToggleProps) {
  const currentOption = privacyOptions.find(opt => opt.value === value) || privacyOptions[0];
  const Icon = currentOption.icon;

  if (compact) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={disabled}
                className={cn("h-6 w-6", className)}
                data-testid={`privacy-toggle-${value}`}
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{currentOption.label}: {currentOption.description}</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          {privacyOptions.map((option) => {
            const OptionIcon = option.icon;
            return (
              <DropdownMenuItem 
                key={option.value}
                onClick={() => onChange(option.value)}
                className={cn(
                  "flex items-center gap-2",
                  value === option.value && "bg-accent"
                )}
                data-testid={`privacy-option-${option.value}`}
              >
                <OptionIcon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled}
          className={cn("gap-2", className)}
          data-testid={`privacy-toggle-${value}`}
        >
          <Icon className="h-4 w-4" />
          {currentOption.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {privacyOptions.map((option) => {
          const OptionIcon = option.icon;
          return (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-center gap-3 py-2",
                value === option.value && "bg-accent"
              )}
              data-testid={`privacy-option-${option.value}`}
            >
              <OptionIcon className="h-4 w-4 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PrivacyIndicator({ 
  level, 
  className 
}: { 
  level: PrivacyLevel; 
  className?: string;
}) {
  const option = privacyOptions.find(opt => opt.value === level) || privacyOptions[0];
  const Icon = option.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center", className)}>
          <Icon className="h-3 w-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{option.label}: {option.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export interface PrivacySettings {
  bio: PrivacyLevel;
  occupation: PrivacyLevel;
  location: PrivacyLevel;
  languages: PrivacyLevel;
  socialLinks: PrivacyLevel;
  tangoRoles: PrivacyLevel;
  experience: PrivacyLevel;
  email: PrivacyLevel;
  phone: PrivacyLevel;
}

export const defaultPrivacySettings: PrivacySettings = {
  bio: 'public',
  occupation: 'public',
  location: 'public',
  languages: 'public',
  socialLinks: 'public',
  tangoRoles: 'public',
  experience: 'public',
  email: 'private',
  phone: 'private',
};

export function shouldShowField(
  fieldPrivacy: PrivacyLevel,
  isOwner: boolean,
  isFriend: boolean
): boolean {
  if (isOwner) return true;
  if (fieldPrivacy === 'public') return true;
  if (fieldPrivacy === 'friends' && isFriend) return true;
  return false;
}

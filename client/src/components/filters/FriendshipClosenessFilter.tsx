import { useState } from "react";
import { Heart, User, Users, Globe, Check, HelpCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import type { ClosenessVisibility } from "@shared/client-types";

interface ClosenessOption {
  value: ClosenessVisibility;
  label: string;
  icon: typeof Heart;
  helperText: string;
}

const CLOSENESS_OPTIONS: ClosenessOption[] = [
  {
    value: "close_friend",
    label: "Close Friends",
    icon: Heart,
    helperText: "People you've connected deeply with through tango - frequent dancers, event buddies",
  },
  {
    value: "friends_1st",
    label: "Friends",
    icon: User,
    helperText: "Your direct friends on the platform",
  },
  {
    value: "friends_2nd",
    label: "Friends of Friends",
    icon: Users,
    helperText: "People connected through your friends - 1 person away",
  },
  {
    value: "friends_3rd",
    label: "Extended Network",
    icon: Globe,
    helperText: "Wider community - connected through friends of friends",
  },
  {
    value: "all",
    label: "Everyone",
    icon: Check,
    helperText: "Open to the entire Mundo Tango community",
  },
];

interface FriendshipClosenessFilterProps {
  value: ClosenessVisibility;
  onChange: (value: ClosenessVisibility) => void;
  label?: string;
  description?: string;
  showHelperText?: boolean;
  disabled?: boolean;
  className?: string;
  testIdPrefix?: string;
}

export function FriendshipClosenessFilter({
  value,
  onChange,
  label = "Who can see this?",
  description,
  showHelperText = true,
  disabled = false,
  className = "",
  testIdPrefix = "closeness-filter",
}: FriendshipClosenessFilterProps) {
  const selectedOption = CLOSENESS_OPTIONS.find((opt) => opt.value === value) || CLOSENESS_OPTIONS[4];
  const SelectedIcon = selectedOption.icon;

  return (
    <div className={`space-y-2 ${className}`} data-testid={`${testIdPrefix}-container`}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        {showHelperText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">{selectedOption.helperText}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Select
        value={value}
        onValueChange={(val) => onChange(val as ClosenessVisibility)}
        disabled={disabled}
      >
        <SelectTrigger 
          className="w-full"
          data-testid={`${testIdPrefix}-trigger`}
        >
          <SelectValue>
            <div className="flex items-center gap-2">
              <SelectedIcon className="h-4 w-4" />
              <span>{selectedOption.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CLOSENESS_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                data-testid={`${testIdPrefix}-option-${option.value}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {showHelperText && (
                      <span className="text-xs text-muted-foreground">
                        {option.helperText}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export function getClosenessLabel(value: ClosenessVisibility): string {
  const option = CLOSENESS_OPTIONS.find((opt) => opt.value === value);
  return option?.label || "Everyone";
}

export function getClosenessIcon(value: ClosenessVisibility): typeof Heart {
  const option = CLOSENESS_OPTIONS.find((opt) => opt.value === value);
  return option?.icon || Check;
}

export { CLOSENESS_OPTIONS };
export type { ClosenessOption };

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";
import { cn } from "@/lib/utils";

interface PlatformCheckboxProps {
  platform: "facebook" | "instagram" | "linkedin" | "twitter";
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  charLimit?: number;
  currentLength?: number;
}

const platformConfig = {
  facebook: {
    name: "Facebook",
    color: "#1877F2",
    icon: SiFacebook,
    charLimit: 63206,
  },
  instagram: {
    name: "Instagram",
    color: "#E4405F",
    icon: SiInstagram,
    charLimit: 2200,
  },
  linkedin: {
    name: "LinkedIn",
    color: "#0A66C2",
    icon: SiLinkedin,
    charLimit: 3000,
  },
  twitter: {
    name: "X (Twitter)",
    color: "#000000",
    icon: SiX,
    charLimit: 280,
  },
};

export function PlatformCheckbox({
  platform,
  checked,
  onCheckedChange,
  disabled = false,
  charLimit,
  currentLength = 0,
}: PlatformCheckboxProps) {
  const config = platformConfig[platform];
  const PlatformIcon = config.icon;
  const limit = charLimit || config.charLimit;
  const isOverLimit = currentLength > limit;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-md border transition-all",
        checked && !isOverLimit && "border-turquoise-500 bg-turquoise-500/10",
        isOverLimit && "border-red-500 bg-red-500/10",
        !checked && !isOverLimit && "border-white/10 bg-white/5"
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id={`platform-${platform}`}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled || isOverLimit}
          data-testid={`checkbox-platform-${platform}`}
        />
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center"
          style={{ backgroundColor: config.color }}
        >
          <PlatformIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <Label
            htmlFor={`platform-${platform}`}
            className="text-base font-medium cursor-pointer"
          >
            {config.name}
          </Label>
          {checked && (
            <p
              className={cn(
                "text-xs",
                isOverLimit ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {currentLength} / {limit} characters
              {isOverLimit && " (exceeds limit)"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

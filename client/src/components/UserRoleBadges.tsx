/**
 * USER ROLE BADGES - Unified Role Display Component
 * Shows tango role icons consistently throughout the app
 * Usage: <UserRoleBadges roles={user.tangoRoles} />
 */

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getRoleByValueWithLegacy, getRoleColor, type TangoRole } from "@/lib/tangoRoles";

interface UserRoleBadgesProps {
  roles?: string[] | null;
  maxDisplay?: number;
  size?: 'xs' | 'sm' | 'md';
  showTooltip?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { icon: 12, text: 'text-[10px]', gap: 'gap-0.5' },
  sm: { icon: 14, text: 'text-xs', gap: 'gap-1' },
  md: { icon: 16, text: 'text-sm', gap: 'gap-1.5' },
};

export function UserRoleBadges({ 
  roles, 
  maxDisplay = 3, 
  size = 'sm',
  showTooltip = true,
  className = ''
}: UserRoleBadgesProps) {
  if (!roles || roles.length === 0) return null;

  const sizeConfig = SIZE_MAP[size];
  const displayRoles = roles.slice(0, maxDisplay);
  const remainingCount = roles.length - maxDisplay;

  return (
    <div className={`flex items-center ${sizeConfig.gap} ${className}`} data-testid="user-role-badges">
      {displayRoles.map((roleValue) => {
        const role = getRoleByValueWithLegacy(roleValue);
        if (!role) return null;

        const Icon = role.icon;
        const color = getRoleColor(roleValue);

        if (showTooltip) {
          return (
            <Tooltip key={roleValue}>
              <TooltipTrigger asChild>
                <span 
                  className="inline-flex items-center cursor-default"
                  data-testid={`role-badge-${roleValue}`}
                >
                  <Icon 
                    size={sizeConfig.icon} 
                    style={{ color }} 
                    className="flex-shrink-0"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {role.label}
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <span 
            key={roleValue}
            className="inline-flex items-center"
            data-testid={`role-badge-${roleValue}`}
          >
            <Icon 
              size={sizeConfig.icon} 
              style={{ color }} 
              className="flex-shrink-0"
            />
          </span>
        );
      })}
      
      {remainingCount > 0 && (
        <span className={`text-muted-foreground ${sizeConfig.text}`}>
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

interface UserRoleBadgesWithLabelsProps extends Omit<UserRoleBadgesProps, 'showTooltip'> {
  variant?: 'inline' | 'stacked';
}

export function UserRoleBadgesWithLabels({
  roles,
  maxDisplay = 3,
  size = 'sm',
  variant = 'inline',
  className = ''
}: UserRoleBadgesWithLabelsProps) {
  if (!roles || roles.length === 0) return null;

  const sizeConfig = SIZE_MAP[size];
  const displayRoles = roles.slice(0, maxDisplay);
  const remainingCount = roles.length - maxDisplay;

  const containerClass = variant === 'stacked' 
    ? 'flex flex-col gap-1' 
    : `flex flex-wrap items-center ${sizeConfig.gap}`;

  return (
    <div className={`${containerClass} ${className}`} data-testid="user-role-badges-labels">
      {displayRoles.map((roleValue) => {
        const role = getRoleByValueWithLegacy(roleValue);
        if (!role) return null;

        const Icon = role.icon;
        const color = getRoleColor(roleValue);

        return (
          <span 
            key={roleValue}
            className={`inline-flex items-center ${sizeConfig.gap}`}
            data-testid={`role-badge-label-${roleValue}`}
          >
            <Icon 
              size={sizeConfig.icon} 
              style={{ color }} 
              className="flex-shrink-0"
            />
            <span className={`${sizeConfig.text} text-muted-foreground`}>
              {role.label}
            </span>
          </span>
        );
      })}
      
      {remainingCount > 0 && (
        <span className={`text-muted-foreground ${sizeConfig.text}`}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

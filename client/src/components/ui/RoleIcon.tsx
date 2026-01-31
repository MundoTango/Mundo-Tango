/**
 * ROLE ICON COMPONENT - P0 #10
 * Display tango role icons throughout the app
 */

import { getRoleByValue } from '@/lib/tangoRoles';
import { User } from 'lucide-react';

interface RoleIconProps {
  role: string;
  size?: number;
  className?: string;
}

export function RoleIcon({ role, size = 16, className = '' }: RoleIconProps) {
  const roleData = getRoleByValue(role);
  
  if (!roleData) {
    return <User size={size} className={`inline ${className}`} />;
  }

  const Icon = roleData.icon;
  return <Icon size={size} className={`inline ${className}`} data-testid={`role-icon-${role}`} />;
}

interface RoleWithIconProps {
  role: string;
  label?: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export function RoleWithIcon({ 
  role, 
  label, 
  size = 16, 
  className = '',
  showLabel = true 
}: RoleWithIconProps) {
  const roleData = getRoleByValue(role);
  const displayLabel = label || roleData?.label || role;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`} data-testid={`role-display-${role}`}>
      <RoleIcon role={role} size={size} />
      {showLabel && <span>{displayLabel}</span>}
    </span>
  );
}

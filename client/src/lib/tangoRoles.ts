/**
 * TANGO ROLES CONFIGURATION - UNIFIED SYSTEM
 * Complete 19-role system matching onboarding IDs
 * Used throughout app for consistent role display
 */

import {
  Users,
  User,
  GraduationCap,
  Music,
  Drama,
  Calendar,
  Building2,
  Camera,
  Palette,
  Briefcase,
  Search,
  PenLine,
  BookOpen,
  Target,
  Shirt,
  Globe,
  Piano,
  Sparkles,
  Heart,
  Handshake,
  type LucideIcon
} from 'lucide-react';

export interface TangoRole {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
  bookable: boolean;
  category: 'dance' | 'professional' | 'creative' | 'community';
}

export const TANGO_ROLES: readonly TangoRole[] = [
  // ========== DANCE ROLES ==========
  {
    value: 'dancer-leader',
    label: 'Dancer (Leader)',
    icon: Users,
    color: '#1E90FF',
    description: 'I lead in tango dancing',
    bookable: false,
    category: 'dance'
  },
  {
    value: 'dancer-follower',
    label: 'Dancer (Follower)',
    icon: User,
    color: '#EC4899',
    description: 'I follow in tango dancing',
    bookable: false,
    category: 'dance'
  },
  
  // ========== PROFESSIONAL ROLES ==========
  {
    value: 'teacher',
    label: 'Teacher',
    icon: GraduationCap,
    color: '#10B981',
    description: 'I teach tango',
    bookable: true,
    category: 'professional'
  },
  {
    value: 'dj',
    label: 'DJ',
    icon: Music,
    color: '#8B5CF6',
    description: 'I DJ tango music',
    bookable: true,
    category: 'professional'
  },
  {
    value: 'performer',
    label: 'Performer',
    icon: Drama,
    color: '#F59E0B',
    description: 'I perform tango shows',
    bookable: true,
    category: 'professional'
  },
  {
    value: 'organizer',
    label: 'Organizer',
    icon: Calendar,
    color: '#3B82F6',
    description: 'I organize tango events',
    bookable: false,
    category: 'professional'
  },
  {
    value: 'venue-owner',
    label: 'Venue Owner',
    icon: Building2,
    color: '#6B7280',
    description: 'I own/manage a tango venue',
    bookable: true,
    category: 'professional'
  },
  {
    value: 'coach',
    label: 'Coach/Mentor',
    icon: Target,
    color: '#10B981',
    description: 'I coach/mentor tango dancers',
    bookable: true,
    category: 'professional'
  },
  {
    value: 'researcher',
    label: 'Researcher',
    icon: Search,
    color: '#F97316',
    description: 'I research tango culture and traditions',
    bookable: false,
    category: 'creative'
  },
  {
    value: 'business',
    label: 'Business/Vendor',
    icon: Briefcase,
    color: '#6366F1',
    description: 'I run a tango-related business',
    bookable: true,
    category: 'professional'
  },
  
  // ========== CREATIVE ROLES ==========
  {
    value: 'photographer',
    label: 'Photographer/Videographer',
    icon: Camera,
    color: '#EF4444',
    description: 'I capture tango moments',
    bookable: true,
    category: 'creative'
  },
  {
    value: 'artist',
    label: 'Designer/Artist',
    icon: Palette,
    color: '#EC4899',
    description: 'I create tango art/graphics',
    bookable: true,
    category: 'creative'
  },
  {
    value: 'journalist',
    label: 'Journalist/Blogger',
    icon: PenLine,
    color: '#14B8A6',
    description: 'I write about tango',
    bookable: false,
    category: 'creative'
  },
  {
    value: 'historian',
    label: 'Historian',
    icon: BookOpen,
    color: '#8B5CF6',
    description: 'I study tango history',
    bookable: false,
    category: 'creative'
  },
  {
    value: 'clothing-designer',
    label: 'Clothing/Shoe Designer',
    icon: Shirt,
    color: '#EC4899',
    description: 'I design tango clothing/shoes',
    bookable: true,
    category: 'creative'
  },
  {
    value: 'musician',
    label: 'Musician',
    icon: Piano,
    color: '#A855F7',
    description: 'I play tango music',
    bookable: true,
    category: 'creative'
  },
  
  // ========== COMMUNITY ROLES ==========
  {
    value: 'community-builder',
    label: 'Community Builder',
    icon: Globe,
    color: '#40E0D0',
    description: 'I build tango communities',
    bookable: false,
    category: 'community'
  },
  {
    value: 'fan',
    label: 'Fan/Enthusiast',
    icon: Sparkles,
    color: '#F59E0B',
    description: "I'm a tango enthusiast",
    bookable: false,
    category: 'community'
  },
  {
    value: 'other',
    label: 'Other',
    icon: Heart,
    color: '#EF4444',
    description: 'My tango role is unique',
    bookable: false,
    category: 'community'
  },
  
  // ========== SPECIALIZED ROLES ==========
  {
    value: 'taxi-dancer',
    label: 'Taxi Dancer',
    icon: Handshake,
    color: '#F97316',
    description: 'I dance as a taxi dancer at milongas',
    bookable: true,
    category: 'professional'
  }
] as const;

// Helper function to normalize role values for matching
function normalizeRoleValue(value: string): string {
  return value.toLowerCase().replace(/[\s_]+/g, '-');
}

// Helper functions
export function getRoleByValue(value: string): TangoRole | undefined {
  const normalized = normalizeRoleValue(value);
  return TANGO_ROLES.find(role => normalizeRoleValue(role.value) === normalized);
}

export function getRolesByCategory(category: TangoRole['category']): readonly TangoRole[] {
  return TANGO_ROLES.filter(role => role.category === category);
}

export function getBookableRoles(): readonly TangoRole[] {
  return TANGO_ROLES.filter(role => role.bookable);
}

export function getRoleIcon(roleValue: string): LucideIcon {
  const role = getRoleByValue(roleValue);
  return role?.icon || User;
}

export function getRoleLabel(roleValue: string): string {
  const role = getRoleByValue(roleValue);
  return role?.label || roleValue.replace(/-/g, ' ');
}

export function getRoleColor(roleValue: string): string {
  const role = getRoleByValue(roleValue);
  return role?.color || '#6B7280';
}

// Legacy compatibility - map old role values to new ones
const LEGACY_ROLE_MAP: Record<string, string> = {
  'dancer': 'dancer-leader',
  'student': 'fan',
  'tango_traveler': 'community-builder',
  'vendor': 'business',
  'choreographer': 'performer',
  'tango_school': 'teacher',
  'tango_hotel': 'venue-owner',
  'wellness_provider': 'coach',
  'tour_operator': 'organizer',
  'host_venue_owner': 'venue-owner',
  'tango_guide': 'community-builder',
  'content_creator': 'photographer',
  'learning_resource': 'teacher',
  'taxi_dancer': 'taxi-dancer',
  'mc': 'researcher',
  'mc-host': 'researcher',
};

export function normalizeRole(roleValue: string): string {
  const normalized = normalizeRoleValue(roleValue);
  return LEGACY_ROLE_MAP[normalized] || normalized;
}

export function getRoleByValueWithLegacy(value: string): TangoRole | undefined {
  const normalized = normalizeRole(value);
  return getRoleByValue(normalized);
}

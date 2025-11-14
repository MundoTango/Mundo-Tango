/**
 * TANGO ROLES CONFIGURATION - P0 #10
 * Complete 20-role system with icons
 */

import {
  GraduationCap,
  Music,
  Camera,
  Star,
  Calendar,
  ShoppingBag,
  Music2,
  Layout,
  School,
  Hotel,
  Heart,
  Plane,
  Home,
  Map,
  Video,
  BookOpen,
  Users2,
  User,
  Globe,
  UserCheck,
  type LucideIcon
} from 'lucide-react';

export interface TangoRole {
  value: string;
  label: string;
  icon: LucideIcon;
  bookable: boolean;
  description?: string;
  category: 'business' | 'social';
}

export const TANGO_ROLES: readonly TangoRole[] = [
  // ========== BUSINESS ROLES (17) ==========
  {
    value: 'teacher',
    label: 'Teacher',
    icon: GraduationCap,
    bookable: true,
    category: 'business',
    description: 'Professional tango instructor offering private or group classes'
  },
  {
    value: 'dj',
    label: 'DJ',
    icon: Music,
    bookable: true,
    category: 'business',
    description: 'Tango DJ available for milongas and events'
  },
  {
    value: 'photographer',
    label: 'Photographer',
    icon: Camera,
    bookable: true,
    category: 'business',
    description: 'Professional photographer specializing in tango events'
  },
  {
    value: 'performer',
    label: 'Performer',
    icon: Star,
    bookable: true,
    category: 'business',
    description: 'Tango performer available for shows and demonstrations'
  },
  {
    value: 'organizer',
    label: 'Organizer',
    icon: Calendar,
    bookable: false,
    category: 'business',
    description: 'Event organizer hosting milongas and festivals'
  },
  {
    value: 'vendor',
    label: 'Vendor',
    icon: ShoppingBag,
    bookable: true,
    category: 'business',
    description: 'Seller of tango shoes, clothing, and accessories'
  },
  {
    value: 'musician',
    label: 'Musician',
    icon: Music2,
    bookable: true,
    category: 'business',
    description: 'Live tango musician or orchestra member'
  },
  {
    value: 'choreographer',
    label: 'Choreographer',
    icon: Layout,
    bookable: true,
    category: 'business',
    description: 'Professional choreographer for shows and performances'
  },
  {
    value: 'tango_school',
    label: 'Tango School',
    icon: School,
    bookable: true,
    category: 'business',
    description: 'Tango school or academy offering structured programs'
  },
  {
    value: 'tango_hotel',
    label: 'Tango Hotel',
    icon: Hotel,
    bookable: true,
    category: 'business',
    description: 'Accommodation specialized for tango travelers'
  },
  {
    value: 'wellness_provider',
    label: 'Wellness Provider',
    icon: Heart,
    bookable: true,
    category: 'business',
    description: 'Massage, physical therapy, or wellness services for dancers'
  },
  {
    value: 'tour_operator',
    label: 'Tour Operator',
    icon: Plane,
    bookable: true,
    category: 'business',
    description: 'Organize tango tours and travel packages'
  },
  {
    value: 'host_venue_owner',
    label: 'Host/Venue Owner',
    icon: Home,
    bookable: true,
    category: 'business',
    description: 'Owner or manager of milonga venues'
  },
  {
    value: 'tango_guide',
    label: 'Tango Guide',
    icon: Map,
    bookable: true,
    category: 'business',
    description: 'Local guide for tango experiences in your city'
  },
  {
    value: 'content_creator',
    label: 'Content Creator',
    icon: Video,
    bookable: true,
    category: 'business',
    description: 'Create tango videos, tutorials, or social media content'
  },
  {
    value: 'learning_resource',
    label: 'Learning Resource',
    icon: BookOpen,
    bookable: true,
    category: 'business',
    description: 'Educational content, courses, or learning materials'
  },
  {
    value: 'taxi_dancer',
    label: 'Taxi Dancer',
    icon: Users2,
    bookable: true,
    category: 'business',
    description: 'Professional dancer available for hire to dance with guests'
  },

  // ========== SOCIAL ROLES (3) ==========
  {
    value: 'dancer',
    label: 'Dancer',
    icon: User,
    bookable: false,
    category: 'social',
    description: 'Tango enthusiast and social dancer'
  },
  {
    value: 'tango_traveler',
    label: 'Tango Traveler',
    icon: Globe,
    bookable: false,
    category: 'social',
    description: 'Travel the world to experience different tango communities'
  },
  {
    value: 'student',
    label: 'Student',
    icon: UserCheck,
    bookable: false,
    category: 'social',
    description: 'Learning tango and improving skills'
  }
] as const;

// Helper functions
export function getRoleByValue(value: string): TangoRole | undefined {
  return TANGO_ROLES.find(role => role.value === value);
}

export function getBusinessRoles(): readonly TangoRole[] {
  return TANGO_ROLES.filter(role => role.category === 'business');
}

export function getSocialRoles(): readonly TangoRole[] {
  return TANGO_ROLES.filter(role => role.category === 'social');
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
  return role?.label || roleValue;
}

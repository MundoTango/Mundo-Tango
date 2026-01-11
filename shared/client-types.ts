// ============================================================================
// CLIENT-SIDE TYPE DEFINITIONS
// This file provides lightweight type definitions for the frontend.
// Unlike schema.ts, this doesn't import Drizzle or database dependencies.
// Import from here instead of @shared/schema to reduce bundle size.
// ============================================================================

import { z } from "zod";

// Re-export the closeness visibility types (these are lightweight)
export type ClosenessVisibility = 
  | 'all'
  | 'close_friend'
  | 'friends_1st'
  | 'friends_2nd'
  | 'friends_3rd';

export const closenessVisibilitySchema = z.enum([
  'all',
  'close_friend',
  'friends_1st',
  'friends_2nd',
  'friends_3rd',
]);

// User types
export interface SelectUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  mobileNo?: string | null;
  profileImage?: string | null;
  backgroundImage?: string | null;
  bio?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  city?: string | null;
  facebookUrl?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  suspended?: boolean;
  deviceType?: string | null;
  deviceToken?: string | null;
  apiToken?: string | null;
  replitId?: string | null;
  nickname?: string | null;
  primaryLanguage?: string | null;
  languages?: string[] | null;
  tangoRoles?: string[] | null;
  leaderLevel?: number;
  followerLevel?: number;
  yearsOfDancing?: number;
  tangoStartYear?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Event types
export interface SelectEvent {
  id: number;
  title: string;
  slug?: string | null;
  description?: string | null;
  eventType?: string | null;
  category?: string | null;
  userId?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  date?: string | null;
  timezone?: string | null;
  isRecurring?: boolean;
  location?: string | null;
  venue?: string | null;
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isOnline?: boolean;
  onlineLink?: string | null;
  meetingUrl?: string | null;
  imageUrl?: string | null;
  coverImage?: string | null;
  mediaUrls?: string[] | null;
  organizerId?: number | null;
  coOrganizers?: number[] | null;
  groupId?: number | null;
  maxAttendees?: number | null;
  currentAttendees?: number;
  waitlistEnabled?: boolean;
  waitlistCount?: number;
  isPaid?: boolean;
  isFree?: boolean;
  price?: string | null;
  currency?: string | null;
  ticketUrl?: string | null;
  ticketLink?: string | null;
  visibility?: string;
  requiresApproval?: boolean;
  allowGuestPlusOne?: boolean;
  allowPhotos?: boolean;
  allowComments?: boolean;
  musicStyle?: string | null;
  danceStyles?: string[] | null;
  djName?: string | null;
  tags?: string[] | null;
  dressCode?: string | null;
  ageRestriction?: string | null;
  wheelchairAccessible?: boolean;
  parkingAvailable?: boolean;
  status?: string;
  viewCount?: number;
  shareCount?: number;
  sourceName?: string | null;
  sourceUrl?: string | null;
  seriesId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  publishedAt?: Date | null;
}

export interface EventSeries {
  id: number;
  title: string;
  description?: string | null;
  organizerId?: number | null;
  groupId?: number | null;
  recurrenceRule?: string | null;
  recurrenceEndDate?: Date | null;
  imageUrl?: string | null;
  status?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Event related types
export interface SelectEventComment {
  id: number;
  eventId: number;
  userId: number;
  content: string;
  parentCommentId?: number | null;
  likeCount?: number;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface SelectEventPhoto {
  id: number;
  eventId: number;
  uploaderId: number;
  photoUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  taggedUsers?: number[] | null;
  likeCount?: number;
  commentCount?: number;
  visibility?: string;
  isApproved?: boolean;
  isFeatured?: boolean;
  createdAt?: Date | null;
}

// Group types
export interface SelectGroup {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  groupType?: string | null;
  coverImage?: string | null;
  profileImage?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  privacy?: string;
  creatorId?: number | null;
  memberCount?: number;
  isVerified?: boolean;
  tags?: string[] | null;
  closenessVisibility?: ClosenessVisibility;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface SelectGroupMember {
  id: number;
  groupId: number;
  userId: number;
  role?: string;
  status?: string;
  joinedAt?: Date | null;
}

export interface SelectGroupPost {
  id: number;
  groupId: number;
  authorId: number;
  title?: string | null;
  content: string;
  mediaUrls?: string[] | null;
  mediaType?: string | null;
  postType?: string;
  linkedEventId?: number | null;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  isPinned?: boolean;
  pinnedBy?: number | null;
  pinnedAt?: Date | null;
  isApproved?: boolean;
  approvedBy?: number | null;
  status?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface SelectGroupCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  order?: number;
  isActive?: boolean;
}

export interface SelectGroupInvite {
  id: number;
  groupId: number;
  inviterId: number;
  inviteeId?: number | null;
  email?: string | null;
  token: string;
  status?: string;
  expiresAt?: Date | null;
  createdAt?: Date | null;
}

// Review types
export interface SelectReview {
  id: number;
  reviewerId: number;
  revieweeId: number;
  eventId?: number | null;
  rating: number;
  content?: string | null;
  reviewType?: string | null;
  isVerified?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Financial types
export interface SelectFinancialPortfolio {
  id: number;
  userId: number;
  name: string;
  description?: string | null;
  totalValue?: string | null;
  currency?: string;
  isDefault?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface SelectFinancialAsset {
  id: number;
  portfolioId: number;
  symbol: string;
  name: string;
  assetType?: string | null;
  quantity?: string | null;
  avgCost?: string | null;
  currentPrice?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface SelectFinancialTrade {
  id: number;
  portfolioId: number;
  assetId?: number | null;
  symbol: string;
  tradeType: string;
  quantity: string;
  price: string;
  totalAmount?: string | null;
  status?: string;
  executedAt?: Date | null;
  createdAt?: Date | null;
}

export interface SelectFinancialAIDecision {
  id: number;
  portfolioId: number;
  decisionType: string;
  recommendation: string;
  confidence?: number | null;
  reasoning?: string | null;
  status?: string;
  createdAt?: Date | null;
}

export interface SelectFinancialRiskMetrics {
  id: number;
  portfolioId: number;
  volatility?: number | null;
  sharpeRatio?: number | null;
  maxDrawdown?: number | null;
  beta?: number | null;
  alpha?: number | null;
  calculatedAt?: Date | null;
}

export interface SelectFinancialAccount {
  id: number;
  userId: number;
  accountName: string;
  accountType?: string | null;
  balance?: string | null;
  currency?: string;
  institution?: string | null;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Housing types
export interface SelectHousingListing {
  id: number;
  hostId: number;
  title: string;
  description?: string | null;
  listingType?: string | null;
  propertyType?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price?: string | null;
  currency?: string;
  minStay?: number | null;
  maxGuests?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  amenities?: string[] | null;
  photos?: string[] | null;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Live Stream types
export interface SelectLiveStream {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  streamType?: string | null;
  status?: string;
  scheduledAt?: Date | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  viewerCount?: number;
  thumbnailUrl?: string | null;
  streamUrl?: string | null;
  createdAt?: Date | null;
}

// Mr Blue / AI types
export interface SelectMrBlueMessage {
  id: number;
  userId: number;
  sessionId: string;
  role: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date | null;
}

// Plan / Work Log types
export interface SelectPlanItem {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface SelectWorkLog {
  id: number;
  userId: number;
  planItemId?: number | null;
  description: string;
  duration?: number | null;
  loggedAt?: Date | null;
  createdAt?: Date | null;
}

// Social Media types
export interface SelectPlatformConnection {
  id: number;
  userId: number;
  platform: string;
  accountId?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  isActive?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface SelectSocialPost {
  id: number;
  userId: number;
  content: string;
  mediaUrls?: string[] | null;
  platforms?: string[] | null;
  status?: string;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  createdAt?: Date | null;
}

export interface InsertSocialPost {
  userId: number;
  content: string;
  mediaUrls?: string[] | null;
  platforms?: string[] | null;
  status?: string;
  scheduledAt?: Date | null;
}

export interface SelectSocialCampaign {
  id: number;
  userId: number;
  name: string;
  description?: string | null;
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface InsertSocialCampaign {
  userId: number;
  name: string;
  description?: string | null;
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  budget?: string | null;
}

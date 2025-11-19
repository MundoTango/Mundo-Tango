import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, gt, desc, asc, or, ilike, inArray, sql, lt, gte, lte, ne, notInArray } from "drizzle-orm";
import {
  users,
  refreshTokens,
  emailVerificationTokens,
  passwordResetTokens,
  twoFactorSecrets,
  posts,
  postLikes,
  postComments,
  reactions,
  follows,
  profileViews,
  events,
  eventRsvps,
  eventPhotos,
  eventComments,
  eventReminders,
  groups,
  groupMembers,
  groupInvites,
  groupPosts,
  groupCategories,
  groupCategoryAssignments,
  chatRooms,
  chatRoomUsers,
  chatMessages,
  notifications,
  savedPosts,
  friendRequests,
  friendships,
  friendshipActivities,
  friendshipMedia,
  moderationQueue,
  communities,
  communityMembers,
  workshops,
  reviews,
  liveStreams,
  media,
  activityLogs,
  blockedUsers,
  blockedContent,
  teachers,
  venues,
  tutorials,
  blogPosts,
  newsletterSubscriptions,
  bookings,
  payments,
  volunteers,
  resumes,
  clarifierSessions,
  tasks,
  assignments,
  lifeCeoDomains,
  lifeCeoGoals,
  lifeCeoTasks,
  lifeCeoMilestones,
  lifeCeoRecommendations,
  h2acMessages,
  memories,
  recommendations,
  roleInvitations,
  favorites,
  communityStats,
  facebookImports,
  facebookPosts,
  facebookFriends,
  mrBlueConversations,
  mrBlueMessages,
  type SelectUser,
  type InsertUser,
  type SelectRefreshToken,
  type InsertRefreshToken,
  type SelectEmailVerificationToken,
  type InsertEmailVerificationToken,
  type SelectPasswordResetToken,
  type InsertPasswordResetToken,
  type SelectTwoFactorSecret,
  type InsertTwoFactorSecret,
  type SelectPost,
  type InsertPost,
  type SelectPostLike,
  type InsertPostLike,
  type SelectPostComment,
  type InsertPostComment,
  type SelectFollow,
  type InsertFollow,
  type SelectProfileView,
  type InsertProfileView,
  type SelectEvent,
  type InsertEvent,
  type SelectEventRsvp,
  type InsertEventRsvp,
  type SelectEventPhoto,
  type InsertEventPhoto,
  type SelectEventComment,
  type InsertEventComment,
  type SelectEventReminder,
  type InsertEventReminder,
  type SelectGroup,
  type InsertGroup,
  type SelectGroupMember,
  type InsertGroupMember,
  type SelectGroupInvite,
  type InsertGroupInvite,
  type SelectGroupPost,
  type InsertGroupPost,
  type SelectGroupCategory,
  type InsertGroupCategory,
  type SelectChatRoom,
  type InsertChatRoom,
  type SelectChatRoomUser,
  type InsertChatRoomUser,
  type SelectChatMessage,
  type InsertChatMessage,
  type SelectNotification,
  type InsertNotification,
  type SelectMemory,
  type InsertMemory,
  type SelectRecommendation,
  type InsertRecommendation,
  type SelectRoleInvitation,
  type InsertRoleInvitation,
  type SelectFavorite,
  type InsertFavorite,
  type SelectCommunityStats,
  type InsertCommunityStats,
  housingListings,
  housingBookings,
  type SelectHousingListing,
  type InsertHousingListing,
  type SelectHousingBooking,
  type InsertHousingBooking,
  talentProfiles,
  teacherProfiles,
  djProfiles,
  photographerProfiles,
  performerProfiles,
  vendorProfiles,
  musicianProfiles,
  choreographerProfiles,
  tangoSchoolProfiles,
  tangoHotelProfiles,
  wellnessProfiles,
  tourOperatorProfiles,
  hostVenueProfiles,
  tangoGuideProfiles,
  contentCreatorProfiles,
  learningResourceProfiles,
  taxiDancerProfiles,
  organizerProfiles,
  type SelectTalentProfile,
  type InsertTalentProfile,
  type SelectTeacherProfile,
  type InsertTeacherProfile,
  type SelectDJProfile,
  type InsertDJProfile,
  type SelectPhotographerProfile,
  type InsertPhotographerProfile,
  type SelectPerformerProfile,
  type InsertPerformerProfile,
  type SelectVendorProfile,
  type InsertVendorProfile,
  type SelectMusicianProfile,
  type InsertMusicianProfile,
  type SelectChoreographerProfile,
  type InsertChoreographerProfile,
  type SelectTangoSchoolProfile,
  type InsertTangoSchoolProfile,
  type SelectTangoHotelProfile,
  type InsertTangoHotelProfile,
  type SelectWellnessProfile,
  type InsertWellnessProfile,
  type SelectTourOperatorProfile,
  type InsertTourOperatorProfile,
  type SelectHostVenueProfile,
  type InsertHostVenueProfile,
  type SelectTangoGuideProfile,
  type InsertTangoGuideProfile,
  type SelectContentCreatorProfile,
  type InsertContentCreatorProfile,
  type SelectLearningResourceProfile,
  type InsertLearningResourceProfile,
  type SelectTaxiDancerProfile,
  type InsertTaxiDancerProfile,
  type SelectOrganizerProfile,
  type InsertOrganizerProfile,
} from "@shared/schema";

// Platform independence tables
import {
  deployments,
  platformIntegrations,
  environmentVariables,
  previewDeployments,
  customDomains,
  analyticsEvents,
  teamMembers,
  costRecords,
  databaseBackups,
  cicdPipelines,
  cicdRuns,
  type Deployment,
  type InsertDeployment,
  type PlatformIntegration,
  type InsertPlatformIntegration,
  type EnvironmentVariable,
  type InsertEnvironmentVariable,
  type PreviewDeployment,
  type InsertPreviewDeployment,
} from "@shared/platform-schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sqlClient = neon(process.env.DATABASE_URL);
// MB.MD FIX (Nov 19, 2025): Pass schema to enable db.query API for mrBlueConversations
const db = drizzle(sqlClient, { schema: {
  users, refreshTokens, emailVerificationTokens, passwordResetTokens, twoFactorSecrets,
  posts, postLikes, postComments, reactions, follows, profileViews,
  events, eventRsvps, eventPhotos, eventComments, eventReminders,
  groups, groupMembers, groupInvites, groupPosts, groupCategories, groupCategoryAssignments,
  chatRooms, chatRoomUsers, chatMessages, notifications, savedPosts,
  friendRequests, friendships, friendshipActivities, friendshipMedia,
  moderationQueue, communities, communityMembers, workshops, reviews, liveStreams,
  media, activityLogs, blockedUsers, blockedContent, teachers, venues, tutorials,
  blogPosts, newsletterSubscriptions, bookings, payments, volunteers, resumes,
  clarifierSessions, tasks, assignments,
  lifeCeoDomains, lifeCeoGoals, lifeCeoTasks, lifeCeoMilestones, lifeCeoRecommendations,
  h2acMessages, memories, recommendations, roleInvitations, favorites,
  communityStats, facebookImports, facebookPosts, facebookFriends,
  mrBlueConversations, mrBlueMessages, // FIX: Added for Mr. Blue chat memory
}});

// Export db for use in other modules
export { db };

export interface IStorage {
  getUserById(id: number): Promise<SelectUser | undefined>;
  getUserByEmail(email: string): Promise<SelectUser | undefined>;
  getUserByUsername(username: string): Promise<SelectUser | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<SelectUser | undefined>;
  createUser(user: InsertUser): Promise<SelectUser>;
  updateUser(id: number, data: Partial<SelectUser>): Promise<SelectUser | undefined>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  updateUserSubscription(userId: number, data: { 
    stripeSubscriptionId?: string; 
    stripeCustomerId?: string; 
    plan?: string; 
    status?: 'active' | 'canceled' | 'past_due'; 
    currentPeriodEnd?: Date;
  }): Promise<void>;
  
  createRefreshToken(token: InsertRefreshToken): Promise<SelectRefreshToken>;
  getRefreshToken(token: string): Promise<SelectRefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: number): Promise<void>;
  
  createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<SelectEmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<SelectEmailVerificationToken | undefined>;
  deleteEmailVerificationToken(token: string): Promise<void>;
  
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<SelectPasswordResetToken>;
  getPasswordResetToken(token: string): Promise<SelectPasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  deleteUserPasswordResetTokens(userId: number): Promise<void>;
  
  createTwoFactorSecret(secret: InsertTwoFactorSecret): Promise<SelectTwoFactorSecret>;
  getTwoFactorSecret(userId: number): Promise<SelectTwoFactorSecret | undefined>;
  updateTwoFactorSecret(userId: number, secret: Partial<SelectTwoFactorSecret>): Promise<void>;
  deleteTwoFactorSecret(userId: number): Promise<void>;
  
  createPost(post: InsertPost): Promise<SelectPost>;
  getPostById(id: number): Promise<SelectPost | undefined>;
  getPosts(params: { userId?: number; limit?: number; offset?: number; currentUserId?: number; type?: string }): Promise<SelectPost[]>;
  updatePost(id: number, data: Partial<SelectPost>): Promise<SelectPost | undefined>;
  deletePost(id: number): Promise<void>;
  
  likePost(postId: number, userId: number): Promise<SelectPostLike | undefined>;
  unlikePost(postId: number, userId: number): Promise<void>;
  isPostLikedByUser(postId: number, userId: number): Promise<boolean>;
  savePost(postId: number, userId: number): Promise<void>;
  unsavePost(postId: number, userId: number): Promise<void>;
  
  createPostComment(comment: InsertPostComment): Promise<SelectPostComment>;
  getPostComments(postId: number): Promise<SelectPostComment[]>;
  
  getUserFriends(userId: number): Promise<any[]>;
  getFriendRequests(userId: number): Promise<any[]>;
  getFriendSuggestions(userId: number): Promise<any[]>;
  sendFriendRequest(data: { senderId: number; receiverId: number; [key: string]: any }): Promise<any>;
  acceptFriendRequest(requestId: number): Promise<void>;
  declineFriendRequest(requestId: number): Promise<void>;
  getMutualFriends(userId1: number, userId2: number): Promise<SelectUser[]>;
  getConnectionDegree(userId1: number, userId2: number): Promise<number | null>;
  snoozeFriendRequest(requestId: number, days: number): Promise<void>;
  removeFriend(userId: number, friendId: number): Promise<void>;
  getFriendshipStats(userId: number, friendId: number): Promise<{
    daysSinceFriendship: number;
    closenessScore: number;
    sharedEvents: number;
    sharedGroups: number;
    lastInteraction: string | null;
  } | null>;
  checkFriendship(userId1: number, userId2: number): Promise<boolean>;
  
  // Communities
  getCommunityByCity(cityName: string): Promise<any | undefined>;
  createCommunity(data: { name: string; cityName: string; country: string; description?: string }): Promise<any>;
  getCommunityMembership(communityId: number, userId: number): Promise<any | undefined>;
  joinCommunity(communityId: number, userId: number): Promise<any>;

  // Workshops
  createWorkshop(workshop: any): Promise<any>;
  getWorkshops(params: { limit?: number; offset?: number }): Promise<any[]>;
  getWorkshopById(id: number): Promise<any | undefined>;
  updateWorkshop(id: number, data: any): Promise<any | undefined>;
  deleteWorkshop(id: number): Promise<void>;
  
  // Reviews
  createReview(review: any): Promise<any>;
  getReviews(params: { targetType?: string; targetId?: number; userId?: number; limit?: number; offset?: number }): Promise<any[]>;
  updateReview(id: number, data: any): Promise<any | undefined>;
  deleteReview(id: number): Promise<void>;
  
  // Live Streams
  createLiveStream(stream: any): Promise<any>;
  getLiveStreams(params: { isLive?: boolean; limit?: number }): Promise<any[]>;
  getLiveStreamById(id: number): Promise<any | undefined>;
  updateLiveStream(id: number, data: any): Promise<any | undefined>;
  deleteLiveStream(id: number): Promise<void>;
  
  // Media Gallery
  createMedia(media: any): Promise<any>;
  getUserMedia(userId: number, params: { type?: string; limit?: number; offset?: number }): Promise<any[]>;
  getMediaById(id: number): Promise<any | undefined>;
  updateMedia(id: number, data: any): Promise<any | undefined>;
  deleteMedia(id: number): Promise<void>;
  
  // Activity Logs
  createActivityLog(log: any): Promise<any>;
  getUserActivityLogs(userId: number, params: { limit?: number; offset?: number }): Promise<any[]>;
  
  // Blocked Users
  blockUser(userId: number, blockedUserId: number): Promise<any>;
  unblockUser(userId: number, blockedUserId: number): Promise<void>;
  getBlockedUsers(userId: number): Promise<any[]>;
  isUserBlocked(userId: number, blockedUserId: number): Promise<boolean>;
  
  // Blocked Content
  blockContent(userId: number, contentType: string, contentId: number, reason?: string): Promise<any>;
  unblockContent(userId: number, contentType: string, contentId: number): Promise<void>;
  getBlockedContent(userId: number): Promise<any[]>;
  
  // Teachers
  createTeacher(teacher: any): Promise<any>;
  getTeachers(params: { verified?: boolean; limit?: number; offset?: number }): Promise<any[]>;
  getTeacherById(id: number): Promise<any | undefined>;
  getTeacherByUserId(userId: number): Promise<any | undefined>;
  updateTeacher(id: number, data: any): Promise<any | undefined>;
  deleteTeacher(id: number): Promise<void>;
  
  // Venues
  createVenue(venue: any): Promise<any>;
  getVenues(params: { city?: string; verified?: boolean; limit?: number; offset?: number }): Promise<any[]>;
  getVenueById(id: number): Promise<any | undefined>;
  updateVenue(id: number, data: any): Promise<any | undefined>;
  deleteVenue(id: number): Promise<void>;
  
  // Tutorials
  createTutorial(tutorial: any): Promise<any>;
  getTutorials(params: { level?: string; limit?: number; offset?: number }): Promise<any[]>;
  getTutorialById(id: number): Promise<any | undefined>;
  updateTutorial(id: number, data: any): Promise<any | undefined>;
  deleteTutorial(id: number): Promise<void>;
  
  // Blog Posts
  createBlogPost(post: any): Promise<any>;
  getBlogPosts(params: { published?: boolean; authorId?: number; limit?: number; offset?: number }): Promise<any[]>;
  getBlogPostById(id: number): Promise<any | undefined>;
  getBlogPostBySlug(slug: string): Promise<any | undefined>;
  updateBlogPost(id: number, data: any): Promise<any | undefined>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Newsletter Subscriptions
  createNewsletterSubscription(subscription: any): Promise<any>;
  getNewsletterSubscriptions(params: { subscribed?: boolean }): Promise<any[]>;
  updateNewsletterSubscription(email: string, data: any): Promise<any | undefined>;
  deleteNewsletterSubscription(email: string): Promise<void>;
  
  // Bookings
  createBooking(booking: any): Promise<any>;
  getBookingById(id: number): Promise<any | undefined>;
  getBookingByConfirmation(confirmationNumber: string): Promise<any | undefined>;
  getUserBookings(userId: number, params: { status?: string }): Promise<any[]>;
  updateBooking(id: number, data: any): Promise<any | undefined>;
  deleteBooking(id: number): Promise<void>;
  
  // Talent Match (Volunteers, Resumes, Clarifier, Tasks, Assignments)
  createVolunteer(volunteer: any): Promise<any>;
  getVolunteerById(id: number): Promise<any | undefined>;
  getVolunteerByUserId(userId: number): Promise<any | undefined>;
  
  createResume(resume: any): Promise<any>;
  getResumeByVolunteerId(volunteerId: number): Promise<any | undefined>;
  
  createClarifierSession(session: any): Promise<any>;
  getClarifierSessionById(id: number): Promise<any | undefined>;
  updateClarifierSession(id: number, data: any): Promise<any | undefined>;
  
  createTask(task: any): Promise<any>;
  getAllTasks(): Promise<any[]>;
  getTaskById(id: number): Promise<any | undefined>;
  
  createAssignment(assignment: any): Promise<any>;
  getAssignmentsByVolunteerId(volunteerId: number): Promise<any[]>;
  getPendingAssignments(): Promise<any[]>;
  updateAssignment(id: number, data: any): Promise<any | undefined>;
  
  followUser(followerId: number, followingId: number): Promise<SelectFollow | undefined>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<SelectFollow[]>;
  getFollowing(userId: number): Promise<SelectFollow[]>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  
  createEvent(event: InsertEvent): Promise<SelectEvent>;
  getEventById(id: number): Promise<SelectEvent | undefined>;
  getEvents(params: { city?: string; eventType?: string; startDate?: Date; endDate?: Date; search?: string; limit?: number; offset?: number }): Promise<SelectEvent[]>;
  updateEvent(id: number, data: Partial<SelectEvent>): Promise<SelectEvent | undefined>;
  deleteEvent(id: number): Promise<void>;
  
  createEventRsvp(rsvp: InsertEventRsvp): Promise<SelectEventRsvp | undefined>;
  getEventRsvps(eventId: number): Promise<SelectEventRsvp[]>;
  getUserEventRsvp(eventId: number, userId: number): Promise<SelectEventRsvp | undefined>;
  getUserRsvps(userId: number): Promise<SelectEventRsvp[]>;
  updateEventRsvp(eventId: number, userId: number, status: string): Promise<SelectEventRsvp | undefined>;
  
  createGroup(group: InsertGroup): Promise<SelectGroup>;
  getGroupById(id: number): Promise<SelectGroup | undefined>;
  getGroupBySlug(slug: string): Promise<SelectGroup | undefined>;
  getGroups(params: { search?: string; limit?: number; offset?: number }): Promise<SelectGroup[]>;
  
  // Search methods for @mentions autocomplete
  searchUsers(query: string, limit: number): Promise<any[]>;
  searchEventsSimple(query: string, limit: number): Promise<any[]>;
  searchGroups(query: string, limit: number): Promise<any[]>;
  searchCommunities(query: string, limit: number): Promise<any[]>;
  getCommunityById(id: number): Promise<any | undefined>;
  updateGroup(id: number, data: Partial<SelectGroup>): Promise<SelectGroup | undefined>;
  deleteGroup(id: number): Promise<void>;
  
  joinGroup(groupId: number, userId: number): Promise<SelectGroupMember | undefined>;
  leaveGroup(groupId: number, userId: number): Promise<void>;
  getGroupMembers(groupId: number): Promise<SelectGroupMember[]>;
  isGroupMember(groupId: number, userId: number): Promise<boolean>;
  
  getUserConversations(userId: number): Promise<any[]>;
  getOrCreateDirectConversation(userId1: number, userId2: number): Promise<SelectChatRoom>;
  getChatRoomMessages(chatRoomId: number, limit?: number, offset?: number): Promise<SelectChatMessage[]>;
  sendMessage(message: InsertChatMessage): Promise<SelectChatMessage>;
  markConversationAsRead(chatRoomId: number, userId: number): Promise<void>;
  
  createNotification(notification: InsertNotification): Promise<SelectNotification>;
  getUserNotifications(userId: number, limit?: number): Promise<SelectNotification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Life CEO System
  getAllLifeCeoDomains(): Promise<any[]>;
  getLifeCeoGoalsByUser(userId: number): Promise<any[]>;
  createLifeCeoGoal(goal: any): Promise<any>;
  updateLifeCeoGoal(id: number, data: any): Promise<any | undefined>;
  getLifeCeoTasksByUser(userId: number): Promise<any[]>;
  createLifeCeoTask(task: any): Promise<any>;
  updateLifeCeoTask(id: number, data: any): Promise<any | undefined>;
  getLifeCeoRecommendationsByUser(userId: number): Promise<any[]>;
  
  // Admin Dashboard
  getAdminStats(): Promise<any>;
  getModerationQueue(): Promise<any[]>;
  getRecentAdminActivity(): Promise<any[]>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Track 7: Memories
  createMemory(memory: InsertMemory): Promise<SelectMemory>;
  getMemoryById(id: number): Promise<SelectMemory | undefined>;
  getUserMemories(userId: number, params?: { type?: string; limit?: number; offset?: number }): Promise<SelectMemory[]>;
  updateMemory(id: number, data: Partial<SelectMemory>): Promise<SelectMemory | undefined>;
  deleteMemory(id: number): Promise<void>;
  
  // Track 7: Recommendations
  createRecommendation(recommendation: InsertRecommendation): Promise<SelectRecommendation>;
  getUserRecommendations(userId: number, params?: { targetType?: string; status?: string; limit?: number }): Promise<SelectRecommendation[]>;
  updateRecommendationStatus(id: number, status: string): Promise<SelectRecommendation | undefined>;
  deleteRecommendation(id: number): Promise<void>;
  
  // Track 7: Role Invitations
  createRoleInvitation(invitation: InsertRoleInvitation): Promise<SelectRoleInvitation>;
  getRoleInvitationById(id: number): Promise<SelectRoleInvitation | undefined>;
  getUserRoleInvitations(userId: number, params?: { status?: string; role?: string }): Promise<SelectRoleInvitation[]>;
  updateRoleInvitationStatus(id: number, status: string): Promise<SelectRoleInvitation | undefined>;
  deleteRoleInvitation(id: number): Promise<void>;
  
  // Track 7: Favorites
  createFavorite(favorite: InsertFavorite): Promise<SelectFavorite>;
  getUserFavorites(userId: number, params?: { targetType?: string; limit?: number; offset?: number }): Promise<SelectFavorite[]>;
  deleteFavorite(userId: number, targetType: string, targetId: number): Promise<void>;
  isFavorited(userId: number, targetType: string, targetId: number): Promise<boolean>;
  
  // Track 7: Community Stats
  createCommunityStats(stats: InsertCommunityStats): Promise<SelectCommunityStats>;
  getCommunityStatsByCity(city: string, country: string): Promise<SelectCommunityStats | undefined>;
  getAllCommunityStats(params?: { limit?: number; offset?: number }): Promise<SelectCommunityStats[]>;
  updateCommunityStats(id: number, data: Partial<SelectCommunityStats>): Promise<SelectCommunityStats | undefined>;
  
  // Platform Independence: Deployments
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  getDeploymentById(id: number): Promise<Deployment | undefined>;
  getDeployments(params: { userId: number; type?: string; status?: string; limit?: number; offset?: number }): Promise<Deployment[]>;
  updateDeployment(id: number, data: Partial<Deployment>): Promise<Deployment | undefined>;
  deleteDeployment(id: number): Promise<void>;
  getDeploymentByVercelId(vercelDeploymentId: string): Promise<Deployment | undefined>;
  getDeploymentByRailwayId(railwayDeploymentId: string): Promise<Deployment | undefined>;
  
  // Platform Independence: Platform Integrations
  createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration>;
  getPlatformIntegration(userId: number, platform: string): Promise<PlatformIntegration | undefined>;
  updatePlatformIntegration(id: number, data: Partial<PlatformIntegration>): Promise<PlatformIntegration | undefined>;
  deletePlatformIntegration(id: number): Promise<void>;
  
  // Platform Independence: Environment Variables
  createEnvironmentVariable(envVar: InsertEnvironmentVariable): Promise<EnvironmentVariable>;
  getEnvironmentVariableById(id: number): Promise<EnvironmentVariable | undefined>;
  getEnvironmentVariables(params: { userId: number; environment?: string }): Promise<EnvironmentVariable[]>;
  updateEnvironmentVariable(id: number, data: Partial<EnvironmentVariable>): Promise<EnvironmentVariable | undefined>;
  deleteEnvironmentVariable(id: number): Promise<void>;
  
  // Platform Independence: Preview Deployments
  createPreviewDeployment(preview: InsertPreviewDeployment): Promise<PreviewDeployment>;
  getPreviewDeploymentById(id: number): Promise<PreviewDeployment | undefined>;
  getPreviewDeployments(params: { userId: number; status?: string }): Promise<PreviewDeployment[]>;
  updatePreviewDeployment(id: number, data: Partial<PreviewDeployment>): Promise<PreviewDeployment | undefined>;
  deletePreviewDeployment(id: number): Promise<void>;
  expirePreviewDeployment(id: number): Promise<void>;
  getExpiredPreviews(): Promise<PreviewDeployment[]>;
  
  // Platform Independence: Custom Domains (TIER 2.1)
  createCustomDomain(domain: any): Promise<any>;
  getCustomDomains(userId: number): Promise<any[]>;
  updateCustomDomain(id: number, userId: number, data: any): Promise<any | null>;
  
  // Housing System (Wave 8D)
  createHousingListing(listing: InsertHousingListing): Promise<SelectHousingListing>;
  getHousingListingById(id: number): Promise<SelectHousingListing | undefined>;
  getHousingListings(params: { city?: string; country?: string; hostId?: number; status?: string; propertyTypes?: string[]; minPrice?: number; maxPrice?: number; bedrooms?: number; bathrooms?: number; maxGuests?: number; amenities?: string[]; friendsOnly?: boolean; limit?: number; offset?: number }): Promise<SelectHousingListing[]>;
  updateHousingListing(id: number, data: Partial<SelectHousingListing>): Promise<SelectHousingListing | undefined>;
  deleteHousingListing(id: number): Promise<void>;
  
  createHousingBooking(booking: InsertHousingBooking): Promise<SelectHousingBooking>;
  getHousingBookingById(id: number): Promise<SelectHousingBooking | undefined>;
  getHousingBookings(params: { listingId?: number; guestId?: number; status?: string; limit?: number; offset?: number }): Promise<SelectHousingBooking[]>;
  updateHousingBooking(id: number, data: Partial<SelectHousingBooking>): Promise<SelectHousingBooking | undefined>;
  deleteHousingBooking(id: number): Promise<void>;
  deleteCustomDomain(id: number, userId: number): Promise<boolean>;
  
  // Platform Independence: Analytics Events (TIER 2.2)
  createAnalyticsEvent(event: any): Promise<any>;
  getAnalyticsEvents(params: { userId: number; eventType?: string; limit?: number }): Promise<any[]>;
  getAnalyticsSummary(userId: number, days?: number): Promise<any>;
  
  // Platform Independence: Team Members (TIER 2.3)
  createTeamMember(member: any): Promise<any>;
  getTeamMembers(ownerId: number): Promise<any[]>;
  updateTeamMember(id: number, ownerId: number, data: any): Promise<any | null>;
  deleteTeamMember(id: number, ownerId: number): Promise<boolean>;
  
  // Platform Independence: Cost Tracking (TIER 3.1)
  createCostRecord(cost: any): Promise<any>;
  getCostRecords(params: { userId: number; platform?: string; startDate?: Date; endDate?: Date }): Promise<any[]>;
  getCostSummary(userId: number, days?: number): Promise<any>;
  
  // Platform Independence: Database Backups (TIER 3.2)
  createDatabaseBackup(backup: any): Promise<any>;
  getDatabaseBackups(userId: number): Promise<any[]>;
  updateDatabaseBackup(id: number, userId: number, data: any): Promise<any | null>;
  deleteDatabaseBackup(id: number, userId: number): Promise<boolean>;
  
  // Platform Independence: CI/CD Pipelines (TIER 4)
  createCicdPipeline(pipeline: any): Promise<any>;
  getCicdPipelines(userId: number): Promise<any[]>;
  updateCicdPipeline(id: number, userId: number, data: any): Promise<any | null>;
  deleteCicdPipeline(id: number, userId: number): Promise<boolean>;
  createCicdRun(run: any): Promise<any>;
  getCicdRuns(pipelineId: number): Promise<any[]>;
  updateCicdRun(id: number, userId: number, data: any): Promise<any | null>;

  // Search
  search(query: string, userId: number): Promise<any[]>;

  // Admin
  getAdminStats(): Promise<any>;
  getModerationQueue(): Promise<any[]>;
  getRecentAdminActivity(): Promise<any[]>;
  
  // ============================================================================
  // GROUPS - ENHANCED OPERATIONS
  // ============================================================================
  
  // Group Invites
  sendGroupInvite(invite: InsertGroupInvite): Promise<SelectGroupInvite>;
  getGroupInvites(groupId: number): Promise<SelectGroupInvite[]>;
  getUserGroupInvites(userId: number): Promise<SelectGroupInvite[]>;
  acceptGroupInvite(inviteId: number): Promise<void>;
  declineGroupInvite(inviteId: number): Promise<void>;
  
  // Group Posts
  createGroupPost(post: InsertGroupPost): Promise<SelectGroupPost>;
  getGroupPosts(groupId: number, params: { limit?: number; offset?: number }): Promise<SelectGroupPost[]>;
  getGroupPostById(id: number): Promise<SelectGroupPost | undefined>;
  updateGroupPost(id: number, data: Partial<SelectGroupPost>): Promise<SelectGroupPost | undefined>;
  deleteGroupPost(id: number): Promise<void>;
  pinGroupPost(postId: number): Promise<void>;
  unpinGroupPost(postId: number): Promise<void>;
  approveGroupPost(postId: number, approverId: number): Promise<void>;
  
  // Group Categories
  createGroupCategory(category: InsertGroupCategory): Promise<SelectGroupCategory>;
  getGroupCategories(): Promise<SelectGroupCategory[]>;
  assignGroupCategory(groupId: number, categoryId: number): Promise<void>;
  removeGroupCategory(groupId: number, categoryId: number): Promise<void>;
  getGroupsByCategory(categoryId: number): Promise<SelectGroup[]>;
  
  // Enhanced Group Membership
  updateGroupMember(groupId: number, userId: number, data: Partial<SelectGroupMember>): Promise<SelectGroupMember | undefined>;
  banGroupMember(groupId: number, userId: number): Promise<void>;
  getSuggestedGroups(userId: number, limit?: number): Promise<SelectGroup[]>;
  
  // ============================================================================
  // EVENTS - ENHANCED OPERATIONS
  // ============================================================================
  
  // Event Photos
  uploadEventPhoto(photo: InsertEventPhoto): Promise<SelectEventPhoto>;
  getEventPhotos(eventId: number): Promise<SelectEventPhoto[]>;
  getEventPhotoById(id: number): Promise<SelectEventPhoto | undefined>;
  deleteEventPhoto(id: number): Promise<void>;
  featureEventPhoto(photoId: number): Promise<void>;
  unfeatureEventPhoto(photoId: number): Promise<void>;
  
  // Event Comments
  createEventComment(comment: InsertEventComment): Promise<SelectEventComment>;
  getEventComments(eventId: number): Promise<SelectEventComment[]>;
  updateEventComment(id: number, content: string): Promise<SelectEventComment | undefined>;
  deleteEventComment(id: number): Promise<void>;
  
  // Event Reminders
  createEventReminder(reminder: InsertEventReminder): Promise<SelectEventReminder>;
  getEventReminders(rsvpId: number): Promise<SelectEventReminder[]>;
  markReminderSent(reminderId: number): Promise<void>;
  
  // Enhanced Event RSVPs
  checkInEventAttendee(eventId: number, userId: number): Promise<SelectEventRsvp | undefined>;
  addToWaitlist(eventId: number, userId: number, guestCount?: number): Promise<SelectEventRsvp | undefined>;
  getEventWaitlist(eventId: number): Promise<SelectEventRsvp[]>;
  searchEvents(params: { 
    query?: string;
    eventType?: string;
    city?: string;
    startDate?: Date;
    endDate?: Date;
    musicStyle?: string;
    limit?: number;
    offset?: number;
  }): Promise<SelectEvent[]>;
  
  // ============================================================================
  // PROFILES - CORE OPERATIONS (BATCH 02-03)
  // ============================================================================
  
  getUserProfile(userId: number): Promise<SelectUser & { profiles: any } | undefined>;
  updateUserProfile(userId: number, data: Partial<SelectUser>): Promise<SelectUser | undefined>;
  getPublicProfile(userId: number): Promise<any>;
  trackProfileView(viewerId: number, viewedUserId: number, profileType?: string, viewerIp?: string): Promise<void>;
  getProfileAnalytics(userId: number): Promise<any>;
  getProfileInsights(userId: number): Promise<any>;
  
  // ============================================================================
  // BATCH 02: COMPREHENSIVE PROFILE MANAGEMENT
  // ============================================================================
  
  // Core Profile Methods
  getProfile(userId: number, profileType?: string): Promise<any>;
  updateProfile(userId: number, profileType: string, data: any): Promise<any>;
  getAllUserProfiles(userId: number): Promise<any>;
  
  // Business Profile Methods (schools, hotels, venues)
  getBusinessProfile(userId: number, businessType: string): Promise<any>;
  updateBusinessProfile(userId: number, businessType: string, data: any): Promise<any>;
  
  // Specialty Profile Methods (wellness, tours, guides, learning resources)
  getSpecialtyProfile(userId: number, specialtyType: string): Promise<any>;
  updateSpecialtyProfile(userId: number, specialtyType: string, data: any): Promise<any>;
  
  // Profile Visibility & Privacy
  getProfileVisibilitySettings(userId: number): Promise<any>;
  updateProfileVisibility(userId: number, settings: any): Promise<any>;
  
  // Profile Analytics
  incrementProfileView(userId: number, viewerId: number): Promise<void>;
  getProfileViewStats(userId: number): Promise<any>;
  
  // Feed Stats
  getPostsCount(params?: { since?: Date }): Promise<number>;
  getActiveUsersCount(): Promise<number>;
  getUpcomingEventsCount(): Promise<number>;
  
  // ============================================================================
  // BATCH 15: ADVANCED PROFILE SEARCH AND FILTERING
  // ============================================================================
  
  // Comprehensive profile search across all profile types
  searchProfiles(filters: {
    profileTypes?: string[];
    location?: { city?: string; country?: string; radius?: number };
    priceRange?: { min?: number; max?: number };
    availability?: string;
    experience?: { min?: number; max?: number };
    languages?: string[];
    specialties?: string[];
    rating?: { min?: number };
    searchQuery?: string;
    sortBy?: 'relevance' | 'rating' | 'price' | 'experience' | 'recent';
    limit?: number;
    offset?: number;
  }): Promise<{ profiles: any[]; total: number }>;
  
  // BATCH 15: Unified Profile Search across ALL 17 types
  searchAllProfiles(filters: {
    q?: string;
    types?: string[];
    city?: string;
    country?: string;
    minRating?: number;
    maxPrice?: number;
    verified?: boolean;
    availability?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    results: Array<{
      type: string;
      profile: any;
      user: any;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // Browse profiles by type with optional location filtering
  getProfileDirectory(params: {
    profileType: string;
    city?: string;
    country?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ profiles: any[]; total: number }>;
  
  // Get featured professionals
  getFeaturedProfiles(params: {
    profileType?: string;
    limit?: number;
  }): Promise<any[]>;
  
  // Location-based profile search
  getNearbyProfiles(params: {
    latitude: number;
    longitude: number;
    radius: number;
    profileType?: string;
    limit?: number;
  }): Promise<any[]>;
  
  // Get recommended profiles for a user
  getRecommendedProfiles(params: {
    userId: number;
    limit?: number;
  }): Promise<any[]>;
  
  // Get profile statistics by type
  getProfileStats(): Promise<any>;
  
  // Teacher Profiles
  getTeacherProfile(userId: number): Promise<SelectTeacherProfile | null>;
  createTeacherProfile(data: InsertTeacherProfile): Promise<SelectTeacherProfile>;
  updateTeacherProfile(userId: number, data: Partial<SelectTeacherProfile>): Promise<SelectTeacherProfile | null>;
  deleteTeacherProfile(userId: number): Promise<void>;
  
  // DJ Profiles
  getDJProfile(userId: number): Promise<SelectDJProfile | null>;
  createDJProfile(data: InsertDJProfile): Promise<SelectDJProfile>;
  updateDJProfile(userId: number, data: Partial<SelectDJProfile>): Promise<SelectDJProfile | null>;
  deleteDJProfile(userId: number): Promise<void>;
  
  // Photographer Profiles
  getPhotographerProfile(userId: number): Promise<SelectPhotographerProfile | null>;
  createPhotographerProfile(data: InsertPhotographerProfile): Promise<SelectPhotographerProfile>;
  updatePhotographerProfile(userId: number, data: Partial<SelectPhotographerProfile>): Promise<SelectPhotographerProfile | null>;
  deletePhotographerProfile(userId: number): Promise<void>;
  
  // Performer Profiles
  getPerformerProfile(userId: number): Promise<SelectPerformerProfile | null>;
  createPerformerProfile(data: InsertPerformerProfile): Promise<SelectPerformerProfile>;
  updatePerformerProfile(userId: number, data: Partial<SelectPerformerProfile>): Promise<SelectPerformerProfile | null>;
  deletePerformerProfile(userId: number): Promise<void>;
  
  // Vendor Profiles
  getVendorProfile(userId: number): Promise<SelectVendorProfile | null>;
  createVendorProfile(data: InsertVendorProfile): Promise<SelectVendorProfile>;
  updateVendorProfile(userId: number, data: Partial<SelectVendorProfile>): Promise<SelectVendorProfile | null>;
  deleteVendorProfile(userId: number): Promise<void>;
  
  // Musician Profiles
  getMusicianProfile(userId: number): Promise<SelectMusicianProfile | null>;
  createMusicianProfile(data: InsertMusicianProfile): Promise<SelectMusicianProfile>;
  updateMusicianProfile(userId: number, data: Partial<SelectMusicianProfile>): Promise<SelectMusicianProfile | null>;
  deleteMusicianProfile(userId: number): Promise<void>;
  
  // Choreographer Profiles
  getChoreographerProfile(userId: number): Promise<SelectChoreographerProfile | null>;
  createChoreographerProfile(data: InsertChoreographerProfile): Promise<SelectChoreographerProfile>;
  updateChoreographerProfile(userId: number, data: Partial<SelectChoreographerProfile>): Promise<SelectChoreographerProfile | null>;
  deleteChoreographerProfile(userId: number): Promise<void>;
  
  // Tango School Profiles
  getTangoSchoolProfile(userId: number): Promise<SelectTangoSchoolProfile | null>;
  createTangoSchoolProfile(data: InsertTangoSchoolProfile): Promise<SelectTangoSchoolProfile>;
  updateTangoSchoolProfile(userId: number, data: Partial<SelectTangoSchoolProfile>): Promise<SelectTangoSchoolProfile | null>;
  deleteTangoSchoolProfile(userId: number): Promise<void>;
  
  // Tango Hotel Profiles
  getTangoHotelProfile(userId: number): Promise<SelectTangoHotelProfile | null>;
  createTangoHotelProfile(data: InsertTangoHotelProfile): Promise<SelectTangoHotelProfile>;
  updateTangoHotelProfile(userId: number, data: Partial<SelectTangoHotelProfile>): Promise<SelectTangoHotelProfile | null>;
  deleteTangoHotelProfile(userId: number): Promise<void>;
  
  // Wellness Profiles
  getWellnessProfile(userId: number): Promise<SelectWellnessProfile | null>;
  createWellnessProfile(data: InsertWellnessProfile): Promise<SelectWellnessProfile>;
  updateWellnessProfile(userId: number, data: Partial<SelectWellnessProfile>): Promise<SelectWellnessProfile | null>;
  deleteWellnessProfile(userId: number): Promise<void>;
  
  // Tour Operator Profiles
  getTourOperatorProfile(userId: number): Promise<SelectTourOperatorProfile | null>;
  createTourOperatorProfile(data: InsertTourOperatorProfile): Promise<SelectTourOperatorProfile>;
  updateTourOperatorProfile(userId: number, data: Partial<SelectTourOperatorProfile>): Promise<SelectTourOperatorProfile | null>;
  deleteTourOperatorProfile(userId: number): Promise<void>;
  
  // Host Venue Profiles
  getHostVenueProfile(userId: number): Promise<SelectHostVenueProfile | null>;
  createHostVenueProfile(data: InsertHostVenueProfile): Promise<SelectHostVenueProfile>;
  updateHostVenueProfile(userId: number, data: Partial<SelectHostVenueProfile>): Promise<SelectHostVenueProfile | null>;
  deleteHostVenueProfile(userId: number): Promise<void>;
  
  // Tango Guide Profiles
  getTangoGuideProfile(userId: number): Promise<SelectTangoGuideProfile | null>;
  createTangoGuideProfile(data: InsertTangoGuideProfile): Promise<SelectTangoGuideProfile>;
  updateTangoGuideProfile(userId: number, data: Partial<SelectTangoGuideProfile>): Promise<SelectTangoGuideProfile | null>;
  deleteTangoGuideProfile(userId: number): Promise<void>;
  
  // Content Creator Profiles
  getContentCreatorProfile(userId: number): Promise<SelectContentCreatorProfile | null>;
  createContentCreatorProfile(data: InsertContentCreatorProfile): Promise<SelectContentCreatorProfile>;
  updateContentCreatorProfile(userId: number, data: Partial<SelectContentCreatorProfile>): Promise<SelectContentCreatorProfile | null>;
  deleteContentCreatorProfile(userId: number): Promise<void>;
  
  // Learning Resource Profiles
  getLearningResourceProfile(userId: number): Promise<SelectLearningResourceProfile | null>;
  createLearningResourceProfile(data: InsertLearningResourceProfile): Promise<SelectLearningResourceProfile>;
  updateLearningResourceProfile(userId: number, data: Partial<SelectLearningResourceProfile>): Promise<SelectLearningResourceProfile | null>;
  deleteLearningResourceProfile(userId: number): Promise<void>;
  
  // Taxi Dancer Profiles
  getTaxiDancerProfile(userId: number): Promise<SelectTaxiDancerProfile | null>;
  createTaxiDancerProfile(data: InsertTaxiDancerProfile): Promise<SelectTaxiDancerProfile>;
  updateTaxiDancerProfile(userId: number, data: Partial<SelectTaxiDancerProfile>): Promise<SelectTaxiDancerProfile | null>;
  deleteTaxiDancerProfile(userId: number): Promise<void>;
  
  // Organizer Profiles
  getOrganizerProfile(userId: number): Promise<SelectOrganizerProfile | null>;
  createOrganizerProfile(data: InsertOrganizerProfile): Promise<SelectOrganizerProfile>;
  updateOrganizerProfile(userId: number, data: Partial<SelectOrganizerProfile>): Promise<SelectOrganizerProfile | null>;
  deleteOrganizerProfile(userId: number): Promise<void>;
  
  // Talent Profiles (Generic)
  getTalentProfile(userId: number): Promise<SelectTalentProfile | null>;
  createTalentProfile(data: InsertTalentProfile): Promise<SelectTalentProfile>;
  updateTalentProfile(userId: number, data: Partial<SelectTalentProfile>): Promise<SelectTalentProfile | null>;
  deleteTalentProfile(userId: number): Promise<void>;
  
  // BATCH 15: Enhanced Profile Search Methods with Advanced Filtering
  // Common search result interface for all profile types
  searchTeacherProfiles(params: { 
    q?: string;  // Full-text search across bio, specialties, etc.
    city?: string; 
    country?: string; 
    lat?: number;  // Geolocation search
    lng?: number;
    radius?: number;  // In kilometers
    minRate?: number;  // Unified rate parameter
    maxRate?: number;
    minRating?: number; 
    verified?: boolean;
    specialties?: string[];
    languages?: string[];
    availableDate?: string;  // ISO date format
    minExperience?: number;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectTeacherProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchDJProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    verified?: boolean;
    musicStyles?: string[];
    languages?: string[];
    availableDate?: string;
    minExperience?: number;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectDJProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchPhotographerProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    verified?: boolean;
    specialties?: string[];
    languages?: string[];
    availableDate?: string;
    minExperience?: number;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectPhotographerProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchPerformerProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    verified?: boolean;
    performanceTypes?: string[];
    languages?: string[];
    availableDate?: string;
    minExperience?: number;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectPerformerProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchVendorProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    verified?: boolean;
    productCategories?: string[];
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectVendorProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchMusicianProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    verified?: boolean;
    instruments?: string[];
    genres?: string[];
    languages?: string[];
    availableDate?: string;
    minExperience?: number;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectMusicianProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchChoreographerProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    verified?: boolean;
    styles?: string[];
    languages?: string[];
    availableDate?: string;
    minExperience?: number;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectChoreographerProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchTangoSchoolProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    verified?: boolean;
    classTypes?: string[];
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectTangoSchoolProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchTangoHotelProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    verified?: boolean;
    amenities?: string[];
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectTangoHotelProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchHostVenueProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRating?: number;
    minCapacity?: number;
    verified?: boolean;
    amenities?: string[];
    venueTypes?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectHostVenueProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchWellnessProfiles(params: { 
    q?: string;
    services?: string; 
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    minRating?: number;
    minRate?: number;
    maxRate?: number;
    verified?: boolean;
    specialties?: string[];
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectWellnessProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchTourOperatorProfiles(params: { 
    q?: string;
    destination?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    minRating?: number;
    verified?: boolean;
    tourTypes?: string[];
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectTourOperatorProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchTangoGuideProfiles(params: { 
    q?: string;
    city?: string; 
    language?: string;
    country?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    minRating?: number;
    minRate?: number;
    maxRate?: number;
    verified?: boolean;
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectTangoGuideProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchTaxiDancerProfiles(params: { 
    q?: string;
    city?: string; 
    style?: string;
    country?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    minRating?: number;
    minRate?: number;
    maxRate?: number;
    verified?: boolean;
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectTaxiDancerProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchContentCreatorProfiles(params: { 
    q?: string;
    platform?: string; 
    contentType?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    minRating?: number;
    minFollowers?: number;
    verified?: boolean;
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectContentCreatorProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchLearningResourceProfiles(params: { 
    q?: string;
    topic?: string; 
    format?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    minRating?: number;
    minRate?: number;
    maxRate?: number;
    verified?: boolean;
    level?: string;
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectLearningResourceProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchOrganizerProfiles(params: { 
    q?: string;
    city?: string; 
    eventType?: string;
    country?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    minRating?: number;
    verified?: boolean;
    minEventsOrganized?: number;
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectOrganizerProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  searchTalentProfiles(params: {
    q?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    minRating?: number;
    verified?: boolean;
    talentType?: string;
    languages?: string[];
    availableDate?: string;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number;
    offset?: number;
  }): Promise<{ 
    results: SelectTalentProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }>;
  
  // Album Management
  createAlbum(album: any): Promise<any>;
  getAlbumById(id: number): Promise<any | undefined>;
  getUserAlbums(userId: number): Promise<any[]>;
  updateAlbum(id: number, data: any): Promise<any | undefined>;
  deleteAlbum(id: number): Promise<void>;
  addMediaToAlbum(albumId: number, mediaId: number, order: number): Promise<any>;
  getAlbumMedia(albumId: number, params: { limit?: number; offset?: number }): Promise<any[]>;
  removeMediaFromAlbum(albumId: number, mediaId: number): Promise<void>;
  getAlbumWithMedia(id: number): Promise<any | undefined>;
  checkAlbumOwnership(albumId: number, userId: number): Promise<boolean>;
  
  // ============================================================================
  // PART_3: FINANCIAL MANAGEMENT SYSTEM (AGENTS #73-105)
  // ============================================================================
  
  // Financial Portfolios
  createFinancialPortfolio(userId: number, data: any): Promise<any>;
  getFinancialPortfolios(userId: number): Promise<any[]>;
  getFinancialPortfolioById(id: number): Promise<any | undefined>;
  updateFinancialPortfolio(id: number, data: any): Promise<any | undefined>;
  deleteFinancialPortfolio(id: number): Promise<void>;
  
  // Financial Accounts
  createFinancialAccount(userId: number, data: any): Promise<any>;
  getFinancialAccounts(userId: number): Promise<any[]>;
  getFinancialAccountById(id: number): Promise<any | undefined>;
  updateFinancialAccount(id: number, data: any): Promise<any | undefined>;
  deleteFinancialAccount(id: number): Promise<void>;
  syncFinancialAccount(id: number): Promise<any>;
  
  // Financial Assets
  createFinancialAsset(portfolioId: number, data: any): Promise<any>;
  getFinancialAssets(portfolioId: number): Promise<any[]>;
  updateFinancialAsset(id: number, data: any): Promise<any | undefined>;
  deleteFinancialAsset(id: number): Promise<void>;
  
  // Financial Trades
  createFinancialTrade(portfolioId: number, data: any): Promise<any>;
  getFinancialTrades(portfolioId: number, params?: { limit?: number; offset?: number }): Promise<any[]>;
  getFinancialTradeById(id: number): Promise<any | undefined>;
  
  // Financial Strategies
  createFinancialStrategy(data: any): Promise<any>;
  getFinancialStrategies(params?: { isActive?: boolean }): Promise<any[]>;
  getFinancialStrategyById(id: number): Promise<any | undefined>;
  updateFinancialStrategy(id: number, data: any): Promise<any | undefined>;
  deleteFinancialStrategy(id: number): Promise<void>;
  
  // Financial Market Data
  getFinancialMarketData(symbol: string): Promise<any | undefined>;
  updateFinancialMarketData(symbol: string, data: any): Promise<any>;
  
  // Financial AI Decisions
  createFinancialAIDecision(data: any): Promise<any>;
  getFinancialAIDecisions(portfolioId: number, params?: { limit?: number; offset?: number }): Promise<any[]>;
  
  // Financial Risk Metrics
  getFinancialRiskMetrics(portfolioId: number): Promise<any | undefined>;
  updateFinancialRiskMetrics(portfolioId: number, data: any): Promise<any>;
  
  // Financial Agents
  getFinancialAgents(params?: { tier?: number; isActive?: boolean }): Promise<any[]>;
  getFinancialAgentById(id: number): Promise<any | undefined>;
  updateFinancialAgent(id: number, data: any): Promise<any | undefined>;
  
  // Financial Monitoring
  createFinancialMonitoringLog(data: any): Promise<any>;
  getFinancialMonitoringLogs(params: { agentId?: number; portfolioId?: number; limit?: number }): Promise<any[]>;
  
  // ============================================================================
  // PART_3: SOCIAL MEDIA INTEGRATION (AGENTS #120-124)
  // ============================================================================
  
  // Platform Connections
  createPlatformConnection(userId: number, data: any): Promise<any>;
  getPlatformConnections(userId: number): Promise<any[]>;
  getPlatformConnection(userId: number, platform: string): Promise<any | undefined>;
  updatePlatformConnection(id: number, data: any): Promise<any | undefined>;
  deletePlatformConnection(id: number): Promise<void>;
  
  // Social Posts
  createSocialPost(userId: number, data: any): Promise<any>;
  getSocialPosts(userId: number, params?: { status?: string; limit?: number; offset?: number }): Promise<any[]>;
  getSocialPostById(id: number): Promise<any | undefined>;
  updateSocialPost(id: number, data: any): Promise<any | undefined>;
  deleteSocialPost(id: number): Promise<void>;
  publishSocialPost(id: number): Promise<any>;
  
  // Social Campaigns
  createSocialCampaign(userId: number, data: any): Promise<any>;
  getSocialCampaigns(userId: number, params?: { status?: string }): Promise<any[]>;
  getSocialCampaignById(id: number): Promise<any | undefined>;
  updateSocialCampaign(id: number, data: any): Promise<any | undefined>;
  deleteSocialCampaign(id: number): Promise<void>;
  
  // Cross Platform Analytics
  getCrossPlatformAnalytics(userId: number, period: string): Promise<any | undefined>;
  createCrossPlatformAnalytics(userId: number, data: any): Promise<any>;
  
  // AI Generated Content
  createAIGeneratedContent(data: any): Promise<any>;
  getAIGeneratedContent(campaignId: number, params?: { approvalStatus?: string }): Promise<any[]>;
  updateAIGeneratedContent(id: number, data: any): Promise<any | undefined>;
  
  // Scraped Events
  createScrapedEvent(data: any): Promise<any>;
  getScrapedEvents(params?: { status?: string; limit?: number; offset?: number }): Promise<any[]>;
  updateScrapedEvent(id: number, data: any): Promise<any | undefined>;
  
  // Event Claims
  createEventClaim(userId: number, scrapedEventId: number, data: any): Promise<any>;
  getEventClaims(userId: number): Promise<any[]>;
  updateEventClaimStatus(id: number, status: string): Promise<any | undefined>;
  
  // ============================================================================
  // PART_3: CREATOR MARKETPLACE (AGENTS #158-160)
  // ============================================================================
  
  // Marketplace Products
  createMarketplaceProduct(userId: number, data: any): Promise<any>;
  getMarketplaceProducts(params?: { creatorUserId?: number; category?: string; limit?: number; offset?: number }): Promise<any[]>;
  getMarketplaceProductById(id: number): Promise<any | undefined>;
  updateMarketplaceProduct(id: number, data: any): Promise<any | undefined>;
  deleteMarketplaceProduct(id: number): Promise<void>;
  
  // Product Purchases
  createProductPurchase(userId: number, productId: number, data: any): Promise<any>;
  getProductPurchases(userId: number): Promise<any[]>;
  getProductPurchaseById(id: number): Promise<any | undefined>;
  
  // Product Reviews
  createProductReview(userId: number, productId: number, data: any): Promise<any>;
  getProductReviews(productId: number): Promise<any[]>;
  updateProductReview(id: number, data: any): Promise<any | undefined>;
  deleteProductReview(id: number): Promise<void>;
  
  // Marketplace Analytics
  getMarketplaceAnalytics(userId: number, period: string): Promise<any | undefined>;
  createMarketplaceAnalytics(userId: number, data: any): Promise<any>;
  
  // Funding Campaigns (GoFundMe)
  createFundingCampaign(userId: number, data: any): Promise<any>;
  getFundingCampaigns(params?: { userId?: number; category?: string; status?: string; limit?: number; offset?: number }): Promise<any[]>;
  getFundingCampaignById(id: number): Promise<any | undefined>;
  updateFundingCampaign(id: number, data: any): Promise<any | undefined>;
  deleteFundingCampaign(id: number): Promise<void>;
  
  // Campaign Donations
  createCampaignDonation(campaignId: number, data: any): Promise<any>;
  getCampaignDonations(campaignId: number): Promise<any[]>;
  
  // Campaign Updates
  createCampaignUpdate(campaignId: number, data: any): Promise<any>;
  getCampaignUpdates(campaignId: number): Promise<any[]>;
  
  // Legal Documents
  createLegalDocument(userId: number, data: any): Promise<any>;
  getLegalDocuments(params?: { category?: string; isPremium?: boolean; limit?: number; offset?: number }): Promise<any[]>;
  getLegalDocumentById(id: number): Promise<any | undefined>;
  updateLegalDocument(id: number, data: any): Promise<any | undefined>;
  deleteLegalDocument(id: number): Promise<void>;
  
  // Document Instances
  createDocumentInstance(userId: number, templateId: number, data: any): Promise<any>;
  getDocumentInstances(userId: number): Promise<any[]>;
  updateDocumentInstance(id: number, data: any): Promise<any | undefined>;
  
  // ============================================================================
  // PART_3: TRAVEL INTEGRATION (AGENTS #161-162)
  // ============================================================================
  
  // Travel Plans
  createTravelPlan(userId: number, data: any): Promise<any>;
  getTravelPlans(userId: number, params?: { status?: string }): Promise<any[]>;
  getTravelPlanById(id: number): Promise<any | undefined>;
  updateTravelPlan(id: number, data: any): Promise<any | undefined>;
  deleteTravelPlan(id: number): Promise<void>;
  
  // Travel Plan Items
  createTravelPlanItem(travelPlanId: number, data: any): Promise<any>;
  getTravelPlanItems(travelPlanId: number): Promise<any[]>;
  updateTravelPlanItem(id: number, data: any): Promise<any | undefined>;
  deleteTravelPlanItem(id: number): Promise<void>;
  
  // Travel Preferences
  getTravelPreferences(userId: number): Promise<any | undefined>;
  updateTravelPreferences(userId: number, data: any): Promise<any>;
  
  // Travel Recommendations
  getTravelRecommendations(userId: number, params?: { destination?: string }): Promise<any[]>;
  createTravelRecommendation(data: any): Promise<any>;
  
  // Facebook Import System
  createFacebookImport(data: any): Promise<any>;
  getFacebookImports(userId?: number): Promise<any[]>;
  getFacebookImportById(id: number): Promise<any | undefined>;
  updateFacebookImport(id: number, data: any): Promise<any | undefined>;
  deleteFacebookImport(id: number): Promise<void>;
  createFacebookPost(data: any): Promise<any>;
  createFacebookFriend(data: any): Promise<any>;
  getFacebookPostsByUserId(userId: number): Promise<any[]>;
  getFacebookFriendsByUserId(userId: number): Promise<any[]>;
}

export class DbStorage implements IStorage {
  async getUserById(id: number): Promise<SelectUser | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<SelectUser | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<SelectUser | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByStripeCustomerId(customerId: string): Promise<SelectUser | undefined> {
    const result = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<SelectUser> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, data: Partial<SelectUser>): Promise<SelectUser | undefined> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateUserSubscription(userId: number, data: {
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    plan?: string;
    status?: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd?: Date;
  }): Promise<void> {
    await db
      .update(users)
      .set({ 
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async createRefreshToken(token: InsertRefreshToken): Promise<SelectRefreshToken> {
    const result = await db.insert(refreshTokens).values(token).returning();
    return result[0];
  }

  async getRefreshToken(token: string): Promise<SelectRefreshToken | undefined> {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(and(
        eq(refreshTokens.token, token),
        gt(refreshTokens.expiresAt, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  async deleteUserRefreshTokens(userId: number): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<SelectEmailVerificationToken> {
    const result = await db.insert(emailVerificationTokens).values(token).returning();
    return result[0];
  }

  async getEmailVerificationToken(token: string): Promise<SelectEmailVerificationToken | undefined> {
    const result = await db
      .select()
      .from(emailVerificationTokens)
      .where(and(
        eq(emailVerificationTokens.token, token),
        gt(emailVerificationTokens.expiresAt, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
  }

  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<SelectPasswordResetToken> {
    const result = await db.insert(passwordResetTokens).values(token).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string): Promise<SelectPasswordResetToken | undefined> {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      ))
      .limit(1);
    return result[0];
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async deleteUserPasswordResetTokens(userId: number): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }

  async createTwoFactorSecret(secret: InsertTwoFactorSecret): Promise<SelectTwoFactorSecret> {
    const result = await db.insert(twoFactorSecrets).values(secret).returning();
    return result[0];
  }

  async getTwoFactorSecret(userId: number): Promise<SelectTwoFactorSecret | undefined> {
    const result = await db
      .select()
      .from(twoFactorSecrets)
      .where(eq(twoFactorSecrets.userId, userId))
      .limit(1);
    return result[0];
  }

  async updateTwoFactorSecret(userId: number, secret: Partial<SelectTwoFactorSecret>): Promise<void> {
    await db
      .update(twoFactorSecrets)
      .set(secret)
      .where(eq(twoFactorSecrets.userId, userId));
  }

  async deleteTwoFactorSecret(userId: number): Promise<void> {
    await db.delete(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
  }

  async createPost(post: InsertPost): Promise<SelectPost> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async getPostById(id: number): Promise<SelectPost | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getPosts(params: { userId?: number; limit?: number; offset?: number; currentUserId?: number; type?: string }): Promise<SelectPost[]> {
    const currentUserId = params.currentUserId;
    
    let query = db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        richContent: posts.richContent,
        plainText: posts.plainText,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        mediaEmbeds: posts.mediaEmbeds,
        mentions: posts.mentions,
        hashtags: posts.hashtags,
        location: posts.location,
        visibility: posts.visibility,
        postType: posts.postType,
        likes: posts.likes,
        comments: posts.comments,
        shares: posts.shares,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        currentReaction: reactions.reactionType,
        isSaved: savedPosts.id,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          friendshipStatus: sql<'accepted' | 'pending' | 'none' | null>`
            CASE 
              WHEN ${friendships.id} IS NOT NULL AND ${friendships.status} = 'active' THEN 'accepted'
              WHEN ${friendRequests.id} IS NOT NULL AND ${friendRequests.status} = 'pending' THEN 'pending'
              ELSE 'none'
            END
          `.as('friendshipStatus'),
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(
        reactions,
        and(
          eq(reactions.postId, posts.id),
          eq(reactions.userId, currentUserId || 0)
        )
      )
      .leftJoin(
        savedPosts,
        and(
          eq(savedPosts.postId, posts.id),
          eq(savedPosts.userId, currentUserId || 0)
        )
      )
      .leftJoin(
        friendships,
        and(
          or(
            and(
              eq(friendships.userId, currentUserId || 0),
              eq(friendships.friendId, users.id)
            ),
            and(
              eq(friendships.friendId, currentUserId || 0),
              eq(friendships.userId, users.id)
            )
          ),
          eq(friendships.status, 'active')
        )
      )
      .leftJoin(
        friendRequests,
        and(
          eq(friendRequests.senderId, currentUserId || 0),
          eq(friendRequests.receiverId, users.id),
          eq(friendRequests.status, 'pending')
        )
      );
    
    // Build where conditions
    const whereConditions = [];
    
    if (params.userId) {
      whereConditions.push(eq(posts.userId, params.userId));
    }
    
    if (params.type) {
      whereConditions.push(eq(posts.type, params.type));
    }
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions)) as any;
    }
    
    query = query.orderBy(desc(posts.createdAt)) as any;
    
    if (params.limit) {
      query = query.limit(params.limit) as any;
    }
    
    if (params.offset) {
      query = query.offset(params.offset) as any;
    }
    
    const postsData = await query;
    
    // Fetch reactions for all posts
    const postIds = postsData.map(p => p.id);
    let reactionsData: Array<{ postId: number; reactionType: string; count: number }> = [];
    
    if (postIds.length > 0) {
      reactionsData = await db
        .select({
          postId: reactions.postId,
          reactionType: reactions.reactionType,
          count: sql<number>`count(*)::int`
        })
        .from(reactions)
        .where(inArray(reactions.postId, postIds))
        .groupBy(reactions.postId, reactions.reactionType);
    }
    
    // Build reactions map: { postId: { reactionType: count } }
    const reactionsMap = new Map<number, Record<string, number>>();
    for (const row of reactionsData) {
      if (!reactionsMap.has(row.postId)) {
        reactionsMap.set(row.postId, {});
      }
      reactionsMap.get(row.postId)![row.reactionType] = row.count;
    }
    
    // Transform isSaved to boolean and add reactions object
    return postsData.map(post => ({
      ...post,
      isSaved: !!post.isSaved,
      reactions: reactionsMap.get(post.id) || {},
    })) as any;
  }

  async updatePost(id: number, data: Partial<SelectPost>): Promise<SelectPost | undefined> {
    const result = await db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return result[0];
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async likePost(postId: number, userId: number): Promise<SelectPostLike | undefined> {
    try {
      const result = await db.insert(postLikes).values({ postId, userId }).returning();
      await db.update(posts).set({ likes: sql`${posts.likes} + 1` }).where(eq(posts.id, postId));
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    await db.update(posts).set({ likes: sql`GREATEST(${posts.likes} - 1, 0)` }).where(eq(posts.id, postId));
  }

  async isPostLikedByUser(postId: number, userId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
      .limit(1);
    return result.length > 0;
  }

  async savePost(postId: number, userId: number): Promise<void> {
    try {
      await db.insert(savedPosts).values({ postId, userId });
    } catch (error) {
      // Ignore duplicate saves
    }
  }

  async unsavePost(postId: number, userId: number): Promise<void> {
    await db.delete(savedPosts).where(and(eq(savedPosts.postId, postId), eq(savedPosts.userId, userId)));
  }

  async reportPost(report: { contentType: string; contentId: number; reporterId: number; reason: string; details: string | null }): Promise<void> {
    await db.insert(moderationQueue).values(report);
  }

  async createPostComment(comment: InsertPostComment): Promise<SelectPostComment> {
    const result = await db.insert(postComments).values(comment).returning();
    await db.update(posts).set({ comments: sql`${posts.comments} + 1` }).where(eq(posts.id, comment.postId));
    return result[0];
  }

  async getPostComments(postId: number): Promise<SelectPostComment[]> {
    return await db.select().from(postComments).where(eq(postComments.postId, postId)).orderBy(asc(postComments.createdAt));
  }

  async followUser(followerId: number, followingId: number): Promise<SelectFollow | undefined> {
    try {
      const result = await db.insert(follows).values({ followerId, followingId }).returning();
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowers(userId: number): Promise<SelectFollow[]> {
    return await db.select().from(follows).where(eq(follows.followingId, userId));
  }

  async getFollowing(userId: number): Promise<SelectFollow[]> {
    return await db.select().from(follows).where(eq(follows.followerId, userId));
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);
    return result.length > 0;
  }

  async getUserFriends(userId: number): Promise<any[]> {
    const friendshipsData = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        profileImage: users.profileImage,
        bio: users.bio,
        city: users.city,
        closenessScore: friendships.closenessScore,
        connectionDegree: friendships.connectionDegree,
        lastInteractionAt: friendships.lastInteractionAt,
      })
      .from(friendships)
      .leftJoin(users, eq(friendships.friendId, users.id))
      .where(eq(friendships.userId, userId));
    
    return friendshipsData;
  }

  async getFriendRequests(userId: number): Promise<any[]> {
    const pending = await db
      .select({
        id: friendRequests.id,
        senderId: friendRequests.senderId,
        receiverId: friendRequests.receiverId,
        senderMessage: friendRequests.senderMessage,
        receiverMessage: friendRequests.receiverMessage,
        didWeDance: friendRequests.didWeDance,
        danceLocation: friendRequests.danceLocation,
        danceStory: friendRequests.danceStory,
        mediaUrls: friendRequests.mediaUrls,
        status: friendRequests.status,
        createdAt: friendRequests.createdAt,
        respondedAt: friendRequests.respondedAt,
        senderName: users.name,
        senderUsername: users.username,
        senderEmail: users.email,
        senderProfileImage: users.profileImage,
        senderBio: users.bio,
        senderCity: users.city,
      })
      .from(friendRequests)
      .leftJoin(users, eq(friendRequests.senderId, users.id))
      .where(
        and(
          eq(friendRequests.receiverId, userId),
          eq(friendRequests.status, 'pending')
        )
      );
    
    return pending.map(row => ({
      id: row.id,
      senderId: row.senderId,
      receiverId: row.receiverId,
      senderMessage: row.senderMessage,
      receiverMessage: row.receiverMessage,
      didWeDance: row.didWeDance,
      danceLocation: row.danceLocation,
      danceStory: row.danceStory,
      mediaUrls: row.mediaUrls,
      status: row.status,
      createdAt: row.createdAt,
      respondedAt: row.respondedAt,
      sender: {
        id: row.senderId,
        name: row.senderName,
        username: row.senderUsername,
        email: row.senderEmail,
        profileImage: row.senderProfileImage,
        bio: row.senderBio,
        city: row.senderCity,
      }
    }));
  }

  async getFriendSuggestions(userId: number): Promise<any[]> {
    const myFriends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(eq(friendships.userId, userId));
    const friendIds = myFriends.map(f => f.friendId);
    
    if (friendIds.length === 0) {
      const rawUsers = await db.select().from(users).where(ne(users.id, userId)).limit(10);
      
      const suggestions = rawUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        profileImage: u.profileImage,
        bio: u.bio,
        city: u.city,
      }));
      return suggestions;
    }
    
    const rawSuggestions = await db.select()
      .from(users)
      .where(
        and(
          notInArray(users.id, friendIds),
          ne(users.id, userId)
        )
      )
      .limit(10);
    
    const suggestions = rawSuggestions.map((u: any) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      profileImage: u.profileImage,
      bio: u.bio,
      city: u.city,
    }));
    
    return suggestions;
  }

  async sendFriendRequest(data: any): Promise<any> {
    try {
      const result = await db.insert(friendRequests).values({
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderMessage: data.senderMessage || 'Hi! Let\'s connect!',
        senderPrivateNote: data.senderPrivateNote,
        didWeDance: data.didWeDance || false,
        danceLocation: data.danceLocation,
        danceEventId: data.danceEventId,
        danceStory: data.danceStory,
        mediaUrls: data.mediaUrls,
        status: 'pending',
      }).returning();
      return result[0];
    } catch (error) {
      throw new Error('Friend request already exists');
    }
  }

  async acceptFriendRequest(requestId: number): Promise<void> {
    const request = await db.select({
      id: friendRequests.id,
      senderId: friendRequests.senderId,
      receiverId: friendRequests.receiverId,
      didWeDance: friendRequests.didWeDance,
    }).from(friendRequests).where(eq(friendRequests.id, requestId)).limit(1);
    if (!request[0]) throw new Error('Request not found');
    
    const { senderId, receiverId, didWeDance } = request[0];
    const initialScore = didWeDance ? 80 : 75;
    
    await db.update(friendRequests)
      .set({ 
        status: 'accepted', 
        respondedAt: new Date()
      })
      .where(eq(friendRequests.id, requestId));
    
    await db.insert(friendships).values([
      { userId: senderId, friendId: receiverId, closenessScore: initialScore },
      { userId: receiverId, friendId: senderId, closenessScore: initialScore },
    ]);
  }

  async declineFriendRequest(requestId: number): Promise<void> {
    await db
      .update(friendRequests)
      .set({ status: 'declined', respondedAt: new Date() })
      .where(eq(friendRequests.id, requestId));
  }

  async snoozeFriendRequest(requestId: number, days: number): Promise<void> {
    const snoozedUntil = new Date();
    snoozedUntil.setDate(snoozedUntil.getDate() + days);
    
    await db.update(friendRequests)
      .set({ 
        status: 'snoozed',
        snoozedUntil,
      })
      .where(eq(friendRequests.id, requestId));
  }

  async getMutualFriends(userId1: number, userId2: number): Promise<any[]> {
    const user1Friends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(eq(friendships.userId, userId1));
    
    const user2Friends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(eq(friendships.userId, userId2));
    
    const user1FriendIds = user1Friends.map(f => f.friendId);
    const user2FriendIds = user2Friends.map(f => f.friendId);
    const mutualIds = user1FriendIds.filter(id => user2FriendIds.includes(id));
    
    if (mutualIds.length === 0) return [];
    
    const rawMutuals = await db.select().from(users).where(inArray(users.id, mutualIds));
    
    return rawMutuals.map((u: any) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      profileImage: u.profileImage,
      bio: u.bio,
      city: u.city,
    }));
  }

  async calculateClosenessScore(friendshipId: number): Promise<number> {
    const friendship = await db.select({
      id: friendships.id,
      userId: friendships.userId,
      friendId: friendships.friendId,
      closenessScore: friendships.closenessScore,
      connectionDegree: friendships.connectionDegree,
      lastInteractionAt: friendships.lastInteractionAt,
      createdAt: friendships.createdAt,
      updatedAt: friendships.updatedAt,
    }).from(friendships).where(eq(friendships.id, friendshipId)).limit(1);
    if (!friendship[0]) return 0;
    
    let score = 75;
    
    const activities = await db.select({
      id: friendshipActivities.id,
      friendshipId: friendshipActivities.friendshipId,
      activityType: friendshipActivities.activityType,
      metadata: friendshipActivities.metadata,
      createdAt: friendshipActivities.createdAt,
    })
      .from(friendshipActivities)
      .where(eq(friendshipActivities.friendshipId, friendshipId));
    
    const eventCount = activities.filter(a => a.activityType === 'event_attended_together').length;
    const messageCount = activities.filter(a => a.activityType === 'message_sent').length;
    const danceCount = activities.filter(a => a.activityType === 'dance_together').length;
    
    score += Math.min(eventCount * 5, 25);
    score += Math.min(messageCount, 10);
    score += Math.min(danceCount * 10, 20);
    
    const daysSinceInteraction = friendship[0].lastInteractionAt 
      ? Math.floor((Date.now() - new Date(friendship[0].lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (daysSinceInteraction > 90) score -= 15;
    else if (daysSinceInteraction > 30) score -= 5;
    
    score = Math.max(0, Math.min(100, score));
    
    await db.update(friendships)
      .set({ closenessScore: score })
      .where(eq(friendships.id, friendshipId));
    
    return score;
  }

  async getConnectionDegree(userId1: number, userId2: number): Promise<number | null> {
    if (userId1 === userId2) return 0;
    
    const directFriendship = await db.select({ id: friendships.id })
      .from(friendships)
      .where(and(eq(friendships.userId, userId1), eq(friendships.friendId, userId2)))
      .limit(1);
    if (directFriendship.length > 0) return 1;
    
    const user1Friends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(eq(friendships.userId, userId1));
    const user1FriendIds = user1Friends.map(f => f.friendId);
    
    if (user1FriendIds.length === 0) return -1;
    
    const secondDegree = await db.select({ id: friendships.id })
      .from(friendships)
      .where(
        and(
          inArray(friendships.userId, user1FriendIds),
          eq(friendships.friendId, userId2)
        )
      )
      .limit(1);
    if (secondDegree.length > 0) return 2;
    
    const secondDegreeFriends = await db.select({ friendId: friendships.friendId })
      .from(friendships)
      .where(inArray(friendships.userId, user1FriendIds));
    const secondDegreeIds = secondDegreeFriends.map(f => f.friendId);
    
    if (secondDegreeIds.length === 0) return -1;
    
    const thirdDegree = await db.select({ id: friendships.id })
      .from(friendships)
      .where(
        and(
          inArray(friendships.userId, secondDegreeIds),
          eq(friendships.friendId, userId2)
        )
      )
      .limit(1);
    if (thirdDegree.length > 0) return 3;
    
    return null;
  }

  async logFriendshipActivity(friendshipId: number, activityType: string, metadata?: any): Promise<void> {
    await db.insert(friendshipActivities).values({
      friendshipId,
      activityType,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
    
    await db.update(friendships)
      .set({ lastInteractionAt: new Date() })
      .where(eq(friendships.id, friendshipId));
  }

  async checkFriendship(userId1: number, userId2: number): Promise<boolean> {
    const friendship = await db
      .select({ id: friendships.id })
      .from(friendships)
      .where(
        or(
          and(
            eq(friendships.userId, userId1),
            eq(friendships.friendId, userId2),
            eq(friendships.status, 'active')
          ),
          and(
            eq(friendships.userId, userId2),
            eq(friendships.friendId, userId1),
            eq(friendships.status, 'active')
          )
        )
      )
      .limit(1);
    
    return friendship.length > 0;
  }

  async removeFriend(userId: number, friendId: number): Promise<void> {
    await db.delete(friendships).where(
      or(
        and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
        and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
      )
    );
    await db.delete(friendRequests).where(
      or(
        and(eq(friendRequests.senderId, userId), eq(friendRequests.receiverId, friendId)),
        and(eq(friendRequests.senderId, friendId), eq(friendRequests.receiverId, userId))
      )
    );
  }

  async getFriendshipStats(userId: number, friendId: number): Promise<{
    daysSinceFriendship: number;
    closenessScore: number;
    sharedEvents: number;
    sharedGroups: number;
    lastInteraction: string | null;
  } | null> {
    // Get friendship record (bidirectional, either userId-friendId or friendId-userId)
    const friendship = await db.select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
          and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
        )
      )
      .limit(1);

    if (friendship.length === 0) {
      return null;
    }

    const friendshipData = friendship[0];
    
    // Calculate days since friendship
    const createdAt = new Date(friendshipData.createdAt);
    const now = new Date();
    const daysSinceFriendship = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Get shared events (events both users RSVPed to)
    const userEvents = await db.select({ eventId: eventRsvps.eventId })
      .from(eventRsvps)
      .where(eq(eventRsvps.userId, userId));
    
    const friendEvents = await db.select({ eventId: eventRsvps.eventId })
      .from(eventRsvps)
      .where(eq(eventRsvps.userId, friendId));
    
    const userEventIds = userEvents.map(e => e.eventId);
    const friendEventIds = friendEvents.map(e => e.eventId);
    const sharedEventIds = userEventIds.filter(id => friendEventIds.includes(id));

    // Get shared groups (groups both users are members of)
    const userGroups = await db.select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));
    
    const friendGroups = await db.select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, friendId));
    
    const userGroupIds = userGroups.map(g => g.groupId);
    const friendGroupIds = friendGroups.map(g => g.groupId);
    const sharedGroupIds = userGroupIds.filter(id => friendGroupIds.includes(id));

    return {
      daysSinceFriendship,
      closenessScore: friendshipData.closenessScore || 0,
      sharedEvents: sharedEventIds.length,
      sharedGroups: sharedGroupIds.length,
      lastInteraction: friendshipData.lastInteractionAt ? friendshipData.lastInteractionAt.toISOString() : null,
    };
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, notificationId));
  }

  // Communities
  async getCommunityByCity(cityName: string): Promise<any | undefined> {
    const result = await db.select().from(communities).where(eq(communities.cityName, cityName)).limit(1);
    return result[0];
  }

  async createCommunity(data: { name: string; cityName: string; country: string; description?: string }): Promise<any> {
    const result = await db.insert(communities).values(data).returning();
    return result[0];
  }

  async getCommunityMembership(communityId: number, userId: number): Promise<any | undefined> {
    const result = await db.select().from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)))
      .limit(1);
    return result[0];
  }

  async joinCommunity(communityId: number, userId: number): Promise<any> {
    const result = await db.insert(communityMembers).values({ communityId, userId }).returning();
    return result[0];
  }

  // Workshops
  async createWorkshop(workshop: any): Promise<any> {
    const result = await db.insert(workshops).values(workshop).returning();
    return result[0];
  }

  async getWorkshops(params: { limit?: number; offset?: number }): Promise<any[]> {
    return await db.select().from(workshops).limit(params.limit || 10).offset(params.offset || 0);
  }

  async getWorkshopById(id: number): Promise<any | undefined> {
    const result = await db.select().from(workshops).where(eq(workshops.id, id)).limit(1);
    return result[0];
  }

  async updateWorkshop(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(workshops).set(data).where(eq(workshops.id, id)).returning();
    return result[0];
  }

  async deleteWorkshop(id: number): Promise<void> {
    await db.delete(workshops).where(eq(workshops.id, id));
  }

  // Reviews
  async createReview(review: any): Promise<any> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getReviews(params: { targetType?: string; targetId?: number; userId?: number; limit?: number; offset?: number }): Promise<any[]> {
    let conditions = [];
    if (params.targetType) conditions.push(eq(reviews.targetType, params.targetType));
    if (params.targetId) conditions.push(eq(reviews.targetId, params.targetId));
    if (params.userId) conditions.push(eq(reviews.userId, params.userId));
    
    return await db
      .select()
      .from(reviews)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async updateReview(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning();
    return result[0];
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // Live Streams
  async createLiveStream(stream: any): Promise<any> {
    const result = await db.insert(liveStreams).values(stream).returning();
    return result[0];
  }

  async getLiveStreams(params: { isLive?: boolean; limit?: number }): Promise<any[]> {
    let query = db.select().from(liveStreams);
    if (params.isLive !== undefined) {
      query = query.where(eq(liveStreams.isLive, params.isLive)) as any;
    }
    return await query.limit(params.limit || 10);
  }

  async getLiveStreamById(id: number): Promise<any | undefined> {
    const result = await db.select().from(liveStreams).where(eq(liveStreams.id, id)).limit(1);
    return result[0];
  }

  async updateLiveStream(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(liveStreams).set(data).where(eq(liveStreams.id, id)).returning();
    return result[0];
  }

  async deleteLiveStream(id: number): Promise<void> {
    await db.delete(liveStreams).where(eq(liveStreams.id, id));
  }

  // Media Gallery
  async createMedia(mediaItem: any): Promise<any> {
    const result = await db.insert(media).values(mediaItem).returning();
    return result[0];
  }

  async getUserMedia(userId: number, params: { type?: string; limit?: number; offset?: number }): Promise<any[]> {
    let conditions = [eq(media.userId, userId)];
    if (params.type) conditions.push(eq(media.type, params.type));
    
    return await db
      .select()
      .from(media)
      .where(and(...conditions))
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async getMediaById(id: number): Promise<any | undefined> {
    const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
    return result[0];
  }

  async updateMedia(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(media).set(data).where(eq(media.id, id)).returning();
    return result[0];
  }

  async deleteMedia(id: number): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  // Activity Logs
  async createActivityLog(log: any): Promise<any> {
    const result = await db.insert(activityLogs).values(log).returning();
    return result[0];
  }

  async getUserActivityLogs(userId: number, params: { limit?: number; offset?: number }): Promise<any[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(params.limit || 20)
      .offset(params.offset || 0);
  }

  // Blocked Users
  async blockUser(userId: number, blockedUserId: number): Promise<any> {
    try {
      const result = await db.insert(blockedUsers).values({ userId, blockedUserId }).returning();
      return result[0];
    } catch (error) {
      throw new Error('User already blocked');
    }
  }

  async unblockUser(userId: number, blockedUserId: number): Promise<void> {
    await db.delete(blockedUsers).where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)));
  }

  async getBlockedUsers(userId: number): Promise<any[]> {
    return await db.select().from(blockedUsers).where(eq(blockedUsers.userId, userId));
  }

  async isUserBlocked(userId: number, blockedUserId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(blockedUsers)
      .where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)))
      .limit(1);
    return result.length > 0;
  }

  // Blocked Content
  async blockContent(userId: number, contentType: string, contentId: number, reason?: string): Promise<any> {
    const result = await db.insert(blockedContent).values({ userId, contentType, contentId, reason }).returning();
    return result[0];
  }

  async unblockContent(userId: number, contentType: string, contentId: number): Promise<void> {
    await db
      .delete(blockedContent)
      .where(and(eq(blockedContent.userId, userId), eq(blockedContent.contentType, contentType), eq(blockedContent.contentId, contentId)));
  }

  async getBlockedContent(userId: number): Promise<any[]> {
    return await db.select().from(blockedContent).where(eq(blockedContent.userId, userId));
  }

  // Teachers
  async createTeacher(teacher: any): Promise<any> {
    const result = await db.insert(teachers).values(teacher).returning();
    return result[0];
  }

  async getTeachers(params: { verified?: boolean; limit?: number; offset?: number }): Promise<any[]> {
    let query = db.select().from(teachers);
    if (params.verified !== undefined) {
      query = query.where(eq(teachers.verified, params.verified)) as any;
    }
    return await query.limit(params.limit || 10).offset(params.offset || 0);
  }

  async getTeacherById(id: number): Promise<any | undefined> {
    const result = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    return result[0];
  }

  async getTeacherByUserId(userId: number): Promise<any | undefined> {
    const result = await db.select().from(teachers).where(eq(teachers.userId, userId)).limit(1);
    return result[0];
  }

  async updateTeacher(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(teachers).set(data).where(eq(teachers.id, id)).returning();
    return result[0];
  }

  async deleteTeacher(id: number): Promise<void> {
    await db.delete(teachers).where(eq(teachers.id, id));
  }

  // Venues
  async createVenue(venue: any): Promise<any> {
    const result = await db.insert(venues).values(venue).returning();
    return result[0];
  }

  async getVenues(params: { city?: string; verified?: boolean; limit?: number; offset?: number }): Promise<any[]> {
    let conditions = [];
    if (params.city) conditions.push(eq(venues.city, params.city));
    if (params.verified !== undefined) conditions.push(eq(venues.verified, params.verified));
    
    return await db
      .select()
      .from(venues)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async getVenueById(id: number): Promise<any | undefined> {
    const result = await db.select().from(venues).where(eq(venues.id, id)).limit(1);
    return result[0];
  }

  async updateVenue(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(venues).set(data).where(eq(venues.id, id)).returning();
    return result[0];
  }

  async deleteVenue(id: number): Promise<void> {
    await db.delete(venues).where(eq(venues.id, id));
  }

  // Tutorials
  async createTutorial(tutorial: any): Promise<any> {
    const result = await db.insert(tutorials).values(tutorial).returning();
    return result[0];
  }

  async getTutorials(params: { level?: string; limit?: number; offset?: number }): Promise<any[]> {
    let query = db.select().from(tutorials);
    if (params.level) {
      query = query.where(eq(tutorials.level, params.level)) as any;
    }
    return await query.limit(params.limit || 10).offset(params.offset || 0);
  }

  async getTutorialById(id: number): Promise<any | undefined> {
    const result = await db.select().from(tutorials).where(eq(tutorials.id, id)).limit(1);
    return result[0];
  }

  async updateTutorial(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(tutorials).set(data).where(eq(tutorials.id, id)).returning();
    return result[0];
  }

  async deleteTutorial(id: number): Promise<void> {
    await db.delete(tutorials).where(eq(tutorials.id, id));
  }

  // Blog Posts
  async createBlogPost(post: any): Promise<any> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  async getBlogPosts(params: { published?: boolean; authorId?: number; limit?: number; offset?: number }): Promise<any[]> {
    let conditions = [];
    if (params.published !== undefined) conditions.push(eq(blogPosts.published, params.published));
    if (params.authorId) conditions.push(eq(blogPosts.authorId, params.authorId));
    
    return await db
      .select()
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt))
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async getBlogPostById(id: number): Promise<any | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return result[0];
  }

  async getBlogPostBySlug(slug: string): Promise<any | undefined> {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return result[0];
  }

  async updateBlogPost(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning();
    return result[0];
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Newsletter Subscriptions
  async createNewsletterSubscription(subscription: any): Promise<any> {
    const result = await db.insert(newsletterSubscriptions).values(subscription).returning();
    return result[0];
  }

  async getNewsletterSubscriptions(params: { subscribed?: boolean }): Promise<any[]> {
    let query = db.select().from(newsletterSubscriptions);
    if (params.subscribed !== undefined) {
      query = query.where(eq(newsletterSubscriptions.subscribed, params.subscribed)) as any;
    }
    return await query;
  }

  async updateNewsletterSubscription(email: string, data: any): Promise<any | undefined> {
    const result = await db.update(newsletterSubscriptions).set(data).where(eq(newsletterSubscriptions.email, email)).returning();
    return result[0];
  }

  async deleteNewsletterSubscription(email: string): Promise<void> {
    await db.delete(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, email));
  }

  // Bookings
  async createBooking(booking: any): Promise<any> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }

  async getBookingById(id: number): Promise<any | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result[0];
  }

  async getBookingByConfirmation(confirmationNumber: string): Promise<any | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.confirmationNumber, confirmationNumber)).limit(1);
    return result[0];
  }

  async getUserBookings(userId: number, params: { status?: string }): Promise<any[]> {
    let conditions = [eq(bookings.userId, userId)];
    if (params.status) conditions.push(eq(bookings.status, params.status));
    
    return await db
      .select()
      .from(bookings)
      .where(and(...conditions))
      .orderBy(desc(bookings.createdAt));
  }

  async updateBooking(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(bookings).set(data).where(eq(bookings.id, id)).returning();
    return result[0];
  }

  async deleteBooking(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  // Talent Match - Volunteers
  async createVolunteer(volunteer: any): Promise<any> {
    const result = await db.insert(volunteers).values(volunteer).returning();
    return result[0];
  }

  async getVolunteerById(id: number): Promise<any | undefined> {
    const result = await db.select().from(volunteers).where(eq(volunteers.id, id)).limit(1);
    return result[0];
  }

  async getVolunteerByUserId(userId: number): Promise<any | undefined> {
    const result = await db.select().from(volunteers).where(eq(volunteers.userId, userId)).limit(1);
    return result[0];
  }

  // Talent Match - Resumes
  async createResume(resume: any): Promise<any> {
    const result = await db.insert(resumes).values(resume).returning();
    return result[0];
  }

  async getResumeByVolunteerId(volunteerId: number): Promise<any | undefined> {
    const result = await db.select().from(resumes).where(eq(resumes.volunteerId, volunteerId)).limit(1);
    return result[0];
  }

  // Talent Match - Clarifier Sessions
  async createClarifierSession(session: any): Promise<any> {
    const result = await db.insert(clarifierSessions).values(session).returning();
    return result[0];
  }

  async getClarifierSessionById(id: number): Promise<any | undefined> {
    const result = await db.select().from(clarifierSessions).where(eq(clarifierSessions.id, id)).limit(1);
    return result[0];
  }

  async updateClarifierSession(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(clarifierSessions).set(data).where(eq(clarifierSessions.id, id)).returning();
    return result[0];
  }

  // Talent Match - Tasks
  async createTask(task: any): Promise<any> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async getAllTasks(): Promise<any[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTaskById(id: number): Promise<any | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  // Talent Match - Assignments
  async createAssignment(assignment: any): Promise<any> {
    const result = await db.insert(assignments).values(assignment).returning();
    return result[0];
  }

  async getAssignmentsByVolunteerId(volunteerId: number): Promise<any[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.volunteerId, volunteerId))
      .orderBy(desc(assignments.createdAt));
  }

  async getPendingAssignments(): Promise<any[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.status, 'pending'))
      .orderBy(desc(assignments.createdAt));
  }

  async updateAssignment(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(assignments).set(data).where(eq(assignments.id, id)).returning();
    return result[0];
  }

  async createEvent(event: InsertEvent): Promise<SelectEvent> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async getEventById(id: number): Promise<SelectEvent | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getEvents(params: { city?: string; eventType?: string; startDate?: Date; endDate?: Date; search?: string; limit?: number; offset?: number }): Promise<SelectEvent[]> {
    console.log('[STORAGE.getEvents] params=', JSON.stringify(params));
    let conditions = [];
    
    if (params.city) {
      conditions.push(eq(events.city, params.city));
    }
    
    if (params.eventType) {
      conditions.push(eq(events.eventType, params.eventType));
    }
    
    if (params.startDate) {
      conditions.push(gte(events.startDate, params.startDate));
    }
    
    if (params.endDate) {
      conditions.push(lte(events.startDate, params.endDate));
    }
    
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      console.log('[STORAGE.getEvents] APPLYING SEARCH FILTER:', searchTerm);
      conditions.push(
        or(
          ilike(events.title, searchTerm),
          ilike(events.description, searchTerm),
          ilike(events.city, searchTerm),
          ilike(events.location, searchTerm)
        )
      );
    }
    
    let query = db.select().from(events);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    query = query.orderBy(asc(events.startDate)) as any;
    
    if (params.limit) {
      query = query.limit(params.limit) as any;
    }
    
    if (params.offset) {
      query = query.offset(params.offset) as any;
    }
    
    return await query;
  }

  async updateEvent(id: number, data: Partial<SelectEvent>): Promise<SelectEvent | undefined> {
    const result = await db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return result[0];
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async createEventRsvp(rsvp: InsertEventRsvp): Promise<SelectEventRsvp | undefined> {
    try {
      const result = await db.insert(eventRsvps).values(rsvp).returning();
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async getEventRsvps(eventId: number): Promise<SelectEventRsvp[]> {
    return await db.select().from(eventRsvps).where(eq(eventRsvps.eventId, eventId));
  }

  async getUserEventRsvp(eventId: number, userId: number): Promise<SelectEventRsvp | undefined> {
    const result = await db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .limit(1);
    return result[0];
  }

  async getUserRsvps(userId: number): Promise<SelectEventRsvp[]> {
    return await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.userId, userId));
  }

  async updateEventRsvp(eventId: number, userId: number, status: string): Promise<SelectEventRsvp | undefined> {
    const result = await db
      .update(eventRsvps)
      .set({ status })
      .where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId)))
      .returning();
    return result[0];
  }

  async createGroup(group: InsertGroup): Promise<SelectGroup> {
    const result = await db.insert(groups).values(group).returning();
    return result[0];
  }

  async getGroupById(id: number): Promise<SelectGroup | undefined> {
    const result = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    return result[0];
  }

  async getGroupBySlug(slug: string): Promise<SelectGroup | undefined> {
    const result = await db.select().from(groups).where(eq(groups.slug, slug)).limit(1);
    return result[0];
  }

  async getGroups(params: { search?: string; limit?: number; offset?: number }): Promise<SelectGroup[]> {
    let query = db.select().from(groups);
    
    if (params.search) {
      query = query.where(or(ilike(groups.name, `%${params.search}%`), ilike(groups.description, `%${params.search}%`))) as any;
    }
    
    query = query.orderBy(desc(groups.createdAt)) as any;
    
    if (params.limit) {
      query = query.limit(params.limit) as any;
    }
    
    if (params.offset) {
      query = query.offset(params.offset) as any;
    }
    
    return await query;
  }

  async updateGroup(id: number, data: Partial<SelectGroup>): Promise<SelectGroup | undefined> {
    const result = await db
      .update(groups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return result[0];
  }

  async deleteGroup(id: number): Promise<void> {
    await db.delete(groups).where(eq(groups.id, id));
  }

  async joinGroup(groupId: number, userId: number): Promise<SelectGroupMember | undefined> {
    try {
      const isMember = await this.isGroupMember(groupId, userId);
      if (isMember) {
        return undefined;
      }
      
      const result = await db.insert(groupMembers).values({ groupId, userId }).returning();
      await db.update(groups).set({ memberCount: sql`${groups.memberCount} + 1` }).where(eq(groups.id, groupId));
      return result[0];
    } catch (error) {
      return undefined;
    }
  }

  async leaveGroup(groupId: number, userId: number): Promise<void> {
    await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    await db.update(groups).set({ memberCount: sql`GREATEST(${groups.memberCount} - 1, 0)` }).where(eq(groups.id, groupId));
  }

  async getGroupMembers(groupId: number): Promise<SelectGroupMember[]> {
    return await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
  }

  async isGroupMember(groupId: number, userId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .limit(1);
    return result.length > 0;
  }

  async getUserConversations(userId: number): Promise<any[]> {
    const userRooms = await db
      .select()
      .from(chatRoomUsers)
      .where(eq(chatRoomUsers.userId, userId));
    
    const roomIds = userRooms.map(r => r.chatRoomId);
    
    if (roomIds.length === 0) {
      return [];
    }
    
    const rooms = await db
      .select()
      .from(chatRooms)
      .where(inArray(chatRooms.id, roomIds))
      .orderBy(desc(chatRooms.lastMessageAt));
    
    return rooms;
  }

  async getOrCreateDirectConversation(userId1: number, userId2: number): Promise<SelectChatRoom> {
    const userRooms1 = await db
      .select()
      .from(chatRoomUsers)
      .where(eq(chatRoomUsers.userId, userId1));
    
    const userRooms2 = await db
      .select()
      .from(chatRoomUsers)
      .where(eq(chatRoomUsers.userId, userId2));
    
    const commonRoomIds = userRooms1
      .map(r => r.chatRoomId)
      .filter(id => userRooms2.some(r => r.chatRoomId === id));
    
    if (commonRoomIds.length > 0) {
      const existingRoom = await db
        .select()
        .from(chatRooms)
        .where(and(eq(chatRooms.id, commonRoomIds[0]), eq(chatRooms.type, "direct")))
        .limit(1);
      
      if (existingRoom[0]) {
        return existingRoom[0];
      }
    }
    
    const newRoom = await db.insert(chatRooms).values({ type: "direct" }).returning();
    await db.insert(chatRoomUsers).values([
      { chatRoomId: newRoom[0].id, userId: userId1 },
      { chatRoomId: newRoom[0].id, userId: userId2 }
    ]);
    
    return newRoom[0];
  }

  async getChatRoomMessages(chatRoomId: number, limit?: number, offset?: number): Promise<SelectChatMessage[]> {
    let query = db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatRoomId, chatRoomId))
      .orderBy(desc(chatMessages.createdAt));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    if (offset) {
      query = query.offset(offset) as any;
    }
    
    return await query;
  }

  async sendMessage(message: InsertChatMessage): Promise<SelectChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    await db
      .update(chatRooms)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatRooms.id, message.chatRoomId));
    return result[0];
  }

  async markConversationAsRead(chatRoomId: number, userId: number): Promise<void> {
    await db
      .update(chatRoomUsers)
      .set({ lastReadAt: new Date() })
      .where(and(eq(chatRoomUsers.chatRoomId, chatRoomId), eq(chatRoomUsers.userId, userId)));
  }

  async createNotification(notification: InsertNotification): Promise<SelectNotification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async getUserNotifications(userId: number, limit?: number): Promise<SelectNotification[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  // Platform Independence: Deployments
  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const result = await db.insert(deployments).values(deployment).returning();
    return result[0];
  }

  async getDeploymentById(id: number): Promise<Deployment | undefined> {
    const result = await db.select().from(deployments).where(eq(deployments.id, id)).limit(1);
    return result[0];
  }

  async getDeployments(params: { userId: number; type?: string; status?: string; limit?: number; offset?: number }): Promise<Deployment[]> {
    const conditions = [eq(deployments.userId, params.userId)];
    
    if (params.type) {
      conditions.push(eq(deployments.type, params.type));
    }
    if (params.status) {
      conditions.push(eq(deployments.status, params.status));
    }
    
    let query = db.select().from(deployments).where(and(...conditions)).orderBy(desc(deployments.createdAt));
    
    if (params.limit) {
      query = query.limit(params.limit) as any;
    }
    if (params.offset) {
      query = query.offset(params.offset) as any;
    }
    
    return await query;
  }

  async updateDeployment(id: number, data: Partial<Deployment>): Promise<Deployment | undefined> {
    const result = await db
      .update(deployments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(deployments.id, id))
      .returning();
    return result[0];
  }

  async deleteDeployment(id: number): Promise<void> {
    await db.delete(deployments).where(eq(deployments.id, id));
  }

  async getDeploymentByVercelId(vercelDeploymentId: string): Promise<Deployment | undefined> {
    const result = await db.select().from(deployments).where(eq(deployments.vercelDeploymentId, vercelDeploymentId)).limit(1);
    return result[0];
  }

  async getDeploymentByRailwayId(railwayDeploymentId: string): Promise<Deployment | undefined> {
    const result = await db.select().from(deployments).where(eq(deployments.railwayDeploymentId, railwayDeploymentId)).limit(1);
    return result[0];
  }

  // Platform Independence: Platform Integrations
  async createPlatformIntegration(integration: InsertPlatformIntegration): Promise<PlatformIntegration> {
    const result = await db.insert(platformIntegrations).values(integration).returning();
    return result[0];
  }

  async getPlatformIntegration(userId: number, platform: string): Promise<PlatformIntegration | undefined> {
    const result = await db
      .select()
      .from(platformIntegrations)
      .where(and(eq(platformIntegrations.userId, userId), eq(platformIntegrations.platform, platform)))
      .limit(1);
    return result[0];
  }

  async updatePlatformIntegration(id: number, data: Partial<PlatformIntegration>): Promise<PlatformIntegration | undefined> {
    const result = await db
      .update(platformIntegrations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(platformIntegrations.id, id))
      .returning();
    return result[0];
  }

  async deletePlatformIntegration(id: number): Promise<void> {
    await db.delete(platformIntegrations).where(eq(platformIntegrations.id, id));
  }

  // Platform Independence: Environment Variables
  async createEnvironmentVariable(envVar: InsertEnvironmentVariable): Promise<EnvironmentVariable> {
    const result = await db.insert(environmentVariables).values(envVar).returning();
    return result[0];
  }

  async getEnvironmentVariableById(id: number): Promise<EnvironmentVariable | undefined> {
    const result = await db.select().from(environmentVariables).where(eq(environmentVariables.id, id)).limit(1);
    return result[0];
  }

  async getEnvironmentVariables(params: { userId: number; environment?: string }): Promise<EnvironmentVariable[]> {
    const conditions = [eq(environmentVariables.userId, params.userId)];
    
    if (params.environment) {
      conditions.push(eq(environmentVariables.environment, params.environment));
    }
    
    return await db
      .select()
      .from(environmentVariables)
      .where(and(...conditions))
      .orderBy(asc(environmentVariables.key));
  }

  async updateEnvironmentVariable(id: number, data: Partial<EnvironmentVariable>): Promise<EnvironmentVariable | undefined> {
    const result = await db
      .update(environmentVariables)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(environmentVariables.id, id))
      .returning();
    return result[0];
  }

  async deleteEnvironmentVariable(id: number): Promise<void> {
    await db.delete(environmentVariables).where(eq(environmentVariables.id, id));
  }

  // Platform Independence: Preview Deployments
  async createPreviewDeployment(preview: InsertPreviewDeployment): Promise<PreviewDeployment> {
    const result = await db.insert(previewDeployments).values(preview).returning();
    return result[0];
  }

  async getPreviewDeploymentById(id: number): Promise<PreviewDeployment | undefined> {
    const result = await db.select().from(previewDeployments).where(eq(previewDeployments.id, id)).limit(1);
    return result[0];
  }

  async getPreviewDeployments(params: { userId: number; status?: string }): Promise<PreviewDeployment[]> {
    const conditions = [eq(previewDeployments.userId, params.userId)];
    if (params.status) {
      conditions.push(eq(previewDeployments.status, params.status));
    }
    return await db.select().from(previewDeployments).where(and(...conditions)).orderBy(desc(previewDeployments.createdAt));
  }

  async updatePreviewDeployment(id: number, data: Partial<PreviewDeployment>): Promise<PreviewDeployment | undefined> {
    const result = await db
      .update(previewDeployments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(previewDeployments.id, id))
      .returning();
    return result[0];
  }

  async deletePreviewDeployment(id: number): Promise<void> {
    await db.delete(previewDeployments).where(eq(previewDeployments.id, id));
  }

  async expirePreviewDeployment(id: number): Promise<void> {
    await db
      .update(previewDeployments)
      .set({ status: 'expired', expiredAt: new Date(), updatedAt: new Date() })
      .where(eq(previewDeployments.id, id));
  }

  async getExpiredPreviews(): Promise<PreviewDeployment[]> {
    return await db
      .select()
      .from(previewDeployments)
      .where(and(
        eq(previewDeployments.status, 'active'),
        lt(previewDeployments.expiresAt, new Date())
      ));
  }

  // TIER 2.1: Custom Domains
  async createCustomDomain(domain: any): Promise<any> {
    const result = await db.insert(customDomains).values(domain).returning();
    return result[0];
  }

  async getCustomDomains(userId: number): Promise<any[]> {
    return await db.select().from(customDomains).where(eq(customDomains.userId, userId)).orderBy(desc(customDomains.createdAt));
  }

  async updateCustomDomain(id: number, userId: number, data: any): Promise<any | null> {
    const result = await db.update(customDomains).set({ ...data, updatedAt: new Date() }).where(and(eq(customDomains.id, id), eq(customDomains.userId, userId))).returning();
    return result[0] || null;
  }

  async deleteCustomDomain(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(customDomains).where(and(eq(customDomains.id, id), eq(customDomains.userId, userId))).returning();
    return result.length > 0;
  }

  // TIER 2.2: Analytics Events
  async createAnalyticsEvent(event: any): Promise<any> {
    const result = await db.insert(analyticsEvents).values(event).returning();
    return result[0];
  }

  async getAnalyticsEvents(params: { userId: number; eventType?: string; limit?: number }): Promise<any[]> {
    const conditions = [eq(analyticsEvents.userId, params.userId)];
    if (params.eventType) conditions.push(eq(analyticsEvents.eventType, params.eventType));
    
    let query = db.select().from(analyticsEvents).where(and(...conditions)) as any;
    query = query.orderBy(desc(analyticsEvents.timestamp)) as any;
    if (params.limit) query = query.limit(params.limit) as any;
    
    return await query;
  }

  async getAnalyticsSummary(userId: number, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.userId, userId),
        gte(analyticsEvents.timestamp, startDate)
      ));
    
    return {
      totalEvents: events.length,
      eventsByType: events.reduce((acc: any, e: any) => {
        acc[e.eventType] = (acc[e.eventType] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  // TIER 2.3: Team Members
  async createTeamMember(member: any): Promise<any> {
    const result = await db.insert(teamMembers).values(member).returning();
    return result[0];
  }

  async getTeamMembers(ownerId: number): Promise<any[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.ownerId, ownerId)).orderBy(desc(teamMembers.createdAt));
  }

  async updateTeamMember(id: number, ownerId: number, data: any): Promise<any | null> {
    const result = await db.update(teamMembers).set({ ...data, updatedAt: new Date() }).where(and(eq(teamMembers.id, id), eq(teamMembers.ownerId, ownerId))).returning();
    return result[0] || null;
  }

  async deleteTeamMember(id: number, ownerId: number): Promise<boolean> {
    const result = await db.delete(teamMembers).where(and(eq(teamMembers.id, id), eq(teamMembers.ownerId, ownerId))).returning();
    return result.length > 0;
  }

  // TIER 3.1: Cost Tracking
  async createCostRecord(cost: any): Promise<any> {
    const result = await db.insert(costRecords).values(cost).returning();
    return result[0];
  }

  async getCostRecords(params: { userId: number; platform?: string; startDate?: Date; endDate?: Date }): Promise<any[]> {
    const conditions = [eq(costRecords.userId, params.userId)];
    if (params.platform) conditions.push(eq(costRecords.platform, params.platform));
    if (params.startDate) conditions.push(gte(costRecords.billingPeriodStart, params.startDate));
    if (params.endDate) conditions.push(lte(costRecords.billingPeriodEnd, params.endDate));
    
    return await db.select().from(costRecords).where(and(...conditions)).orderBy(desc(costRecords.billingPeriodStart));
  }

  async getCostSummary(userId: number, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const costs = await db
      .select()
      .from(costRecords)
      .where(and(
        eq(costRecords.userId, userId),
        gte(costRecords.billingPeriodStart, startDate)
      ));
    
    const totalCost = costs.reduce((sum: number, c: any) => sum + c.amount, 0);
    const byPlatform = costs.reduce((acc: any, c: any) => {
      acc[c.platform] = (acc[c.platform] || 0) + c.amount;
      return acc;
    }, {});
    
    return { totalCost, byPlatform, costRecords: costs };
  }

  // TIER 3.2: Database Backups
  async createDatabaseBackup(backup: any): Promise<any> {
    const result = await db.insert(databaseBackups).values(backup).returning();
    return result[0];
  }

  async getDatabaseBackups(userId: number): Promise<any[]> {
    return await db.select().from(databaseBackups).where(eq(databaseBackups.userId, userId)).orderBy(desc(databaseBackups.createdAt));
  }

  async updateDatabaseBackup(id: number, userId: number, data: any): Promise<any | null> {
    const result = await db.update(databaseBackups).set(data).where(and(eq(databaseBackups.id, id), eq(databaseBackups.userId, userId))).returning();
    return result[0] || null;
  }

  async deleteDatabaseBackup(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(databaseBackups).where(and(eq(databaseBackups.id, id), eq(databaseBackups.userId, userId))).returning();
    return result.length > 0;
  }

  // TIER 4: CI/CD Pipelines
  async createCicdPipeline(pipeline: any): Promise<any> {
    const result = await db.insert(cicdPipelines).values(pipeline).returning();
    return result[0];
  }

  async getCicdPipelines(userId: number): Promise<any[]> {
    return await db.select().from(cicdPipelines).where(eq(cicdPipelines.userId, userId)).orderBy(desc(cicdPipelines.createdAt));
  }

  async updateCicdPipeline(id: number, userId: number, data: any): Promise<any | null> {
    const result = await db.update(cicdPipelines).set({ ...data, updatedAt: new Date() }).where(and(eq(cicdPipelines.id, id), eq(cicdPipelines.userId, userId))).returning();
    return result[0] || null;
  }

  async deleteCicdPipeline(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(cicdPipelines).where(and(eq(cicdPipelines.id, id), eq(cicdPipelines.userId, userId))).returning();
    return result.length > 0;
  }

  async createCicdRun(run: any): Promise<any> {
    const result = await db.insert(cicdRuns).values(run).returning();
    return result[0];
  }

  async getCicdRuns(pipelineId: number): Promise<any[]> {
    return await db.select().from(cicdRuns).where(eq(cicdRuns.pipelineId, pipelineId)).orderBy(desc(cicdRuns.createdAt));
  }

  async updateCicdRun(id: number, userId: number, data: any): Promise<any | null> {
    const result = await db.update(cicdRuns).set(data).where(and(eq(cicdRuns.id, id), eq(cicdRuns.userId, userId))).returning();
    return result[0] || null;
  }

  // Search implementation
  async search(query: string, userId: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results: any[] = [];

    // Search users
    const userResults = await db.select({
      id: users.id,
      type: sql<string>`'user'`,
      title: users.username,
      subtitle: users.email,
      image: users.profileImage,
      url: sql<string>`'/profile/' || ${users.id}`,
    }).from(users).where(
      or(
        ilike(users.username, lowerQuery),
        ilike(users.email, lowerQuery),
        ilike(users.name, lowerQuery)
      )
    ).limit(5);
    results.push(...userResults);

    // Search posts
    const postResults = await db.select({
      id: posts.id,
      type: sql<string>`'post'`,
      title: posts.content,
      subtitle: users.username,
      image: users.profileImage,
      url: sql<string>`'/feed#post-' || ${posts.id}`,
    }).from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(ilike(posts.content, lowerQuery))
      .limit(5);
    results.push(...postResults);

    // Search events
    const eventResults = await db.select({
      id: events.id,
      type: sql<string>`'event'`,
      title: events.title,
      subtitle: events.location,
      image: events.imageUrl,
      url: sql<string>`'/events/' || ${events.id}`,
    }).from(events)
      .where(
        or(
          ilike(events.title, lowerQuery),
          ilike(events.description, lowerQuery),
          ilike(events.location, lowerQuery)
        )
      )
      .limit(5);
    results.push(...eventResults);

    // Search groups
    const groupResults = await db.select({
      id: groups.id,
      type: sql<string>`'group'`,
      title: groups.name,
      subtitle: groups.description,
      image: groups.imageUrl,
      url: sql<string>`'/groups/' || ${groups.id}`,
    }).from(groups)
      .where(
        or(
          ilike(groups.name, lowerQuery),
          ilike(groups.description, lowerQuery)
        )
      )
      .limit(5);
    results.push(...groupResults);

    return results;
  }

  // Admin stats implementation
  async getAdminStats(): Promise<any> {
    const [totalUsersResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [activeUsersResult] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
    const [totalPostsResult] = await db.select({ count: sql<number>`count(*)` }).from(posts);
    const [totalEventsResult] = await db.select({ count: sql<number>`count(*)` }).from(events);
    const [pendingReportsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, 'pending'));
    const [resolvedReportsResult] = await db.select({ count: sql<number>`count(*)` })
      .from(moderationQueue)
      .where(eq(moderationQueue.status, 'resolved'));

    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      totalPosts: totalPostsResult.count,
      totalEvents: totalEventsResult.count,
      pendingReports: pendingReportsResult.count,
      resolvedReports: resolvedReportsResult.count,
      userGrowth: 12.5,
      engagementRate: 67.3,
    };
  }

  // Moderation queue implementation
  async getModerationQueue(): Promise<any[]> {
    const queue = await db.select({
      id: moderationQueue.id,
      type: moderationQueue.contentType,
      reportedBy: users.username,
      reason: moderationQueue.reason,
      status: moderationQueue.status,
      createdAt: moderationQueue.createdAt,
      contentPreview: moderationQueue.details,
    })
    .from(moderationQueue)
    .leftJoin(users, eq(moderationQueue.reporterId, users.id))
    .where(eq(moderationQueue.status, 'pending'))
    .orderBy(desc(moderationQueue.createdAt))
    .limit(20);

    return queue.map((item) => ({
      ...item,
      createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
      contentPreview: item.contentPreview || 'No preview available',
    }));
  }

  // Recent admin activity implementation  
  async getRecentAdminActivity(): Promise<any[]> {
    const activities = await db.select({
      id: activityLogs.id,
      userId: activityLogs.userId,
      type: activityLogs.type,
      user: users.username,
      text: activityLogs.text,
      time: activityLogs.time,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(15);

    return activities.map((activity) => ({
      ...activity,
      timestamp: activity.time || new Date().toISOString(),
      action: activity.text || `performed ${activity.type}`,
    }));
  }

  // @mentions search implementations
  async searchUsers(query: string, limit: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      bio: users.bio,
      profileImage: users.profileImage,
    })
    .from(users)
    .where(
      or(
        ilike(users.username, lowerQuery),
        ilike(users.name, lowerQuery),
        ilike(users.email, lowerQuery)
      )
    )
    .limit(limit);
    
    return results;
  }

  async searchEventsSimple(query: string, limit: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results = await db.select({
      id: events.id,
      title: events.title,
      city: events.city,
      startDate: events.startDate,
    })
    .from(events)
    .where(
      or(
        ilike(events.title, lowerQuery),
        ilike(events.description, lowerQuery),
        ilike(events.city, lowerQuery)
      )
    )
    .limit(limit);
    
    return results;
  }

  async searchGroups(query: string, limit: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results = await db.execute(sql`
      SELECT 
        id,
        name,
        image_url as avatar,
        type as category,
        member_count as "memberCount"
      FROM groups
      WHERE 
        name ILIKE ${lowerQuery} OR
        description ILIKE ${lowerQuery} OR
        type ILIKE ${lowerQuery}
      LIMIT ${limit}
    `);
    
    return results.rows || [];
  }

  async searchCommunities(query: string, limit: number): Promise<any[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const results = await db.select({
      id: communities.id,
      name: communities.name,
      cityName: communities.cityName,
      coverPhotoUrl: communities.coverPhotoUrl,
      memberCount: communities.memberCount,
    })
    .from(communities)
    .where(
      or(
        ilike(communities.name, lowerQuery),
        ilike(communities.cityName, lowerQuery),
        ilike(communities.description, lowerQuery)
      )
    )
    .limit(limit);
    
    return results;
  }

  async getCommunityById(id: number): Promise<any | undefined> {
    const result = await db.select().from(communities).where(eq(communities.id, id)).limit(1);
    return result[0];
  }

  // ========================================================================
  // LIFE CEO SYSTEM METHODS
  // ========================================================================

  async getAllLifeCeoDomains(): Promise<any[]> {
    return await db.select().from(lifeCeoDomains);
  }

  async getLifeCeoGoalsByUser(userId: number): Promise<any[]> {
    return await db.select()
      .from(lifeCeoGoals)
      .where(eq(lifeCeoGoals.userId, userId))
      .orderBy(desc(lifeCeoGoals.createdAt));
  }

  async createLifeCeoGoal(goal: any): Promise<any> {
    const result = await db.insert(lifeCeoGoals).values(goal).returning();
    return result[0];
  }

  async updateLifeCeoGoal(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(lifeCeoGoals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lifeCeoGoals.id, id))
      .returning();
    return result[0];
  }

  async getLifeCeoTasksByUser(userId: number): Promise<any[]> {
    return await db.select()
      .from(lifeCeoTasks)
      .where(eq(lifeCeoTasks.userId, userId))
      .orderBy(asc(lifeCeoTasks.dueDate));
  }

  async createLifeCeoTask(task: any): Promise<any> {
    const result = await db.insert(lifeCeoTasks).values(task).returning();
    return result[0];
  }

  async updateLifeCeoTask(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(lifeCeoTasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lifeCeoTasks.id, id))
      .returning();
    return result[0];
  }

  async getLifeCeoRecommendationsByUser(userId: number): Promise<any[]> {
    return await db.select()
      .from(lifeCeoRecommendations)
      .where(
        and(
          eq(lifeCeoRecommendations.userId, userId),
          eq(lifeCeoRecommendations.status, 'pending')
        )
      )
      .orderBy(desc(lifeCeoRecommendations.createdAt));
  }

  // ========================================================================
  // TRACK 7: MEMORIES METHODS
  // ========================================================================

  async createMemory(memory: InsertMemory): Promise<SelectMemory> {
    const result = await db.insert(memories).values(memory).returning();
    return result[0];
  }

  async getMemoryById(id: number): Promise<SelectMemory | undefined> {
    const result = await db.select().from(memories).where(eq(memories.id, id)).limit(1);
    return result[0];
  }

  async getUserMemories(userId: number, params?: { type?: string; limit?: number; offset?: number }): Promise<SelectMemory[]> {
    const { type, limit = 50, offset = 0 } = params || {};
    
    let query = db.select().from(memories).where(eq(memories.userId, userId));
    
    if (type) {
      query = query.where(and(eq(memories.userId, userId), eq(memories.type, type)));
    }
    
    const result = await query
      .orderBy(desc(memories.date))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  async updateMemory(id: number, data: Partial<SelectMemory>): Promise<SelectMemory | undefined> {
    const result = await db
      .update(memories)
      .set(data)
      .where(eq(memories.id, id))
      .returning();
    return result[0];
  }

  async deleteMemory(id: number): Promise<void> {
    await db.delete(memories).where(eq(memories.id, id));
  }

  // ========================================================================
  // TRACK 7: RECOMMENDATIONS METHODS
  // ========================================================================

  async createRecommendation(recommendation: InsertRecommendation): Promise<SelectRecommendation> {
    const result = await db.insert(recommendations).values(recommendation).returning();
    return result[0];
  }

  async getUserRecommendations(userId: number, params?: { targetType?: string; status?: string; limit?: number }): Promise<SelectRecommendation[]> {
    const { targetType, status = 'pending', limit = 20 } = params || {};
    
    let conditions = [eq(recommendations.userId, userId)];
    
    if (status) {
      conditions.push(eq(recommendations.status, status));
    }
    
    if (targetType) {
      conditions.push(eq(recommendations.targetType, targetType));
    }
    
    const result = await db.select()
      .from(recommendations)
      .where(and(...conditions))
      .orderBy(desc(recommendations.score))
      .limit(limit);
    
    return result;
  }

  async updateRecommendationStatus(id: number, status: string): Promise<SelectRecommendation | undefined> {
    const result = await db
      .update(recommendations)
      .set({ status })
      .where(eq(recommendations.id, id))
      .returning();
    return result[0];
  }

  async deleteRecommendation(id: number): Promise<void> {
    await db.delete(recommendations).where(eq(recommendations.id, id));
  }

  // ========================================================================
  // TRACK 7: ROLE INVITATIONS METHODS
  // ========================================================================

  async createRoleInvitation(invitation: InsertRoleInvitation): Promise<SelectRoleInvitation> {
    const result = await db.insert(roleInvitations).values(invitation).returning();
    return result[0];
  }

  async getRoleInvitationById(id: number): Promise<SelectRoleInvitation | undefined> {
    const result = await db.select().from(roleInvitations).where(eq(roleInvitations.id, id)).limit(1);
    return result[0];
  }

  async getUserRoleInvitations(userId: number, params?: { status?: string; role?: string }): Promise<SelectRoleInvitation[]> {
    const { status, role } = params || {};
    
    let conditions = [eq(roleInvitations.inviteeId, userId)];
    
    if (status) {
      conditions.push(eq(roleInvitations.status, status));
    }
    
    if (role) {
      conditions.push(eq(roleInvitations.role, role));
    }
    
    const result = await db.select()
      .from(roleInvitations)
      .where(and(...conditions))
      .orderBy(desc(roleInvitations.createdAt));
    
    return result;
  }

  async updateRoleInvitationStatus(id: number, status: string): Promise<SelectRoleInvitation | undefined> {
    const result = await db
      .update(roleInvitations)
      .set({ status, respondedAt: new Date() })
      .where(eq(roleInvitations.id, id))
      .returning();
    return result[0];
  }

  async deleteRoleInvitation(id: number): Promise<void> {
    await db.delete(roleInvitations).where(eq(roleInvitations.id, id));
  }

  // ========================================================================
  // TRACK 7: FAVORITES METHODS
  // ========================================================================

  async createFavorite(favorite: InsertFavorite): Promise<SelectFavorite> {
    const result = await db.insert(favorites).values(favorite).returning();
    return result[0];
  }

  async getUserFavorites(userId: number, params?: { targetType?: string; limit?: number; offset?: number }): Promise<SelectFavorite[]> {
    const { targetType, limit = 50, offset = 0 } = params || {};
    
    let conditions = [eq(favorites.userId, userId)];
    
    if (targetType) {
      conditions.push(eq(favorites.targetType, targetType));
    }
    
    const result = await db.select()
      .from(favorites)
      .where(and(...conditions))
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  async deleteFavorite(userId: number, targetType: string, targetId: number): Promise<void> {
    await db.delete(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.targetType, targetType),
        eq(favorites.targetId, targetId)
      )
    );
  }

  async isFavorited(userId: number, targetType: string, targetId: number): Promise<boolean> {
    const result = await db.select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.targetType, targetType),
          eq(favorites.targetId, targetId)
        )
      )
      .limit(1);
    
    return result.length > 0;
  }

  // ========================================================================
  // TRACK 7: COMMUNITY STATS METHODS
  // ========================================================================

  async createCommunityStats(stats: InsertCommunityStats): Promise<SelectCommunityStats> {
    const result = await db.insert(communityStats).values(stats).returning();
    return result[0];
  }

  async getCommunityStatsByCity(city: string, country: string): Promise<SelectCommunityStats | undefined> {
    const result = await db.select()
      .from(communityStats)
      .where(
        and(
          eq(communityStats.city, city),
          eq(communityStats.country, country)
        )
      )
      .limit(1);
    
    return result[0];
  }

  async getAllCommunityStats(params?: { limit?: number; offset?: number }): Promise<SelectCommunityStats[]> {
    const { limit = 100, offset = 0 } = params || {};
    
    const result = await db.select()
      .from(communityStats)
      .orderBy(desc(communityStats.memberCount))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  async updateCommunityStats(id: number, data: Partial<SelectCommunityStats>): Promise<SelectCommunityStats | undefined> {
    const result = await db
      .update(communityStats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(communityStats.id, id))
      .returning();
    return result[0];
  }

  // ============================================================================
  // GROUPS - ENHANCED OPERATIONS IMPLEMENTATION
  // ============================================================================

  // Group Invites
  async sendGroupInvite(invite: InsertGroupInvite): Promise<SelectGroupInvite> {
    const result = await db.insert(groupInvites).values(invite).returning();
    return result[0];
  }

  async getGroupInvites(groupId: number): Promise<SelectGroupInvite[]> {
    return await db.select().from(groupInvites).where(eq(groupInvites.groupId, groupId));
  }

  async getUserGroupInvites(userId: number): Promise<SelectGroupInvite[]> {
    return await db
      .select()
      .from(groupInvites)
      .where(
        and(
          eq(groupInvites.inviteeId, userId),
          eq(groupInvites.status, 'pending')
        )
      )
      .orderBy(desc(groupInvites.sentAt));
  }

  async acceptGroupInvite(inviteId: number): Promise<void> {
    const invite = await db.select().from(groupInvites).where(eq(groupInvites.id, inviteId)).limit(1);
    if (invite[0]) {
      await db.insert(groupMembers).values({
        groupId: invite[0].groupId,
        userId: invite[0].inviteeId,
        role: 'member',
        joinedVia: 'invite',
        invitedBy: invite[0].inviterId,
      });
      await db
        .update(groupInvites)
        .set({ status: 'accepted', respondedAt: new Date() })
        .where(eq(groupInvites.id, inviteId));
      
      await db
        .update(groups)
        .set({ memberCount: sql`${groups.memberCount} + 1` })
        .where(eq(groups.id, invite[0].groupId));
    }
  }

  async declineGroupInvite(inviteId: number): Promise<void> {
    await db
      .update(groupInvites)
      .set({ status: 'declined', respondedAt: new Date() })
      .where(eq(groupInvites.id, inviteId));
  }

  // Group Posts
  async createGroupPost(post: InsertGroupPost): Promise<SelectGroupPost> {
    const result = await db.insert(groupPosts).values({
      ...post,
      publishedAt: new Date(),
    }).returning();
    
    await db
      .update(groups)
      .set({ 
        postCount: sql`${groups.postCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(groups.id, post.groupId));
    
    return result[0];
  }

  async getGroupPosts(groupId: number, params: { limit?: number; offset?: number }): Promise<SelectGroupPost[]> {
    const { limit = 20, offset = 0 } = params;
    
    return await db
      .select()
      .from(groupPosts)
      .where(
        and(
          eq(groupPosts.groupId, groupId),
          eq(groupPosts.isApproved, true)
        )
      )
      .orderBy(desc(groupPosts.isPinned), desc(groupPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getGroupPostById(id: number): Promise<SelectGroupPost | undefined> {
    const result = await db.select().from(groupPosts).where(eq(groupPosts.id, id)).limit(1);
    return result[0];
  }

  async updateGroupPost(id: number, data: Partial<SelectGroupPost>): Promise<SelectGroupPost | undefined> {
    const result = await db
      .update(groupPosts)
      .set({ ...data, editedAt: new Date() })
      .where(eq(groupPosts.id, id))
      .returning();
    return result[0];
  }

  async deleteGroupPost(id: number): Promise<void> {
    const post = await db.select().from(groupPosts).where(eq(groupPosts.id, id)).limit(1);
    if (post[0]) {
      await db.delete(groupPosts).where(eq(groupPosts.id, id));
      await db
        .update(groups)
        .set({ postCount: sql`${groups.postCount} - 1` })
        .where(eq(groups.id, post[0].groupId));
    }
  }

  async pinGroupPost(postId: number): Promise<void> {
    await db.update(groupPosts).set({ isPinned: true }).where(eq(groupPosts.id, postId));
  }

  async unpinGroupPost(postId: number): Promise<void> {
    await db.update(groupPosts).set({ isPinned: false }).where(eq(groupPosts.id, postId));
  }

  async approveGroupPost(postId: number, approverId: number): Promise<void> {
    await db
      .update(groupPosts)
      .set({ 
        isApproved: true,
        approvedBy: approverId,
        approvedAt: new Date(),
      })
      .where(eq(groupPosts.id, postId));
  }

  // Group Categories
  async createGroupCategory(category: InsertGroupCategory): Promise<SelectGroupCategory> {
    const result = await db.insert(groupCategories).values(category).returning();
    return result[0];
  }

  async getGroupCategories(): Promise<SelectGroupCategory[]> {
    return await db
      .select()
      .from(groupCategories)
      .where(eq(groupCategories.isActive, true))
      .orderBy(asc(groupCategories.displayOrder), asc(groupCategories.name));
  }

  async assignGroupCategory(groupId: number, categoryId: number): Promise<void> {
    await db.insert(groupCategoryAssignments).values({ groupId, categoryId });
    await db
      .update(groupCategories)
      .set({ groupCount: sql`${groupCategories.groupCount} + 1` })
      .where(eq(groupCategories.id, categoryId));
  }

  async removeGroupCategory(groupId: number, categoryId: number): Promise<void> {
    await db
      .delete(groupCategoryAssignments)
      .where(
        and(
          eq(groupCategoryAssignments.groupId, groupId),
          eq(groupCategoryAssignments.categoryId, categoryId)
        )
      );
    await db
      .update(groupCategories)
      .set({ groupCount: sql`${groupCategories.groupCount} - 1` })
      .where(eq(groupCategories.id, categoryId));
  }

  async getGroupsByCategory(categoryId: number): Promise<SelectGroup[]> {
    const assignments = await db
      .select({ groupId: groupCategoryAssignments.groupId })
      .from(groupCategoryAssignments)
      .where(eq(groupCategoryAssignments.categoryId, categoryId));
    
    const groupIds = assignments.map(a => a.groupId);
    
    if (groupIds.length === 0) return [];
    
    return await db
      .select()
      .from(groups)
      .where(inArray(groups.id, groupIds))
      .orderBy(desc(groups.memberCount));
  }

  // Enhanced Group Membership
  async updateGroupMember(groupId: number, userId: number, data: Partial<SelectGroupMember>): Promise<SelectGroupMember | undefined> {
    const result = await db
      .update(groupMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      )
      .returning();
    return result[0];
  }

  async banGroupMember(groupId: number, userId: number): Promise<void> {
    await db
      .update(groupMembers)
      .set({ status: 'banned' })
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      );
    await db
      .update(groups)
      .set({ memberCount: sql`${groups.memberCount} - 1` })
      .where(eq(groups.id, groupId));
  }

  async getSuggestedGroups(userId: number, limit = 10): Promise<SelectGroup[]> {
    return await db
      .select()
      .from(groups)
      .where(
        and(
          eq(groups.privacy, 'public'),
          ne(groups.joinApprovalRequired, true)
        )
      )
      .orderBy(desc(groups.memberCount), desc(groups.lastActivityAt))
      .limit(limit);
  }

  // ============================================================================
  // EVENTS - ENHANCED OPERATIONS IMPLEMENTATION
  // ============================================================================

  // Event Photos
  async uploadEventPhoto(photo: InsertEventPhoto): Promise<SelectEventPhoto> {
    const result = await db.insert(eventPhotos).values(photo).returning();
    return result[0];
  }

  async getEventPhotos(eventId: number): Promise<SelectEventPhoto[]> {
    return await db
      .select()
      .from(eventPhotos)
      .where(
        and(
          eq(eventPhotos.eventId, eventId),
          eq(eventPhotos.isApproved, true)
        )
      )
      .orderBy(desc(eventPhotos.isFeatured), desc(eventPhotos.createdAt));
  }

  async getEventPhotoById(id: number): Promise<SelectEventPhoto | undefined> {
    const result = await db.select().from(eventPhotos).where(eq(eventPhotos.id, id)).limit(1);
    return result[0];
  }

  async deleteEventPhoto(id: number): Promise<void> {
    await db.delete(eventPhotos).where(eq(eventPhotos.id, id));
  }

  async featureEventPhoto(photoId: number): Promise<void> {
    await db.update(eventPhotos).set({ isFeatured: true }).where(eq(eventPhotos.id, photoId));
  }

  async unfeatureEventPhoto(photoId: number): Promise<void> {
    await db.update(eventPhotos).set({ isFeatured: false }).where(eq(eventPhotos.id, photoId));
  }

  // Event Comments
  async createEventComment(comment: InsertEventComment): Promise<SelectEventComment> {
    const result = await db.insert(eventComments).values(comment).returning();
    return result[0];
  }

  async getEventComments(eventId: number): Promise<SelectEventComment[]> {
    return await db
      .select()
      .from(eventComments)
      .where(
        and(
          eq(eventComments.eventId, eventId),
          eq(eventComments.isDeleted, false)
        )
      )
      .orderBy(asc(eventComments.createdAt));
  }

  async updateEventComment(id: number, content: string): Promise<SelectEventComment | undefined> {
    const result = await db
      .update(eventComments)
      .set({ 
        content,
        isEdited: true,
        updatedAt: new Date(),
      })
      .where(eq(eventComments.id, id))
      .returning();
    return result[0];
  }

  async deleteEventComment(id: number): Promise<void> {
    await db
      .update(eventComments)
      .set({ isDeleted: true })
      .where(eq(eventComments.id, id));
  }

  // Event Reminders
  async createEventReminder(reminder: InsertEventReminder): Promise<SelectEventReminder> {
    const result = await db.insert(eventReminders).values(reminder).returning();
    return result[0];
  }

  async getEventReminders(rsvpId: number): Promise<SelectEventReminder[]> {
    return await db.select().from(eventReminders).where(eq(eventReminders.rsvpId, rsvpId));
  }

  async markReminderSent(reminderId: number): Promise<void> {
    await db
      .update(eventReminders)
      .set({ sentAt: new Date() })
      .where(eq(eventReminders.id, reminderId));
  }

  // Enhanced Event RSVPs
  async checkInEventAttendee(eventId: number, userId: number): Promise<SelectEventRsvp | undefined> {
    const result = await db
      .update(eventRsvps)
      .set({ 
        checkedIn: true,
        checkInTime: new Date(),
      })
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, userId)
        )
      )
      .returning();
    return result[0];
  }

  async addToWaitlist(eventId: number, userId: number, guestCount = 1): Promise<SelectEventRsvp | undefined> {
    const result = await db
      .insert(eventRsvps)
      .values({
        eventId,
        userId,
        status: 'waitlist',
        guestCount,
      })
      .returning();
    return result[0];
  }

  async getEventWaitlist(eventId: number): Promise<SelectEventRsvp[]> {
    return await db
      .select()
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.status, 'waitlist')
        )
      )
      .orderBy(asc(eventRsvps.createdAt));
  }

  async searchEventsAdvanced(params: { 
    query?: string;
    eventType?: string;
    city?: string;
    startDate?: Date;
    endDate?: Date;
    musicStyle?: string;
    limit?: number;
    offset?: number;
  }): Promise<SelectEvent[]> {
    const { query, eventType, city, startDate, endDate, musicStyle, limit = 20, offset = 0 } = params;
    
    let conditions = [eq(events.isPublic, true)];
    
    if (query) {
      conditions.push(
        or(
          ilike(events.title, `%${query}%`),
          ilike(events.description, `%${query}%`)
        ) as any
      );
    }
    
    if (eventType) {
      conditions.push(eq(events.eventType, eventType));
    }
    
    if (city) {
      conditions.push(eq(events.city, city));
    }
    
    if (startDate) {
      conditions.push(gte(events.startDate, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(events.startDate, endDate));
    }
    
    if (musicStyle) {
      conditions.push(eq(events.musicStyle, musicStyle));
    }
    
    return await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(asc(events.startDate))
      .limit(limit)
      .offset(offset);
  }

  // ============================================================================
  // HOUSING SYSTEM (Wave 8D)
  // ============================================================================

  async createHousingListing(listing: InsertHousingListing): Promise<SelectHousingListing> {
    const [result] = await db.insert(housingListings).values(listing).returning();
    return result;
  }

  async getHousingListingById(id: number): Promise<SelectHousingListing | undefined> {
    const result = await db.select().from(housingListings).where(eq(housingListings.id, id)).limit(1);
    return result[0];
  }

  async getHousingListings(params: {
    city?: string;
    country?: string;
    hostId?: number;
    status?: string;
    propertyTypes?: string[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    amenities?: string[];
    friendsOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<SelectHousingListing[]> {
    const {
      city,
      country,
      hostId,
      status = 'active',
      propertyTypes,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities,
      limit = 20,
      offset = 0,
    } = params;

    let conditions: any[] = [eq(housingListings.status, status)];

    if (city) {
      conditions.push(ilike(housingListings.city, `%${city}%`));
    }

    if (country) {
      conditions.push(ilike(housingListings.country, `%${country}%`));
    }

    if (hostId) {
      conditions.push(eq(housingListings.hostId, hostId));
    }

    if (propertyTypes && propertyTypes.length > 0) {
      conditions.push(inArray(housingListings.propertyType, propertyTypes));
    }

    if (minPrice !== undefined) {
      conditions.push(gte(housingListings.pricePerNight, minPrice * 100)); // Convert to cents
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(housingListings.pricePerNight, maxPrice * 100)); // Convert to cents
    }

    if (bedrooms !== undefined && bedrooms > 0) {
      conditions.push(gte(housingListings.bedrooms, bedrooms));
    }

    if (bathrooms !== undefined && bathrooms > 0) {
      conditions.push(gte(housingListings.bathrooms, bathrooms));
    }

    if (maxGuests !== undefined && maxGuests > 0) {
      conditions.push(gte(housingListings.maxGuests, maxGuests));
    }

    // TODO: Implement amenities filtering (requires array overlap check)
    // if (amenities && amenities.length > 0) {
    //   conditions.push(sql`${housingListings.amenities} @> ${amenities}`);
    // }

    return await db
      .select()
      .from(housingListings)
      .where(and(...conditions))
      .orderBy(desc(housingListings.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateHousingListing(id: number, data: Partial<SelectHousingListing>): Promise<SelectHousingListing | undefined> {
    const [result] = await db.update(housingListings).set(data).where(eq(housingListings.id, id)).returning();
    return result;
  }

  async deleteHousingListing(id: number): Promise<void> {
    await db.delete(housingListings).where(eq(housingListings.id, id));
  }

  async createHousingBooking(booking: InsertHousingBooking): Promise<SelectHousingBooking> {
    const [result] = await db.insert(housingBookings).values(booking).returning();
    return result;
  }

  async getHousingBookingById(id: number): Promise<SelectHousingBooking | undefined> {
    const result = await db.select().from(housingBookings).where(eq(housingBookings.id, id)).limit(1);
    return result[0];
  }

  async getHousingBookings(params: {
    listingId?: number;
    guestId?: number;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<SelectHousingBooking[]> {
    const { listingId, guestId, status, limit = 20, offset = 0 } = params;

    let conditions: any[] = [];

    if (listingId) {
      conditions.push(eq(housingBookings.listingId, listingId));
    }

    if (guestId) {
      conditions.push(eq(housingBookings.guestId, guestId));
    }

    if (status) {
      conditions.push(eq(housingBookings.status, status));
    }

    const query = db.select().from(housingBookings);

    if (conditions.length > 0) {
      return await query
        .where(and(...conditions))
        .orderBy(desc(housingBookings.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return await query
      .orderBy(desc(housingBookings.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateHousingBooking(id: number, data: Partial<SelectHousingBooking>): Promise<SelectHousingBooking | undefined> {
    const [result] = await db.update(housingBookings).set(data).where(eq(housingBookings.id, id)).returning();
    return result;
  }

  async deleteHousingBooking(id: number): Promise<void> {
    await db.delete(housingBookings).where(eq(housingBookings.id, id));
  }
  
  // ============================================================================
  // PROFILES - CORE OPERATIONS (BATCH 02-03)
  // ============================================================================
  
  async getUserProfile(userId: number): Promise<SelectUser & { profiles: any } | undefined> {
    const user = await this.getUserById(userId);
    if (!user) return undefined;
    
    const profiles: any = {};
    
    const [teacher, dj, photographer, performer, vendor, musician, choreographer, tangoSchool, tangoHotel, wellness, tourOperator, hostVenue, tangoGuide, contentCreator, learningResource, taxiDancer, organizer, talent] = await Promise.all([
      this.getTeacherProfile(userId),
      this.getDJProfile(userId),
      this.getPhotographerProfile(userId),
      this.getPerformerProfile(userId),
      this.getVendorProfile(userId),
      this.getMusicianProfile(userId),
      this.getChoreographerProfile(userId),
      this.getTangoSchoolProfile(userId),
      this.getTangoHotelProfile(userId),
      this.getWellnessProfile(userId),
      this.getTourOperatorProfile(userId),
      this.getHostVenueProfile(userId),
      this.getTangoGuideProfile(userId),
      this.getContentCreatorProfile(userId),
      this.getLearningResourceProfile(userId),
      this.getTaxiDancerProfile(userId),
      this.getOrganizerProfile(userId),
      this.getTalentProfile(userId),
    ]);
    
    if (teacher) profiles.teacher = teacher;
    if (dj) profiles.dj = dj;
    if (photographer) profiles.photographer = photographer;
    if (performer) profiles.performer = performer;
    if (vendor) profiles.vendor = vendor;
    if (musician) profiles.musician = musician;
    if (choreographer) profiles.choreographer = choreographer;
    if (tangoSchool) profiles.tangoSchool = tangoSchool;
    if (tangoHotel) profiles.tangoHotel = tangoHotel;
    if (wellness) profiles.wellness = wellness;
    if (tourOperator) profiles.tourOperator = tourOperator;
    if (hostVenue) profiles.hostVenue = hostVenue;
    if (tangoGuide) profiles.tangoGuide = tangoGuide;
    if (contentCreator) profiles.contentCreator = contentCreator;
    if (learningResource) profiles.learningResource = learningResource;
    if (taxiDancer) profiles.taxiDancer = taxiDancer;
    if (organizer) profiles.organizer = organizer;
    if (talent) profiles.talent = talent;
    
    return { ...user, profiles };
  }
  
  async updateUserProfile(userId: number, data: Partial<SelectUser>): Promise<SelectUser | undefined> {
    return this.updateUser(userId, data);
  }
  
  async getPublicProfile(userId: number): Promise<any> {
    const fullProfile = await this.getUserProfile(userId);
    if (!fullProfile) return null;
    
    const { password, apiToken, deviceToken, stripeCustomerId, stripeSubscriptionId, ...publicData } = fullProfile;
    return publicData;
  }
  
  async searchProfiles(filters: { 
    query?: string; 
    city?: string; 
    country?: string; 
    role?: string; 
    limit?: number; 
    offset?: number;
  }): Promise<any[]> {
    const { query, city, country, role, limit = 20, offset = 0 } = filters;
    
    let conditions: any[] = [eq(users.isActive, true)];
    
    if (query) {
      conditions.push(
        or(
          ilike(users.name, `%${query}%`),
          ilike(users.username, `%${query}%`),
          ilike(users.bio, `%${query}%`)
        )
      );
    }
    
    if (city) {
      conditions.push(ilike(users.city, `%${city}%`));
    }
    
    if (country) {
      conditions.push(ilike(users.country, `%${country}%`));
    }
    
    if (role && role !== 'user') {
      conditions.push(eq(users.role, role));
    }
    
    return await db
      .select()
      .from(users)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);
  }

  async searchAllProfiles(filters: {
    q?: string;
    types?: string[];
    city?: string;
    country?: string;
    minRating?: number;
    maxPrice?: number;
    verified?: boolean;
    availability?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    results: Array<{
      type: string;
      profile: any;
      user: any;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { q, types, city, country, minRating, maxPrice, verified, availability, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    // Define all 17 profile types
    const allProfileTypes = [
      'teacher', 'dj', 'photographer', 'performer', 'vendor', 'musician',
      'choreographer', 'tangoSchool', 'tangoHotel', 'wellness', 'tourOperator',
      'hostVenue', 'tangoGuide', 'contentCreator', 'learningResource',
      'taxiDancer', 'organizer'
    ];

    // Use specified types or all types
    const searchTypes = types && types.length > 0 ? types : allProfileTypes;

    // Map profile types to table configurations
    const profileTableMap: Record<string, any> = {
      'teacher': { table: teacherProfiles, rateFields: ['privateRate', 'groupRate', 'workshopRate'] },
      'dj': { table: djProfiles, rateFields: ['hourlyRate', 'eventRate'] },
      'photographer': { table: photographerProfiles, rateFields: ['hourlyRate', 'eventRate'] },
      'performer': { table: performerProfiles, rateFields: ['performanceFee'] },
      'vendor': { table: vendorProfiles, rateFields: [] },
      'musician': { table: musicianProfiles, rateFields: ['hourlyRate', 'performanceFee'] },
      'choreographer': { table: choreographerProfiles, rateFields: ['sessionRate', 'choreographyRate'] },
      'tangoSchool': { table: tangoSchoolProfiles, rateFields: [] },
      'tangoHotel': { table: tangoHotelProfiles, rateFields: [] },
      'wellness': { table: wellnessProfiles, rateFields: ['sessionRate'] },
      'tourOperator': { table: tourOperatorProfiles, rateFields: ['dayRate'] },
      'hostVenue': { table: hostVenueProfiles, rateFields: [] },
      'tangoGuide': { table: tangoGuideProfiles, rateFields: ['hourlyRate', 'dayRate'] },
      'contentCreator': { table: contentCreatorProfiles, rateFields: [] },
      'learningResource': { table: learningResourceProfiles, rateFields: [] },
      'taxiDancer': { table: taxiDancerProfiles, rateFields: ['hourlyRate'] },
      'organizer': { table: organizerProfiles, rateFields: ['consultingRate'] },
    };

    // Search each profile type
    const searchPromises = searchTypes.map(async (profileType) => {
      const config = profileTableMap[profileType];
      if (!config) return [];

      const { table } = config;
      const conditions: any[] = [eq(table.isActive, true)];

      // Text search in bio and specialties
      if (q) {
        const searchPattern = `%${q}%`;
        conditions.push(
          or(
            ilike(table.bio, searchPattern),
            table.specialties ? sql`EXISTS (
              SELECT 1 FROM unnest(${table.specialties}) AS spec 
              WHERE spec ILIKE ${searchPattern}
            )` : sql`false`,
            table.specializations ? sql`EXISTS (
              SELECT 1 FROM unnest(${table.specializations}) AS spec 
              WHERE spec ILIKE ${searchPattern}
            )` : sql`false`
          )
        );
      }

      // Location filter
      if (city && table.city) {
        conditions.push(ilike(table.city, `%${city}%`));
      }
      if (country && table.country) {
        conditions.push(ilike(table.country, `%${country}%`));
      }

      // Rating filter
      if (minRating && table.averageRating) {
        conditions.push(gte(table.averageRating, minRating));
      }

      // Verified filter
      if (verified !== undefined && table.isVerified) {
        conditions.push(eq(table.isVerified, verified));
      }

      // Availability filter
      if (availability !== undefined) {
        if (table.availableForPrivate) {
          conditions.push(eq(table.availableForPrivate, availability));
        } else if (table.isAvailable) {
          conditions.push(eq(table.isAvailable, availability));
        }
      }

      // Price filter - check if any rate field is within range
      if (maxPrice && config.rateFields.length > 0) {
        const priceConditions = config.rateFields.map((field: string) => 
          table[field] ? lte(table[field], maxPrice.toString()) : sql`false`
        );
        if (priceConditions.length > 0) {
          conditions.push(or(...priceConditions));
        }
      }

      try {
        const profiles = await db
          .select()
          .from(table)
          .where(and(...conditions))
          .orderBy(desc(table.averageRating || table.id))
          .limit(1000); // Get more than needed for merging

        // Join with user data
        const results = await Promise.all(
          profiles.map(async (profile: any) => {
            const user = await this.getUserById(profile.userId);
            return user ? { type: profileType, profile, user } : null;
          })
        );

        return results.filter(r => r !== null);
      } catch (error) {
        console.error(`[searchAllProfiles] Error searching ${profileType}:`, error);
        return [];
      }
    });

    // Execute all searches in parallel
    const allResults = await Promise.all(searchPromises);
    const mergedResults = allResults.flat();

    // Sort by relevance (rating) and then by recent activity
    mergedResults.sort((a, b) => {
      const ratingA = a.profile.averageRating || 0;
      const ratingB = b.profile.averageRating || 0;
      
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      
      const dateA = a.profile.updatedAt || a.profile.createdAt || new Date(0);
      const dateB = b.profile.updatedAt || b.profile.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    // Paginate results
    const total = mergedResults.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedResults = mergedResults.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total,
      page,
      totalPages,
    };
  }
  
  async trackProfileView(viewerId: number | null, viewedUserId: number, profileType?: string, viewerIp?: string): Promise<void> {
    // Insert into profileViews table
    await db.insert(profileViews).values({
      profileUserId: viewedUserId,
      viewerUserId: viewerId,
      profileType: profileType || null,
      viewerIp: viewerIp || null,
    });
    
    // Also keep the activity log for backward compatibility
    if (viewerId) {
      await this.createActivityLog({
        userId: viewerId,
        action: 'profile_view',
        targetType: 'user',
        targetId: viewedUserId,
        metadata: { viewedAt: new Date().toISOString(), profileType },
      });
    }
  }
  
  async getProfileAnalytics(userId: number): Promise<any> {
    // Get all profile views for this user
    const allViews = await db
      .select()
      .from(profileViews)
      .where(eq(profileViews.profileUserId, userId))
      .orderBy(desc(profileViews.createdAt));
    
    const totalViews = allViews.length;
    const uniqueViewers = new Set(
      allViews
        .filter(v => v.viewerUserId !== null)
        .map(v => v.viewerUserId)
    ).size;
    
    // Calculate views by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentViews = allViews.filter(v => 
      v.createdAt && v.createdAt >= thirtyDaysAgo
    );
    
    // Group views by day
    const viewsByDay: Record<string, number> = {};
    recentViews.forEach(view => {
      if (view.createdAt) {
        const day = view.createdAt.toISOString().split('T')[0];
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      }
    });
    
    const viewsByDayArray = Object.entries(viewsByDay).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate profile completeness (simplified)
    const user = await this.getUserById(userId);
    let completeness = 0;
    if (user) {
      const fields = [
        user.name, user.bio, user.city, user.country, 
        user.profileImage, user.website
      ];
      completeness = (fields.filter(f => f).length / fields.length) * 100;
    }
    
    return {
      totalViews,
      uniqueVisitors: uniqueViewers,
      viewsByDay: viewsByDayArray,
      topReferrers: [], // Placeholder for future implementation
      averageTimeOnProfile: 0, // Placeholder for future implementation
      profileCompleteness: Math.round(completeness),
      searchAppearances: 0, // Placeholder for future implementation
    };
  }
  
  async getProfileInsights(userId: number): Promise<any> {
    // Get all views
    const allViews = await db
      .select()
      .from(profileViews)
      .where(eq(profileViews.profileUserId, userId));
    
    // Calculate views by profile type
    const viewsByType: Record<string, number> = {};
    allViews.forEach(view => {
      if (view.profileType) {
        viewsByType[view.profileType] = (viewsByType[view.profileType] || 0) + 1;
      }
    });
    
    const mostViewedSections = Object.entries(viewsByType)
      .map(([section, count]) => ({ section, count }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate interaction rate (simplified - using follows as proxy)
    const followers = await db
      .select()
      .from(follows)
      .where(eq(follows.followingId, userId));
    
    const interactionRate = allViews.length > 0 
      ? (followers.length / allViews.length) * 100 
      : 0;
    
    // Calculate conversion rate (simplified - using event RSVPs as proxy)
    const userEvents = await db
      .select()
      .from(events)
      .where(eq(events.userId, userId));
    
    const conversionRate = allViews.length > 0 && userEvents.length > 0
      ? ((userEvents.reduce((sum: number, e: any) => sum + (e.currentAttendees || 0), 0)) / allViews.length) * 100
      : 0;
    
    return {
      mostViewedSections,
      interactionRate: Math.round(interactionRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }
  
  // ============================================================================
  // BATCH 02: COMPREHENSIVE PROFILE MANAGEMENT
  // ============================================================================
  
  async getProfile(userId: number, profileType?: string): Promise<any> {
    if (!profileType) {
      return this.getUserProfile(userId);
    }
    
    const profileMap: Record<string, () => Promise<any>> = {
      'teacher': () => this.getTeacherProfile(userId),
      'dj': () => this.getDJProfile(userId),
      'photographer': () => this.getPhotographerProfile(userId),
      'performer': () => this.getPerformerProfile(userId),
      'vendor': () => this.getVendorProfile(userId),
      'musician': () => this.getMusicianProfile(userId),
      'choreographer': () => this.getChoreographerProfile(userId),
      'tangoSchool': () => this.getTangoSchoolProfile(userId),
      'tangoHotel': () => this.getTangoHotelProfile(userId),
      'wellness': () => this.getWellnessProfile(userId),
      'tourOperator': () => this.getTourOperatorProfile(userId),
      'hostVenue': () => this.getHostVenueProfile(userId),
      'tangoGuide': () => this.getTangoGuideProfile(userId),
      'contentCreator': () => this.getContentCreatorProfile(userId),
      'learningResource': () => this.getLearningResourceProfile(userId),
      'taxiDancer': () => this.getTaxiDancerProfile(userId),
      'organizer': () => this.getOrganizerProfile(userId),
      'talent': () => this.getTalentProfile(userId),
    };
    
    const getter = profileMap[profileType];
    if (!getter) {
      throw new Error(`Unknown profile type: ${profileType}`);
    }
    
    return getter();
  }
  
  async updateProfile(userId: number, profileType: string, data: any): Promise<any> {
    const updateMap: Record<string, (data: any) => Promise<any>> = {
      'teacher': (d) => this.updateTeacherProfile(userId, d),
      'dj': (d) => this.updateDJProfile(userId, d),
      'photographer': (d) => this.updatePhotographerProfile(userId, d),
      'performer': (d) => this.updatePerformerProfile(userId, d),
      'vendor': (d) => this.updateVendorProfile(userId, d),
      'musician': (d) => this.updateMusicianProfile(userId, d),
      'choreographer': (d) => this.updateChoreographerProfile(userId, d),
      'tangoSchool': (d) => this.updateTangoSchoolProfile(userId, d),
      'tangoHotel': (d) => this.updateTangoHotelProfile(userId, d),
      'wellness': (d) => this.updateWellnessProfile(userId, d),
      'tourOperator': (d) => this.updateTourOperatorProfile(userId, d),
      'hostVenue': (d) => this.updateHostVenueProfile(userId, d),
      'tangoGuide': (d) => this.updateTangoGuideProfile(userId, d),
      'contentCreator': (d) => this.updateContentCreatorProfile(userId, d),
      'learningResource': (d) => this.updateLearningResourceProfile(userId, d),
      'taxiDancer': (d) => this.updateTaxiDancerProfile(userId, d),
      'organizer': (d) => this.updateOrganizerProfile(userId, d),
      'talent': (d) => this.updateTalentProfile(userId, d),
    };
    
    const updater = updateMap[profileType];
    if (!updater) {
      throw new Error(`Unknown profile type: ${profileType}`);
    }
    
    return updater(data);
  }
  
  async createProfile(userId: number, profileType: string, data: any): Promise<any> {
    const createMap: Record<string, (data: any) => Promise<any>> = {
      'teacher': (d) => this.createTeacherProfile({ userId, ...d }),
      'dj': (d) => this.createDJProfile({ userId, ...d }),
      'photographer': (d) => this.createPhotographerProfile({ userId, ...d }),
      'performer': (d) => this.createPerformerProfile({ userId, ...d }),
      'vendor': (d) => this.createVendorProfile({ userId, ...d }),
      'musician': (d) => this.createMusicianProfile({ userId, ...d }),
      'choreographer': (d) => this.createChoreographerProfile({ userId, ...d }),
      'tangoSchool': (d) => this.createTangoSchoolProfile({ userId, ...d }),
      'tangoHotel': (d) => this.createTangoHotelProfile({ userId, ...d }),
      'wellness': (d) => this.createWellnessProfile({ userId, ...d }),
      'tourOperator': (d) => this.createTourOperatorProfile({ userId, ...d }),
      'hostVenue': (d) => this.createHostVenueProfile({ userId, ...d }),
      'tangoGuide': (d) => this.createTangoGuideProfile({ userId, ...d }),
      'contentCreator': (d) => this.createContentCreatorProfile({ userId, ...d }),
      'learningResource': (d) => this.createLearningResourceProfile({ userId, ...d }),
      'taxiDancer': (d) => this.createTaxiDancerProfile({ userId, ...d }),
      'organizer': (d) => this.createOrganizerProfile({ userId, ...d }),
      'talent': (d) => this.createTalentProfile({ userId, ...d }),
    };
    
    const creator = createMap[profileType];
    if (!creator) {
      throw new Error(`Unknown profile type: ${profileType}`);
    }
    
    return creator(data);
  }
  
  async deleteProfile(userId: number, profileType: string): Promise<boolean> {
    const deleteMap: Record<string, () => Promise<void>> = {
      'teacher': () => this.deleteTeacherProfile(userId),
      'dj': () => this.deleteDJProfile(userId),
      'photographer': () => this.deletePhotographerProfile(userId),
      'performer': () => this.deletePerformerProfile(userId),
      'vendor': () => this.deleteVendorProfile(userId),
      'musician': () => this.deleteMusicianProfile(userId),
      'choreographer': () => this.deleteChoreographerProfile(userId),
      'tangoSchool': () => this.deleteTangoSchoolProfile(userId),
      'tangoHotel': () => this.deleteTangoHotelProfile(userId),
      'wellness': () => this.deleteWellnessProfile(userId),
      'tourOperator': () => this.deleteTourOperatorProfile(userId),
      'hostVenue': () => this.deleteHostVenueProfile(userId),
      'tangoGuide': () => this.deleteTangoGuideProfile(userId),
      'contentCreator': () => this.deleteContentCreatorProfile(userId),
      'learningResource': () => this.deleteLearningResourceProfile(userId),
      'taxiDancer': () => this.deleteTaxiDancerProfile(userId),
      'organizer': () => this.deleteOrganizerProfile(userId),
      'talent': () => this.deleteTalentProfile(userId),
    };
    
    const deleter = deleteMap[profileType];
    if (!deleter) {
      throw new Error(`Unknown profile type: ${profileType}`);
    }
    
    try {
      await deleter();
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async getAllUserProfiles(userId: number): Promise<any> {
    return this.getUserProfile(userId);
  }
  
  async getBusinessProfile(userId: number, businessType: string): Promise<any> {
    const businessMap: Record<string, () => Promise<any>> = {
      'tangoSchool': () => this.getTangoSchoolProfile(userId),
      'tangoHotel': () => this.getTangoHotelProfile(userId),
      'hostVenue': () => this.getHostVenueProfile(userId),
      'venue': () => this.getHostVenueProfile(userId),
    };
    
    const getter = businessMap[businessType];
    if (!getter) {
      throw new Error(`Unknown business type: ${businessType}`);
    }
    
    return getter();
  }
  
  async updateBusinessProfile(userId: number, businessType: string, data: any): Promise<any> {
    const updateMap: Record<string, (data: any) => Promise<any>> = {
      'tangoSchool': (d) => this.updateTangoSchoolProfile(userId, d),
      'tangoHotel': (d) => this.updateTangoHotelProfile(userId, d),
      'hostVenue': (d) => this.updateHostVenueProfile(userId, d),
      'venue': (d) => this.updateHostVenueProfile(userId, d),
    };
    
    const updater = updateMap[businessType];
    if (!updater) {
      throw new Error(`Unknown business type: ${businessType}`);
    }
    
    return updater(data);
  }
  
  async getSpecialtyProfile(userId: number, specialtyType: string): Promise<any> {
    const specialtyMap: Record<string, () => Promise<any>> = {
      'wellness': () => this.getWellnessProfile(userId),
      'tourOperator': () => this.getTourOperatorProfile(userId),
      'tangoGuide': () => this.getTangoGuideProfile(userId),
      'guide': () => this.getTangoGuideProfile(userId),
      'learningResource': () => this.getLearningResourceProfile(userId),
      'contentCreator': () => this.getContentCreatorProfile(userId),
    };
    
    const getter = specialtyMap[specialtyType];
    if (!getter) {
      throw new Error(`Unknown specialty type: ${specialtyType}`);
    }
    
    return getter();
  }
  
  async updateSpecialtyProfile(userId: number, specialtyType: string, data: any): Promise<any> {
    const updateMap: Record<string, (data: any) => Promise<any>> = {
      'wellness': (d) => this.updateWellnessProfile(userId, d),
      'tourOperator': (d) => this.updateTourOperatorProfile(userId, d),
      'tangoGuide': (d) => this.updateTangoGuideProfile(userId, d),
      'guide': (d) => this.updateTangoGuideProfile(userId, d),
      'learningResource': (d) => this.updateLearningResourceProfile(userId, d),
      'contentCreator': (d) => this.updateContentCreatorProfile(userId, d),
    };
    
    const updater = updateMap[specialtyType];
    if (!updater) {
      throw new Error(`Unknown specialty type: ${specialtyType}`);
    }
    
    return updater(data);
  }
  
  async getProfileVisibilitySettings(userId: number): Promise<any> {
    const user = await this.getUserById(userId);
    if (!user) return null;
    
    return {
      userId: user.id,
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showSocialLinks: true,
      allowProfileViews: true,
      allowMessages: true,
      showOnlineStatus: false,
    };
  }
  
  async updateProfileVisibility(userId: number, settings: any): Promise<any> {
    return settings;
  }
  
  async incrementProfileView(userId: number, viewerId: number): Promise<void> {
    if (userId === viewerId) return;
    
    await this.trackProfileView(viewerId, userId);
  }
  
  async getProfileViewStats(userId: number): Promise<any> {
    const logs = await db
      .select()
      .from(activityLogs)
      .where(
        and(
          eq(activityLogs.targetType, 'user'),
          eq(activityLogs.targetId, userId),
          eq(activityLogs.action, 'profile_view')
        )
      )
      .orderBy(desc(activityLogs.createdAt))
      .limit(100);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);
    
    const viewsToday = logs.filter(log => log.createdAt && log.createdAt >= today).length;
    const viewsThisWeek = logs.filter(log => log.createdAt && log.createdAt >= lastWeek).length;
    const viewsThisMonth = logs.filter(log => log.createdAt && log.createdAt >= lastMonth).length;
    
    const uniqueViewers = new Set(logs.map(log => log.userId));
    
    return {
      totalViews: logs.length,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      uniqueViewers: uniqueViewers.size,
      recentViews: logs.slice(0, 10).map(log => ({
        viewerId: log.userId,
        viewedAt: log.createdAt,
      })),
    };
  }
  
  async getPostsCount(params?: { since?: Date }): Promise<number> {
    const { since } = params || {};
    const query = db.select({ count: sql<number>`count(*)::int` }).from(posts);
    
    if (since) {
      const [result] = await query.where(gte(posts.createdAt, since));
      return result?.count || 0;
    }
    
    const [result] = await query;
    return result?.count || 0;
  }
  
  async getActiveUsersCount(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [result] = await db
      .select({ count: sql<number>`count(DISTINCT ${users.id})::int` })
      .from(users)
      .where(and(
        eq(users.isActive, true),
        or(
          gte(users.lastLoginAt, oneDayAgo),
          gte(users.updatedAt, oneDayAgo)
        )
      ));
    return result?.count || 0;
  }
  
  async getUpcomingEventsCount(): Promise<number> {
    const now = new Date();
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(and(
        gte(events.startDate, now),
        eq(events.status, 'published')
      ));
    return result?.count || 0;
  }
  
  async getProfileStats(userId: number): Promise<any> {
    const [followers, following, userPosts, userEvents] = await Promise.all([
      db.select().from(follows).where(eq(follows.followingId, userId)),
      db.select().from(follows).where(eq(follows.followerId, userId)),
      db.select().from(posts).where(eq(posts.userId, userId)),
      db.select().from(events).where(eq(events.userId, userId)),
    ]);
    
    return {
      followersCount: followers.length,
      followingCount: following.length,
      postsCount: userPosts.length,
      eventsCount: userEvents.length,
    };
  }
  
  async getFeaturedProfiles(params: { profileType?: string; limit?: number }): Promise<any[]> {
    const { profileType, limit = 10 } = params;
    
    if (!profileType || profileType === 'all') {
      const allProfiles = await Promise.all([
        db.select().from(teacherProfiles).where(eq(teacherProfiles.isFeatured, true)).limit(Math.floor(limit / 6)),
        db.select().from(djProfiles).where(eq(djProfiles.isFeatured, true)).limit(Math.floor(limit / 6)),
        db.select().from(performerProfiles).where(eq(performerProfiles.isFeatured, true)).limit(Math.floor(limit / 6)),
        db.select().from(photographerProfiles).where(eq(photographerProfiles.isFeatured, true)).limit(Math.floor(limit / 6)),
        db.select().from(vendorProfiles).where(eq(vendorProfiles.isFeatured, true)).limit(Math.floor(limit / 6)),
        db.select().from(musicianProfiles).where(eq(musicianProfiles.isFeatured, true)).limit(Math.floor(limit / 6)),
      ]);
      return allProfiles.flat().slice(0, limit);
    }
    
    const profileTableMap: Record<string, any> = {
      'teacher': teacherProfiles,
      'dj': djProfiles,
      'photographer': photographerProfiles,
      'performer': performerProfiles,
      'vendor': vendorProfiles,
      'musician': musicianProfiles,
      'choreographer': choreographerProfiles,
      'tangoSchool': tangoSchoolProfiles,
      'tangoHotel': tangoHotelProfiles,
      'wellness': wellnessProfiles,
      'tourOperator': tourOperatorProfiles,
      'hostVenue': hostVenueProfiles,
      'tangoGuide': tangoGuideProfiles,
      'contentCreator': contentCreatorProfiles,
      'learningResource': learningResourceProfiles,
      'taxiDancer': taxiDancerProfiles,
      'organizer': organizerProfiles,
    };
    
    const table = profileTableMap[profileType];
    if (!table) {
      return [];
    }
    
    return await db.select()
      .from(table)
      .where(eq(table.isFeatured, true))
      .orderBy(desc(table.averageRating))
      .limit(limit);
  }
  
  async getProfileDirectory(params: {
    profileType: string;
    city?: string;
    country?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ profiles: any[]; total: number }> {
    const { profileType, city, country, limit = 20, offset = 0 } = params;
    
    const profileTableMap: Record<string, any> = {
      'teacher': teacherProfiles,
      'dj': djProfiles,
      'photographer': photographerProfiles,
      'performer': performerProfiles,
      'vendor': vendorProfiles,
      'musician': musicianProfiles,
      'choreographer': choreographerProfiles,
      'tangoSchool': tangoSchoolProfiles,
      'tangoHotel': tangoHotelProfiles,
      'wellness': wellnessProfiles,
      'tourOperator': tourOperatorProfiles,
      'hostVenue': hostVenueProfiles,
      'tangoGuide': tangoGuideProfiles,
      'contentCreator': contentCreatorProfiles,
      'learningResource': learningResourceProfiles,
      'taxiDancer': taxiDancerProfiles,
      'organizer': organizerProfiles,
    };
    
    const table = profileTableMap[profileType];
    if (!table) {
      return { profiles: [], total: 0 };
    }
    
    const conditions: any[] = [eq(table.isActive, true)];
    
    if (city || country) {
      const profilesWithUsers = await db.select()
        .from(table)
        .innerJoin(users, eq(table.userId, users.id))
        .where(and(
          ...conditions,
          city ? sql`LOWER(${users.city}) = LOWER(${city})` : sql`true`,
          country ? sql`LOWER(${users.country}) = LOWER(${country})` : sql`true`
        ))
        .orderBy(desc(table.averageRating))
        .limit(limit)
        .offset(offset);
      
      const profiles = profilesWithUsers.map((row: any) => {
        const tableKey = Object.keys(row).find(key => key.includes('_profiles'));
        return tableKey ? row[tableKey] : row;
      });
      
      return { profiles, total: profiles.length };
    }
    
    const profiles = await db.select()
      .from(table)
      .where(and(...conditions))
      .orderBy(desc(table.averageRating))
      .limit(limit)
      .offset(offset);
    
    return { profiles, total: profiles.length };
  }
  
  async getNearbyProfiles(params: {
    latitude: number;
    longitude: number;
    radius: number;
    profileType?: string;
    limit?: number;
  }): Promise<any[]> {
    const { latitude, longitude, radius, profileType, limit = 20 } = params;
    
    const nearbyUsers = await db.select()
      .from(users)
      .where(and(
        eq(users.isActive, true),
        sql`
          (6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(CAST(${users.city} AS FLOAT))) * 
            cos(radians(CAST(${users.city} AS FLOAT)) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(CAST(${users.city} AS FLOAT)))
          )) <= ${radius}
        `
      ))
      .limit(limit);
    
    if (!profileType) {
      return nearbyUsers;
    }
    
    const userIds = nearbyUsers.map(u => u.id);
    if (userIds.length === 0) return [];
    
    const profileTableMap: Record<string, any> = {
      'teacher': teacherProfiles,
      'dj': djProfiles,
      'photographer': photographerProfiles,
      'performer': performerProfiles,
      'vendor': vendorProfiles,
      'musician': musicianProfiles,
      'choreographer': choreographerProfiles,
      'tangoSchool': tangoSchoolProfiles,
      'tangoHotel': tangoHotelProfiles,
      'wellness': wellnessProfiles,
      'tourOperator': tourOperatorProfiles,
      'hostVenue': hostVenueProfiles,
      'tangoGuide': tangoGuideProfiles,
      'contentCreator': contentCreatorProfiles,
      'learningResource': learningResourceProfiles,
      'taxiDancer': taxiDancerProfiles,
      'organizer': organizerProfiles,
    };
    
    const table = profileTableMap[profileType];
    if (!table) {
      return [];
    }
    
    return await db.select()
      .from(table)
      .where(and(
        inArray(table.userId, userIds),
        eq(table.isActive, true)
      ))
      .orderBy(desc(table.averageRating));
  }
  
  async getRecommendedProfiles(params: {
    userId: number;
    limit?: number;
  }): Promise<any[]> {
    const { userId, limit = 10 } = params;
    
    const user = await this.getUserById(userId);
    if (!user) return [];
    
    const conditions: any[] = [
      eq(users.isActive, true),
      ne(users.id, userId),
    ];
    
    if (user.city) {
      conditions.push(eq(users.city, user.city));
    }
    
    const recommendedUsers = await db.select()
      .from(users)
      .where(and(...conditions))
      .limit(limit);
    
    return recommendedUsers;
  }
  
  async getProfilesByCity(city: string, profileType: string, limit: number = 20): Promise<any[]> {
    const result = await this.getProfileDirectory({
      profileType,
      city,
      limit,
    });
    return result.profiles;
  }
  
  // Teacher Profiles
  async getTeacherProfile(userId: number): Promise<SelectTeacherProfile | null> {
    const result = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createTeacherProfile(data: InsertTeacherProfile): Promise<SelectTeacherProfile> {
    const [result] = await db.insert(teacherProfiles).values(data).returning();
    return result;
  }
  
  async updateTeacherProfile(userId: number, data: Partial<SelectTeacherProfile>): Promise<SelectTeacherProfile | null> {
    const [result] = await db
      .update(teacherProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teacherProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteTeacherProfile(userId: number): Promise<void> {
    await db.delete(teacherProfiles).where(eq(teacherProfiles.userId, userId));
  }
  
  // DJ Profiles
  async getDJProfile(userId: number): Promise<SelectDJProfile | null> {
    const result = await db.select().from(djProfiles).where(eq(djProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createDJProfile(data: InsertDJProfile): Promise<SelectDJProfile> {
    const [result] = await db.insert(djProfiles).values(data).returning();
    return result;
  }
  
  async updateDJProfile(userId: number, data: Partial<SelectDJProfile>): Promise<SelectDJProfile | null> {
    const [result] = await db
      .update(djProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(djProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteDJProfile(userId: number): Promise<void> {
    await db.delete(djProfiles).where(eq(djProfiles.userId, userId));
  }
  
  // Photographer Profiles
  async getPhotographerProfile(userId: number): Promise<SelectPhotographerProfile | null> {
    const result = await db.select().from(photographerProfiles).where(eq(photographerProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createPhotographerProfile(data: InsertPhotographerProfile): Promise<SelectPhotographerProfile> {
    const [result] = await db.insert(photographerProfiles).values(data).returning();
    return result;
  }
  
  async updatePhotographerProfile(userId: number, data: Partial<SelectPhotographerProfile>): Promise<SelectPhotographerProfile | null> {
    const [result] = await db
      .update(photographerProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(photographerProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deletePhotographerProfile(userId: number): Promise<void> {
    await db.delete(photographerProfiles).where(eq(photographerProfiles.userId, userId));
  }
  
  // Performer Profiles
  async getPerformerProfile(userId: number): Promise<SelectPerformerProfile | null> {
    const result = await db.select().from(performerProfiles).where(eq(performerProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createPerformerProfile(data: InsertPerformerProfile): Promise<SelectPerformerProfile> {
    const [result] = await db.insert(performerProfiles).values(data).returning();
    return result;
  }
  
  async updatePerformerProfile(userId: number, data: Partial<SelectPerformerProfile>): Promise<SelectPerformerProfile | null> {
    const [result] = await db
      .update(performerProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(performerProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deletePerformerProfile(userId: number): Promise<void> {
    await db.delete(performerProfiles).where(eq(performerProfiles.userId, userId));
  }
  
  // Vendor Profiles
  async getVendorProfile(userId: number): Promise<SelectVendorProfile | null> {
    const result = await db.select().from(vendorProfiles).where(eq(vendorProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createVendorProfile(data: InsertVendorProfile): Promise<SelectVendorProfile> {
    const [result] = await db.insert(vendorProfiles).values(data).returning();
    return result;
  }
  
  async updateVendorProfile(userId: number, data: Partial<SelectVendorProfile>): Promise<SelectVendorProfile | null> {
    const [result] = await db
      .update(vendorProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vendorProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteVendorProfile(userId: number): Promise<void> {
    await db.delete(vendorProfiles).where(eq(vendorProfiles.userId, userId));
  }
  
  // Musician Profiles
  async getMusicianProfile(userId: number): Promise<SelectMusicianProfile | null> {
    const result = await db.select().from(musicianProfiles).where(eq(musicianProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createMusicianProfile(data: InsertMusicianProfile): Promise<SelectMusicianProfile> {
    const [result] = await db.insert(musicianProfiles).values(data).returning();
    return result;
  }
  
  async updateMusicianProfile(userId: number, data: Partial<SelectMusicianProfile>): Promise<SelectMusicianProfile | null> {
    const [result] = await db
      .update(musicianProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(musicianProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteMusicianProfile(userId: number): Promise<void> {
    await db.delete(musicianProfiles).where(eq(musicianProfiles.userId, userId));
  }
  
  // Choreographer Profiles
  async getChoreographerProfile(userId: number): Promise<SelectChoreographerProfile | null> {
    const result = await db.select().from(choreographerProfiles).where(eq(choreographerProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createChoreographerProfile(data: InsertChoreographerProfile): Promise<SelectChoreographerProfile> {
    const [result] = await db.insert(choreographerProfiles).values(data).returning();
    return result;
  }
  
  async updateChoreographerProfile(userId: number, data: Partial<SelectChoreographerProfile>): Promise<SelectChoreographerProfile | null> {
    const [result] = await db
      .update(choreographerProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(choreographerProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteChoreographerProfile(userId: number): Promise<void> {
    await db.delete(choreographerProfiles).where(eq(choreographerProfiles.userId, userId));
  }
  
  // Tango School Profiles
  async getTangoSchoolProfile(userId: number): Promise<SelectTangoSchoolProfile | null> {
    const result = await db.select().from(tangoSchoolProfiles).where(eq(tangoSchoolProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createTangoSchoolProfile(data: InsertTangoSchoolProfile): Promise<SelectTangoSchoolProfile> {
    const [result] = await db.insert(tangoSchoolProfiles).values(data).returning();
    return result;
  }
  
  async updateTangoSchoolProfile(userId: number, data: Partial<SelectTangoSchoolProfile>): Promise<SelectTangoSchoolProfile | null> {
    const [result] = await db
      .update(tangoSchoolProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tangoSchoolProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteTangoSchoolProfile(userId: number): Promise<void> {
    await db.delete(tangoSchoolProfiles).where(eq(tangoSchoolProfiles.userId, userId));
  }
  
  // Tango Hotel Profiles
  async getTangoHotelProfile(userId: number): Promise<SelectTangoHotelProfile | null> {
    const result = await db.select().from(tangoHotelProfiles).where(eq(tangoHotelProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createTangoHotelProfile(data: InsertTangoHotelProfile): Promise<SelectTangoHotelProfile> {
    const [result] = await db.insert(tangoHotelProfiles).values(data).returning();
    return result;
  }
  
  async updateTangoHotelProfile(userId: number, data: Partial<SelectTangoHotelProfile>): Promise<SelectTangoHotelProfile | null> {
    const [result] = await db
      .update(tangoHotelProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tangoHotelProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteTangoHotelProfile(userId: number): Promise<void> {
    await db.delete(tangoHotelProfiles).where(eq(tangoHotelProfiles.userId, userId));
  }
  
  // Wellness Profiles
  async getWellnessProfile(userId: number): Promise<SelectWellnessProfile | null> {
    const result = await db.select().from(wellnessProfiles).where(eq(wellnessProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createWellnessProfile(data: InsertWellnessProfile): Promise<SelectWellnessProfile> {
    const [result] = await db.insert(wellnessProfiles).values(data).returning();
    return result;
  }
  
  async updateWellnessProfile(userId: number, data: Partial<SelectWellnessProfile>): Promise<SelectWellnessProfile | null> {
    const [result] = await db
      .update(wellnessProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wellnessProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteWellnessProfile(userId: number): Promise<void> {
    await db.delete(wellnessProfiles).where(eq(wellnessProfiles.userId, userId));
  }
  
  // Tour Operator Profiles
  async getTourOperatorProfile(userId: number): Promise<SelectTourOperatorProfile | null> {
    const result = await db.select().from(tourOperatorProfiles).where(eq(tourOperatorProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createTourOperatorProfile(data: InsertTourOperatorProfile): Promise<SelectTourOperatorProfile> {
    const [result] = await db.insert(tourOperatorProfiles).values(data).returning();
    return result;
  }
  
  async updateTourOperatorProfile(userId: number, data: Partial<SelectTourOperatorProfile>): Promise<SelectTourOperatorProfile | null> {
    const [result] = await db
      .update(tourOperatorProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tourOperatorProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteTourOperatorProfile(userId: number): Promise<void> {
    await db.delete(tourOperatorProfiles).where(eq(tourOperatorProfiles.userId, userId));
  }
  
  // Host Venue Profiles
  async getHostVenueProfile(userId: number): Promise<SelectHostVenueProfile | null> {
    const result = await db.select().from(hostVenueProfiles).where(eq(hostVenueProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createHostVenueProfile(data: InsertHostVenueProfile): Promise<SelectHostVenueProfile> {
    const [result] = await db.insert(hostVenueProfiles).values(data).returning();
    return result;
  }
  
  async updateHostVenueProfile(userId: number, data: Partial<SelectHostVenueProfile>): Promise<SelectHostVenueProfile | null> {
    const [result] = await db
      .update(hostVenueProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(hostVenueProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteHostVenueProfile(userId: number): Promise<void> {
    await db.delete(hostVenueProfiles).where(eq(hostVenueProfiles.userId, userId));
  }
  
  // Tango Guide Profiles
  async getTangoGuideProfile(userId: number): Promise<SelectTangoGuideProfile | null> {
    const result = await db.select().from(tangoGuideProfiles).where(eq(tangoGuideProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createTangoGuideProfile(data: InsertTangoGuideProfile): Promise<SelectTangoGuideProfile> {
    const [result] = await db.insert(tangoGuideProfiles).values(data).returning();
    return result;
  }
  
  async updateTangoGuideProfile(userId: number, data: Partial<SelectTangoGuideProfile>): Promise<SelectTangoGuideProfile | null> {
    const [result] = await db
      .update(tangoGuideProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tangoGuideProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteTangoGuideProfile(userId: number): Promise<void> {
    await db.delete(tangoGuideProfiles).where(eq(tangoGuideProfiles.userId, userId));
  }
  
  // Content Creator Profiles
  async getContentCreatorProfile(userId: number): Promise<SelectContentCreatorProfile | null> {
    const result = await db.select().from(contentCreatorProfiles).where(eq(contentCreatorProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createContentCreatorProfile(data: InsertContentCreatorProfile): Promise<SelectContentCreatorProfile> {
    const [result] = await db.insert(contentCreatorProfiles).values(data).returning();
    return result;
  }
  
  async updateContentCreatorProfile(userId: number, data: Partial<SelectContentCreatorProfile>): Promise<SelectContentCreatorProfile | null> {
    const [result] = await db
      .update(contentCreatorProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contentCreatorProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteContentCreatorProfile(userId: number): Promise<void> {
    await db.delete(contentCreatorProfiles).where(eq(contentCreatorProfiles.userId, userId));
  }
  
  // Learning Resource Profiles
  async getLearningResourceProfile(userId: number): Promise<SelectLearningResourceProfile | null> {
    const result = await db.select().from(learningResourceProfiles).where(eq(learningResourceProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createLearningResourceProfile(data: InsertLearningResourceProfile): Promise<SelectLearningResourceProfile> {
    const [result] = await db.insert(learningResourceProfiles).values(data).returning();
    return result;
  }
  
  async updateLearningResourceProfile(userId: number, data: Partial<SelectLearningResourceProfile>): Promise<SelectLearningResourceProfile | null> {
    const [result] = await db
      .update(learningResourceProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(learningResourceProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteLearningResourceProfile(userId: number): Promise<void> {
    await db.delete(learningResourceProfiles).where(eq(learningResourceProfiles.userId, userId));
  }
  
  // Taxi Dancer Profiles
  async getTaxiDancerProfile(userId: number): Promise<SelectTaxiDancerProfile | null> {
    const result = await db.select().from(taxiDancerProfiles).where(eq(taxiDancerProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createTaxiDancerProfile(data: InsertTaxiDancerProfile): Promise<SelectTaxiDancerProfile> {
    const [result] = await db.insert(taxiDancerProfiles).values(data).returning();
    return result;
  }
  
  async updateTaxiDancerProfile(userId: number, data: Partial<SelectTaxiDancerProfile>): Promise<SelectTaxiDancerProfile | null> {
    const [result] = await db
      .update(taxiDancerProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taxiDancerProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteTaxiDancerProfile(userId: number): Promise<void> {
    await db.delete(taxiDancerProfiles).where(eq(taxiDancerProfiles.userId, userId));
  }
  
  // Organizer Profiles
  async getOrganizerProfile(userId: number): Promise<SelectOrganizerProfile | null> {
    const result = await db.select().from(organizerProfiles).where(eq(organizerProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createOrganizerProfile(data: InsertOrganizerProfile): Promise<SelectOrganizerProfile> {
    const [result] = await db.insert(organizerProfiles).values(data).returning();
    return result;
  }
  
  async updateOrganizerProfile(userId: number, data: Partial<SelectOrganizerProfile>): Promise<SelectOrganizerProfile | null> {
    const [result] = await db
      .update(organizerProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizerProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteOrganizerProfile(userId: number): Promise<void> {
    await db.delete(organizerProfiles).where(eq(organizerProfiles.userId, userId));
  }
  
  // BATCH 15: Enhanced Profile Search Methods with Advanced Filtering
  // Helper function for Haversine distance calculation in SQL
  private buildDistanceExpression(lat: number, lng: number) {
    return sql`(
      6371 * acos(
        cos(radians(${lat})) *
        cos(radians(CAST(${users.latitude} AS DOUBLE PRECISION))) *
        cos(radians(CAST(${users.longitude} AS DOUBLE PRECISION)) - radians(${lng})) +
        sin(radians(${lat})) *
        sin(radians(CAST(${users.latitude} AS DOUBLE PRECISION)))
      )
    )`;
  }

  async searchTeacherProfiles(params: { 
    q?: string;
    city?: string; 
    country?: string; 
    lat?: number;
    lng?: number;
    radius?: number;
    minRate?: number;
    maxRate?: number;
    minRating?: number; 
    verified?: boolean;
    specialties?: string[];
    languages?: string[];
    availableDate?: string;
    minExperience?: number;
    sort?: 'rating' | 'price' | 'distance' | 'recent';
    limit?: number; 
    offset?: number;
  }): Promise<{ 
    results: SelectTeacherProfile[]; 
    total: number; 
    facets: Record<string, Record<string, number>> 
  }> {
    const { q, city, country, lat, lng, radius, minRate, maxRate, minRating, verified, specialties, languages, availableDate, minExperience, sort = 'rating', limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(teacherProfiles.isActive, true)];
    
    // Full-text search across bio and specialties
    if (q) {
      conditions.push(
        or(
          sql`LOWER(${teacherProfiles.bio}) LIKE LOWER(${'%' + q + '%'})`,
          sql`EXISTS (SELECT 1 FROM unnest(${teacherProfiles.specialties}) AS s WHERE LOWER(s) LIKE LOWER(${'%' + q + '%'}))`
        )
      );
    }
    
    // Basic filters
    if (city) conditions.push(sql`LOWER(${users.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${users.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(teacherProfiles.averageRating, minRating));
    if (minRate !== undefined) conditions.push(gte(teacherProfiles.hourlyRate, minRate));
    if (maxRate !== undefined) conditions.push(lte(teacherProfiles.hourlyRate, maxRate));
    if (verified !== undefined) conditions.push(eq(teacherProfiles.isVerified, verified));
    if (minExperience !== undefined) conditions.push(gte(teacherProfiles.yearsExperience, minExperience));
    
    // Array filters
    if (specialties && specialties.length > 0) {
      conditions.push(sql`${teacherProfiles.specialties} && ARRAY[${sql.join(specialties.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    if (languages && languages.length > 0) {
      conditions.push(sql`${teacherProfiles.languagesSpoken} && ARRAY[${sql.join(languages.map(l => sql`${l}`), sql`, `)}]::text[]`);
    }
    
    // Geolocation filter
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      const distanceExpr = this.buildDistanceExpression(lat, lng);
      conditions.push(sql`${distanceExpr} <= ${radius}`);
    }
    
    // Build sort expression
    let orderExpr;
    if (sort === 'rating') {
      orderExpr = desc(teacherProfiles.averageRating);
    } else if (sort === 'price') {
      orderExpr = asc(teacherProfiles.hourlyRate);
    } else if (sort === 'distance' && lat !== undefined && lng !== undefined) {
      orderExpr = sql`${this.buildDistanceExpression(lat, lng)} ASC`;
    } else {
      orderExpr = desc(teacherProfiles.createdAt);
    }
    
    // Get results with user join for location data
    const results = await db
      .select({
        profile: teacherProfiles,
        user: users
      })
      .from(teacherProfiles)
      .innerJoin(users, eq(teacherProfiles.userId, users.id))
      .where(and(...conditions))
      .orderBy(orderExpr)
      .limit(limit)
      .offset(offset);
    
    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(teacherProfiles)
      .innerJoin(users, eq(teacherProfiles.userId, users.id))
      .where(and(...conditions));
    
    // Build facets - count by specialty and level
    const specialtyFacets = await db
      .select({
        specialty: sql<string>`unnest(${teacherProfiles.specialties})`,
        count: sql<number>`COUNT(*)::int`
      })
      .from(teacherProfiles)
      .innerJoin(users, eq(teacherProfiles.userId, users.id))
      .where(and(...conditions))
      .groupBy(sql`unnest(${teacherProfiles.specialties})`);
    
    const levelFacets = await db
      .select({
        level: sql<string>`unnest(${teacherProfiles.levels})`,
        count: sql<number>`COUNT(*)::int`
      })
      .from(teacherProfiles)
      .innerJoin(users, eq(teacherProfiles.userId, users.id))
      .where(and(...conditions))
      .groupBy(sql`unnest(${teacherProfiles.levels})`);
    
    const facets = {
      specialties: Object.fromEntries(specialtyFacets.map(f => [f.specialty, f.count])),
      levels: Object.fromEntries(levelFacets.map(f => [f.level, f.count]))
    };
    
    return {
      results: results.map(r => r.profile),
      total: count,
      facets
    };
  }

  async searchDJProfiles(params: { 
    city?: string; 
    country?: string; 
    minRating?: number;
    maxHourlyRate?: number;
    minHourlyRate?: number;
    verified?: boolean;
    musicStyles?: string[];
    minExperience?: number;
    availability?: string;
    limit?: number; 
    offset?: number;
  }): Promise<SelectDJProfile[]> {
    const { city, country, minRating, maxHourlyRate, minHourlyRate, verified, musicStyles, minExperience, availability, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(djProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${djProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${djProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(djProfiles.averageRating, minRating));
    if (maxHourlyRate !== undefined) conditions.push(lte(djProfiles.hourlyRate, maxHourlyRate));
    if (minHourlyRate !== undefined) conditions.push(gte(djProfiles.hourlyRate, minHourlyRate));
    if (verified !== undefined) conditions.push(eq(djProfiles.isVerified, verified));
    if (musicStyles && musicStyles.length > 0) {
      conditions.push(sql`${djProfiles.musicStyles} && ARRAY[${sql.join(musicStyles.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    if (minExperience !== undefined) conditions.push(gte(djProfiles.yearsOfExperience, minExperience));
    if (availability) conditions.push(eq(djProfiles.availabilityStatus, availability));
    
    return db.select().from(djProfiles)
      .where(and(...conditions))
      .orderBy(desc(djProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async searchPhotographerProfiles(params: { 
    city?: string; 
    country?: string; 
    minRating?: number;
    maxHourlyRate?: number;
    minHourlyRate?: number;
    verified?: boolean;
    specialties?: string[];
    minExperience?: number;
    availability?: string;
    limit?: number; 
    offset?: number;
  }): Promise<SelectPhotographerProfile[]> {
    const { city, country, minRating, maxHourlyRate, minHourlyRate, verified, specialties, minExperience, availability, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(photographerProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${photographerProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${photographerProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(photographerProfiles.averageRating, minRating));
    if (maxHourlyRate !== undefined) conditions.push(lte(photographerProfiles.hourlyRate, maxHourlyRate));
    if (minHourlyRate !== undefined) conditions.push(gte(photographerProfiles.hourlyRate, minHourlyRate));
    if (verified !== undefined) conditions.push(eq(photographerProfiles.isVerified, verified));
    if (specialties && specialties.length > 0) {
      conditions.push(sql`${photographerProfiles.specialties} && ARRAY[${sql.join(specialties.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    if (minExperience !== undefined) conditions.push(gte(photographerProfiles.yearsOfExperience, minExperience));
    if (availability) conditions.push(eq(photographerProfiles.availabilityStatus, availability));
    
    return db.select().from(photographerProfiles)
      .where(and(...conditions))
      .orderBy(desc(photographerProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async searchPerformerProfiles(params: { 
    city?: string; 
    country?: string; 
    minRating?: number;
    maxHourlyRate?: number;
    minHourlyRate?: number;
    verified?: boolean;
    performanceTypes?: string[];
    minExperience?: number;
    availability?: string;
    limit?: number; 
    offset?: number;
  }): Promise<SelectPerformerProfile[]> {
    const { city, country, minRating, maxHourlyRate, minHourlyRate, verified, performanceTypes, minExperience, availability, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(performerProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${performerProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${performerProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(performerProfiles.averageRating, minRating));
    if (maxHourlyRate !== undefined) conditions.push(lte(performerProfiles.hourlyRate, maxHourlyRate));
    if (minHourlyRate !== undefined) conditions.push(gte(performerProfiles.hourlyRate, minHourlyRate));
    if (verified !== undefined) conditions.push(eq(performerProfiles.isVerified, verified));
    if (performanceTypes && performanceTypes.length > 0) {
      conditions.push(sql`${performerProfiles.performanceTypes} && ARRAY[${sql.join(performanceTypes.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    if (minExperience !== undefined) conditions.push(gte(performerProfiles.yearsOfExperience, minExperience));
    if (availability) conditions.push(eq(performerProfiles.availabilityStatus, availability));
    
    return db.select().from(performerProfiles)
      .where(and(...conditions))
      .orderBy(desc(performerProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async searchVendorProfiles(params: { 
    city?: string; 
    country?: string; 
    minRating?: number;
    verified?: boolean;
    productCategories?: string[];
    limit?: number; 
    offset?: number;
  }): Promise<SelectVendorProfile[]> {
    const { city, country, minRating, verified, productCategories, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(vendorProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${vendorProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${vendorProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(vendorProfiles.averageRating, minRating));
    if (verified !== undefined) conditions.push(eq(vendorProfiles.isVerified, verified));
    if (productCategories && productCategories.length > 0) {
      conditions.push(sql`${vendorProfiles.productCategories} && ARRAY[${sql.join(productCategories.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    
    return db.select().from(vendorProfiles)
      .where(and(...conditions))
      .orderBy(desc(vendorProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async searchMusicianProfiles(params: { 
    city?: string; 
    country?: string; 
    minRating?: number;
    maxHourlyRate?: number;
    minHourlyRate?: number;
    verified?: boolean;
    instruments?: string[];
    genres?: string[];
    minExperience?: number;
    availability?: string;
    limit?: number; 
    offset?: number;
  }): Promise<SelectMusicianProfile[]> {
    const { city, country, minRating, maxHourlyRate, minHourlyRate, verified, instruments, genres, minExperience, availability, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(musicianProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${musicianProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${musicianProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(musicianProfiles.averageRating, minRating));
    if (maxHourlyRate !== undefined) conditions.push(lte(musicianProfiles.hourlyRate, maxHourlyRate));
    if (minHourlyRate !== undefined) conditions.push(gte(musicianProfiles.hourlyRate, minHourlyRate));
    if (verified !== undefined) conditions.push(eq(musicianProfiles.isVerified, verified));
    if (instruments && instruments.length > 0) {
      conditions.push(sql`${musicianProfiles.instruments} && ARRAY[${sql.join(instruments.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    if (genres && genres.length > 0) {
      conditions.push(sql`${musicianProfiles.genres} && ARRAY[${sql.join(genres.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    if (minExperience !== undefined) conditions.push(gte(musicianProfiles.yearsOfExperience, minExperience));
    if (availability) conditions.push(eq(musicianProfiles.availabilityStatus, availability));
    
    return db.select().from(musicianProfiles)
      .where(and(...conditions))
      .orderBy(desc(musicianProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async searchChoreographerProfiles(params: { 
    city?: string; 
    country?: string; 
    minRating?: number;
    maxHourlyRate?: number;
    minHourlyRate?: number;
    verified?: boolean;
    styles?: string[];
    minExperience?: number;
    availability?: string;
    limit?: number; 
    offset?: number;
  }): Promise<SelectChoreographerProfile[]> {
    const { city, country, minRating, maxHourlyRate, minHourlyRate, verified, styles, minExperience, availability, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(choreographerProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${choreographerProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${choreographerProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(choreographerProfiles.averageRating, minRating));
    if (maxHourlyRate !== undefined) conditions.push(lte(choreographerProfiles.hourlyRate, maxHourlyRate));
    if (minHourlyRate !== undefined) conditions.push(gte(choreographerProfiles.hourlyRate, minHourlyRate));
    if (verified !== undefined) conditions.push(eq(choreographerProfiles.isVerified, verified));
    if (styles && styles.length > 0) {
      conditions.push(sql`${choreographerProfiles.styles} && ARRAY[${sql.join(styles.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    if (minExperience !== undefined) conditions.push(gte(choreographerProfiles.yearsOfExperience, minExperience));
    if (availability) conditions.push(eq(choreographerProfiles.availabilityStatus, availability));
    
    return db.select().from(choreographerProfiles)
      .where(and(...conditions))
      .orderBy(desc(choreographerProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async searchTangoSchoolProfiles(params: { 
    city?: string; 
    country?: string; 
    minRating?: number;
    verified?: boolean;
    classTypes?: string[];
    limit?: number; 
    offset?: number;
  }): Promise<SelectTangoSchoolProfile[]> {
    const { city, country, minRating, verified, classTypes, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(tangoSchoolProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${tangoSchoolProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${tangoSchoolProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(tangoSchoolProfiles.averageRating, minRating));
    if (verified !== undefined) conditions.push(eq(tangoSchoolProfiles.isVerified, verified));
    if (classTypes && classTypes.length > 0) {
      conditions.push(sql`${tangoSchoolProfiles.classTypes} && ARRAY[${sql.join(classTypes.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    
    return db.select().from(tangoSchoolProfiles)
      .where(and(...conditions))
      .orderBy(desc(tangoSchoolProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async searchTangoHotelProfiles(params: { 
    city?: string; 
    country?: string; 
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
    verified?: boolean;
    amenities?: string[];
    limit?: number; 
    offset?: number;
  }): Promise<SelectTangoHotelProfile[]> {
    const { city, country, minRating, minPrice, maxPrice, verified, amenities, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(tangoHotelProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${tangoHotelProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${tangoHotelProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(tangoHotelProfiles.averageRating, minRating));
    if (minPrice !== undefined) conditions.push(gte(tangoHotelProfiles.pricePerNight, minPrice));
    if (maxPrice !== undefined) conditions.push(lte(tangoHotelProfiles.pricePerNight, maxPrice));
    if (verified !== undefined) conditions.push(eq(tangoHotelProfiles.isVerified, verified));
    if (amenities && amenities.length > 0) {
      conditions.push(sql`${tangoHotelProfiles.amenities} && ARRAY[${sql.join(amenities.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    
    return db.select().from(tangoHotelProfiles)
      .where(and(...conditions))
      .orderBy(desc(tangoHotelProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async searchHostVenueProfiles(params: { 
    city?: string; 
    country?: string; 
    minRating?: number;
    minCapacity?: number;
    verified?: boolean;
    amenities?: string[];
    venueTypes?: string[];
    limit?: number; 
    offset?: number;
  }): Promise<SelectHostVenueProfile[]> {
    const { city, country, minRating, minCapacity, verified, amenities, venueTypes, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(hostVenueProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${hostVenueProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${hostVenueProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(hostVenueProfiles.averageRating, minRating));
    if (minCapacity !== undefined) conditions.push(gte(hostVenueProfiles.capacity, minCapacity));
    if (verified !== undefined) conditions.push(eq(hostVenueProfiles.isVerified, verified));
    if (amenities && amenities.length > 0) {
      conditions.push(sql`${hostVenueProfiles.amenities} && ARRAY[${sql.join(amenities.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    if (venueTypes && venueTypes.length > 0) {
      conditions.push(sql`${hostVenueProfiles.venueTypes} && ARRAY[${sql.join(venueTypes.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    
    return db.select().from(hostVenueProfiles)
      .where(and(...conditions))
      .orderBy(desc(hostVenueProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }

  async searchWellnessProfiles(params: { 
    services?: string; 
    city?: string;
    country?: string;
    minRating?: number;
    maxHourlyRate?: number;
    minHourlyRate?: number;
    verified?: boolean;
    specialties?: string[];
    limit?: number; 
    offset?: number;
  }): Promise<SelectWellnessProfile[]> {
    const { services, city, country, minRating, maxHourlyRate, minHourlyRate, verified, specialties, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(wellnessProfiles.isActive, true)];
    
    if (services) conditions.push(sql`${wellnessProfiles.servicesOffered} @> ARRAY[${services}]::text[]`);
    if (city) conditions.push(sql`LOWER(${wellnessProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${wellnessProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(wellnessProfiles.averageRating, minRating));
    if (maxHourlyRate !== undefined) conditions.push(lte(wellnessProfiles.hourlyRate, maxHourlyRate));
    if (minHourlyRate !== undefined) conditions.push(gte(wellnessProfiles.hourlyRate, minHourlyRate));
    if (verified !== undefined) conditions.push(eq(wellnessProfiles.isVerified, verified));
    if (specialties && specialties.length > 0) {
      conditions.push(sql`${wellnessProfiles.specialties} && ARRAY[${sql.join(specialties.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    
    return db.select().from(wellnessProfiles)
      .where(and(...conditions))
      .orderBy(desc(wellnessProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }
  
  async searchTourOperatorProfiles(params: { 
    destination?: string;
    city?: string;
    country?: string;
    minRating?: number;
    verified?: boolean;
    tourTypes?: string[];
    limit?: number; 
    offset?: number;
  }): Promise<SelectTourOperatorProfile[]> {
    const { destination, city, country, minRating, verified, tourTypes, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(tourOperatorProfiles.isActive, true)];
    
    if (destination) conditions.push(sql`${tourOperatorProfiles.destinations} @> ARRAY[${destination}]::text[]`);
    if (city) conditions.push(sql`LOWER(${tourOperatorProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${tourOperatorProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(tourOperatorProfiles.averageRating, minRating));
    if (verified !== undefined) conditions.push(eq(tourOperatorProfiles.isVerified, verified));
    if (tourTypes && tourTypes.length > 0) {
      conditions.push(sql`${tourOperatorProfiles.tourTypes} && ARRAY[${sql.join(tourTypes.map(s => sql`${s}`), sql`, `)}]::text[]`);
    }
    
    return db.select().from(tourOperatorProfiles)
      .where(and(...conditions))
      .orderBy(desc(tourOperatorProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }
  
  async searchTangoGuideProfiles(params: { 
    city?: string; 
    language?: string;
    country?: string;
    minRating?: number;
    maxHourlyRate?: number;
    minHourlyRate?: number;
    verified?: boolean;
    availability?: string;
    limit?: number; 
    offset?: number;
  }): Promise<SelectTangoGuideProfile[]> {
    const { city, language, country, minRating, maxHourlyRate, minHourlyRate, verified, availability, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(tangoGuideProfiles.isActive, true)];
    
    if (city) {
      conditions.push(or(
        sql`LOWER(${tangoGuideProfiles.primaryCity}) = LOWER(${city})`,
        sql`${tangoGuideProfiles.citiesCovered} @> ARRAY[${city}]::text[]`
      ));
    }
    if (country) conditions.push(sql`LOWER(${tangoGuideProfiles.country}) = LOWER(${country})`);
    if (language) conditions.push(sql`${tangoGuideProfiles.languagesSpoken} @> ARRAY[${language}]::text[]`);
    if (minRating !== undefined) conditions.push(gte(tangoGuideProfiles.averageRating, minRating));
    if (maxHourlyRate !== undefined) conditions.push(lte(tangoGuideProfiles.hourlyRate, maxHourlyRate));
    if (minHourlyRate !== undefined) conditions.push(gte(tangoGuideProfiles.hourlyRate, minHourlyRate));
    if (verified !== undefined) conditions.push(eq(tangoGuideProfiles.isVerified, verified));
    if (availability) conditions.push(eq(tangoGuideProfiles.availabilityStatus, availability));
    
    return db.select().from(tangoGuideProfiles)
      .where(and(...conditions))
      .orderBy(desc(tangoGuideProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }
  
  async searchTaxiDancerProfiles(params: { 
    city?: string; 
    style?: string;
    country?: string;
    minRating?: number;
    maxHourlyRate?: number;
    minHourlyRate?: number;
    verified?: boolean;
    availability?: string;
    limit?: number; 
    offset?: number;
  }): Promise<SelectTaxiDancerProfile[]> {
    const { city, style, country, minRating, maxHourlyRate, minHourlyRate, verified, availability, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(taxiDancerProfiles.isActive, true)];
    
    if (style) conditions.push(sql`${taxiDancerProfiles.styles} @> ARRAY[${style}]::text[]`);
    if (minRating !== undefined) conditions.push(gte(taxiDancerProfiles.averageRating, minRating));
    if (maxHourlyRate !== undefined) conditions.push(lte(taxiDancerProfiles.hourlyRate, maxHourlyRate));
    if (minHourlyRate !== undefined) conditions.push(gte(taxiDancerProfiles.hourlyRate, minHourlyRate));
    if (verified !== undefined) conditions.push(eq(taxiDancerProfiles.isVerified, verified));
    if (availability) conditions.push(eq(taxiDancerProfiles.availabilityStatus, availability));
    
    let query = db.select().from(taxiDancerProfiles);
    
    if (city || country) {
      query = query.innerJoin(users, eq(taxiDancerProfiles.userId, users.id));
      if (city) conditions.push(sql`LOWER(${users.city}) = LOWER(${city})`);
      if (country) conditions.push(sql`LOWER(${users.country}) = LOWER(${country})`);
      
      return query
        .where(and(...conditions))
        .orderBy(desc(taxiDancerProfiles.averageRating))
        .limit(limit)
        .offset(offset)
        .then(results => results.map(r => r.taxi_dancer_profiles));
    }
    
    return db.select().from(taxiDancerProfiles)
      .where(and(...conditions))
      .orderBy(desc(taxiDancerProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }
  
  async searchContentCreatorProfiles(params: { 
    platform?: string; 
    contentType?: string;
    city?: string;
    country?: string;
    minRating?: number;
    minFollowers?: number;
    verified?: boolean;
    limit?: number; 
    offset?: number;
  }): Promise<SelectContentCreatorProfile[]> {
    const { platform, contentType, city, country, minRating, minFollowers, verified, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(contentCreatorProfiles.isActive, true)];
    
    if (contentType) conditions.push(sql`${contentCreatorProfiles.contentTypes} @> ARRAY[${contentType}]::text[]`);
    if (city) conditions.push(sql`LOWER(${contentCreatorProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${contentCreatorProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(contentCreatorProfiles.averageRating, minRating));
    if (minFollowers !== undefined) conditions.push(gte(contentCreatorProfiles.totalFollowers, minFollowers));
    if (verified !== undefined) conditions.push(eq(contentCreatorProfiles.isVerified, verified));
    if (platform) {
      conditions.push(sql`EXISTS (SELECT 1 FROM jsonb_array_elements(${contentCreatorProfiles.platforms}) AS p WHERE p->>'name' = ${platform})`);
    }
    
    return db.select().from(contentCreatorProfiles)
      .where(and(...conditions))
      .orderBy(desc(contentCreatorProfiles.totalFollowers))
      .limit(limit)
      .offset(offset);
  }
  
  async searchLearningResourceProfiles(params: { 
    topic?: string; 
    format?: string;
    city?: string;
    country?: string;
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
    verified?: boolean;
    level?: string;
    limit?: number; 
    offset?: number;
  }): Promise<SelectLearningResourceProfile[]> {
    const { topic, format, city, country, minRating, minPrice, maxPrice, verified, level, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(learningResourceProfiles.isActive, true)];
    
    if (format) conditions.push(sql`${learningResourceProfiles.formats} @> ARRAY[${format}]::text[]`);
    if (topic) conditions.push(sql`${learningResourceProfiles.courseTypes} @> ARRAY[${topic}]::text[]`);
    if (city) conditions.push(sql`LOWER(${learningResourceProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${learningResourceProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(learningResourceProfiles.averageRating, minRating));
    if (minPrice !== undefined) conditions.push(gte(learningResourceProfiles.averagePrice, minPrice));
    if (maxPrice !== undefined) conditions.push(lte(learningResourceProfiles.averagePrice, maxPrice));
    if (verified !== undefined) conditions.push(eq(learningResourceProfiles.isVerified, verified));
    if (level) conditions.push(sql`${learningResourceProfiles.levels} @> ARRAY[${level}]::text[]`);
    
    return db.select().from(learningResourceProfiles)
      .where(and(...conditions))
      .orderBy(desc(learningResourceProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }
  
  async searchOrganizerProfiles(params: { 
    city?: string; 
    eventType?: string;
    country?: string;
    minRating?: number;
    verified?: boolean;
    minEventsOrganized?: number;
    limit?: number; 
    offset?: number;
  }): Promise<SelectOrganizerProfile[]> {
    const { city, eventType, country, minRating, verified, minEventsOrganized, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(organizerProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${organizerProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${organizerProfiles.country}) = LOWER(${country})`);
    if (eventType) conditions.push(sql`${organizerProfiles.eventTypesOrganized} @> ARRAY[${eventType}]::text[]`);
    if (minRating !== undefined) conditions.push(gte(organizerProfiles.averageRating, minRating));
    if (verified !== undefined) conditions.push(eq(organizerProfiles.isVerified, verified));
    if (minEventsOrganized !== undefined) conditions.push(gte(organizerProfiles.totalEventsOrganized, minEventsOrganized));
    
    return db.select().from(organizerProfiles)
      .where(and(...conditions))
      .orderBy(desc(organizerProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }
  
  async searchTalentProfiles(params: {
    city?: string;
    country?: string;
    minRating?: number;
    verified?: boolean;
    talentType?: string;
    limit?: number;
    offset?: number;
  }): Promise<SelectTalentProfile[]> {
    const { city, country, minRating, verified, talentType, limit = 20, offset = 0 } = params;
    const conditions: any[] = [eq(talentProfiles.isActive, true)];
    
    if (city) conditions.push(sql`LOWER(${talentProfiles.city}) = LOWER(${city})`);
    if (country) conditions.push(sql`LOWER(${talentProfiles.country}) = LOWER(${country})`);
    if (minRating !== undefined) conditions.push(gte(talentProfiles.averageRating, minRating));
    if (verified !== undefined) conditions.push(eq(talentProfiles.isVerified, verified));
    if (talentType) conditions.push(eq(talentProfiles.talentType, talentType));
    
    return db.select().from(talentProfiles)
      .where(and(...conditions))
      .orderBy(desc(talentProfiles.averageRating))
      .limit(limit)
      .offset(offset);
  }
  
  // Talent Profiles (Generic)
  async getTalentProfile(userId: number): Promise<SelectTalentProfile | null> {
    const result = await db.select().from(talentProfiles).where(eq(talentProfiles.userId, userId)).limit(1);
    return result[0] || null;
  }
  
  async createTalentProfile(data: InsertTalentProfile): Promise<SelectTalentProfile> {
    const [result] = await db.insert(talentProfiles).values(data).returning();
    return result;
  }
  
  async updateTalentProfile(userId: number, data: Partial<SelectTalentProfile>): Promise<SelectTalentProfile | null> {
    const [result] = await db
      .update(talentProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(talentProfiles.userId, userId))
      .returning();
    return result || null;
  }
  
  async deleteTalentProfile(userId: number): Promise<void> {
    await db.delete(talentProfiles).where(eq(talentProfiles.userId, userId));
  }
  
  // ============================================================================
  // ALBUM MANAGEMENT
  // ============================================================================
  
  async createAlbum(album: any): Promise<any> {
    const [newAlbum] = await db.insert(mediaAlbums).values(album).returning();
    return newAlbum;
  }
  
  async getAlbumById(id: number): Promise<any | undefined> {
    const [album] = await db.select().from(mediaAlbums).where(eq(mediaAlbums.id, id)).limit(1);
    return album;
  }
  
  async getUserAlbums(userId: number): Promise<any[]> {
    return await db.select().from(mediaAlbums).where(eq(mediaAlbums.userId, userId)).orderBy(desc(mediaAlbums.createdAt));
  }
  
  async updateAlbum(id: number, data: any): Promise<any | undefined> {
    const [updated] = await db
      .update(mediaAlbums)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(mediaAlbums.id, id))
      .returning();
    return updated;
  }
  
  async deleteAlbum(id: number): Promise<void> {
    await db.delete(mediaAlbums).where(eq(mediaAlbums.id, id));
  }
  
  async addMediaToAlbum(albumId: number, mediaId: number, order: number): Promise<any> {
    const [result] = await db.insert(albumMedia).values({
      albumId,
      mediaId,
      order
    }).returning();
    
    await db.execute(sql`
      UPDATE media_albums 
      SET media_count = (SELECT COUNT(*) FROM album_media WHERE album_id = ${albumId})
      WHERE id = ${albumId}
    `);
    
    return result;
  }
  
  async getAlbumMedia(albumId: number, params: { limit?: number; offset?: number }): Promise<any[]> {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    
    const results = await db.execute(sql`
      SELECT 
        am.id,
        am.album_id as "albumId",
        am.media_id as "mediaId",
        am.order,
        am.added_at as "addedAt",
        m.id as "media_id",
        m.user_id as "media_userId",
        m.type as "media_type",
        m.url as "media_url",
        m.thumbnail as "media_thumbnail",
        m.caption as "media_caption",
        m.created_at as "media_createdAt"
      FROM album_media am
      JOIN media m ON am.media_id = m.id
      WHERE am.album_id = ${albumId}
      ORDER BY am.order ASC, am.added_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    
    return results.rows || [];
  }
  
  async removeMediaFromAlbum(albumId: number, mediaId: number): Promise<void> {
    await db.delete(albumMedia).where(
      and(
        eq(albumMedia.albumId, albumId),
        eq(albumMedia.mediaId, mediaId)
      )
    );
    
    await db.execute(sql`
      UPDATE media_albums 
      SET media_count = (SELECT COUNT(*) FROM album_media WHERE album_id = ${albumId})
      WHERE id = ${albumId}
    `);
  }
  
  async getAlbumWithMedia(id: number): Promise<any | undefined> {
    const album = await this.getAlbumById(id);
    if (!album) return undefined;
    
    const media = await this.getAlbumMedia(id, { limit: 100, offset: 0 });
    
    return {
      ...album,
      media
    };
  }
  
  async checkAlbumOwnership(albumId: number, userId: number): Promise<boolean> {
    const album = await this.getAlbumById(albumId);
    return album?.userId === userId;
  }
  
  // ============================================================================
  // PART_3: FINANCIAL MANAGEMENT SYSTEM IMPLEMENTATIONS
  // ============================================================================
  
  async createFinancialPortfolio(userId: number, data: any): Promise<any> {
    const [portfolio] = await db.insert(financialPortfolios).values({ ...data, userId }).returning();
    return portfolio;
  }
  
  async getFinancialPortfolios(userId: number): Promise<any[]> {
    return await db.select().from(financialPortfolios).where(eq(financialPortfolios.userId, userId));
  }
  
  async getFinancialPortfolioById(id: number): Promise<any | undefined> {
    const [portfolio] = await db.select().from(financialPortfolios).where(eq(financialPortfolios.id, id)).limit(1);
    return portfolio;
  }
  
  async updateFinancialPortfolio(id: number, data: any): Promise<any | undefined> {
    const [portfolio] = await db.update(financialPortfolios).set({ ...data, updatedAt: new Date() }).where(eq(financialPortfolios.id, id)).returning();
    return portfolio;
  }
  
  async deleteFinancialPortfolio(id: number): Promise<void> {
    await db.delete(financialPortfolios).where(eq(financialPortfolios.id, id));
  }
  
  async createFinancialAccount(userId: number, data: any): Promise<any> {
    const [account] = await db.insert(financialAccounts).values({ ...data, userId }).returning();
    return account;
  }
  
  async getFinancialAccounts(userId: number): Promise<any[]> {
    return await db.select().from(financialAccounts).where(eq(financialAccounts.userId, userId));
  }
  
  async getFinancialAccountById(id: number): Promise<any | undefined> {
    const [account] = await db.select().from(financialAccounts).where(eq(financialAccounts.id, id)).limit(1);
    return account;
  }
  
  async updateFinancialAccount(id: number, data: any): Promise<any | undefined> {
    const [account] = await db.update(financialAccounts).set({ ...data, updatedAt: new Date() }).where(eq(financialAccounts.id, id)).returning();
    return account;
  }
  
  async deleteFinancialAccount(id: number): Promise<void> {
    await db.delete(financialAccounts).where(eq(financialAccounts.id, id));
  }
  
  async syncFinancialAccount(id: number): Promise<any> {
    const [account] = await db.update(financialAccounts).set({ lastSyncedAt: new Date() }).where(eq(financialAccounts.id, id)).returning();
    return account;
  }
  
  async createFinancialAsset(portfolioId: number, data: any): Promise<any> {
    const [asset] = await db.insert(financialAssets).values({ ...data, portfolioId }).returning();
    return asset;
  }
  
  async getFinancialAssets(portfolioId: number): Promise<any[]> {
    return await db.select().from(financialAssets).where(eq(financialAssets.portfolioId, portfolioId));
  }
  
  async updateFinancialAsset(id: number, data: any): Promise<any | undefined> {
    const [asset] = await db.update(financialAssets).set({ ...data, lastUpdatedAt: new Date() }).where(eq(financialAssets.id, id)).returning();
    return asset;
  }
  
  async deleteFinancialAsset(id: number): Promise<void> {
    await db.delete(financialAssets).where(eq(financialAssets.id, id));
  }
  
  async createFinancialTrade(portfolioId: number, data: any): Promise<any> {
    const [trade] = await db.insert(financialTrades).values({ ...data, portfolioId }).returning();
    return trade;
  }
  
  async getFinancialTrades(portfolioId: number, params?: { limit?: number; offset?: number }): Promise<any[]> {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    return await db.select().from(financialTrades).where(eq(financialTrades.portfolioId, portfolioId)).limit(limit).offset(offset);
  }
  
  async getFinancialTradeById(id: number): Promise<any | undefined> {
    const [trade] = await db.select().from(financialTrades).where(eq(financialTrades.id, id)).limit(1);
    return trade;
  }
  
  async createFinancialStrategy(data: any): Promise<any> {
    const [strategy] = await db.insert(financialStrategies).values(data).returning();
    return strategy;
  }
  
  async getFinancialStrategies(params?: { isActive?: boolean }): Promise<any[]> {
    if (params?.isActive !== undefined) {
      return await db.select().from(financialStrategies).where(eq(financialStrategies.isActive, params.isActive));
    }
    return await db.select().from(financialStrategies);
  }
  
  async getFinancialStrategyById(id: number): Promise<any | undefined> {
    const [strategy] = await db.select().from(financialStrategies).where(eq(financialStrategies.id, id)).limit(1);
    return strategy;
  }
  
  async updateFinancialStrategy(id: number, data: any): Promise<any | undefined> {
    const [strategy] = await db.update(financialStrategies).set({ ...data, updatedAt: new Date() }).where(eq(financialStrategies.id, id)).returning();
    return strategy;
  }
  
  async deleteFinancialStrategy(id: number): Promise<void> {
    await db.delete(financialStrategies).where(eq(financialStrategies.id, id));
  }
  
  async getFinancialMarketData(symbol: string): Promise<any | undefined> {
    const [data] = await db.select().from(financialMarketData).where(eq(financialMarketData.symbol, symbol)).orderBy(desc(financialMarketData.timestamp)).limit(1);
    return data;
  }
  
  async updateFinancialMarketData(symbol: string, data: any): Promise<any> {
    const [marketData] = await db.insert(financialMarketData).values({ ...data, symbol }).returning();
    return marketData;
  }
  
  async createFinancialAIDecision(data: any): Promise<any> {
    const [decision] = await db.insert(financialAIDecisions).values(data).returning();
    return decision;
  }
  
  async getFinancialAIDecisions(portfolioId: number, params?: { limit?: number; offset?: number }): Promise<any[]> {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    return await db.select().from(financialAIDecisions).where(eq(financialAIDecisions.portfolioId, portfolioId)).limit(limit).offset(offset);
  }
  
  async getFinancialRiskMetrics(portfolioId: number): Promise<any | undefined> {
    const [metrics] = await db.select().from(financialRiskMetrics).where(eq(financialRiskMetrics.portfolioId, portfolioId)).orderBy(desc(financialRiskMetrics.calculatedAt)).limit(1);
    return metrics;
  }
  
  async updateFinancialRiskMetrics(portfolioId: number, data: any): Promise<any> {
    const [metrics] = await db.insert(financialRiskMetrics).values({ ...data, portfolioId }).returning();
    return metrics;
  }
  
  async getFinancialAgents(params?: { tier?: number; isActive?: boolean }): Promise<any[]> {
    let query = db.select().from(financialAgents);
    const conditions = [];
    if (params?.tier !== undefined) conditions.push(eq(financialAgents.tier, params.tier));
    if (params?.isActive !== undefined) conditions.push(eq(financialAgents.isActive, params.isActive));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return await query;
  }
  
  async getFinancialAgentById(id: number): Promise<any | undefined> {
    const [agent] = await db.select().from(financialAgents).where(eq(financialAgents.id, id)).limit(1);
    return agent;
  }
  
  async updateFinancialAgent(id: number, data: any): Promise<any | undefined> {
    const [agent] = await db.update(financialAgents).set({ ...data, updatedAt: new Date() }).where(eq(financialAgents.id, id)).returning();
    return agent;
  }
  
  async createFinancialMonitoringLog(data: any): Promise<any> {
    const [log] = await db.insert(financialMonitoring).values(data).returning();
    return log;
  }
  
  async getFinancialMonitoringLogs(params: { agentId?: number; portfolioId?: number; limit?: number }): Promise<any[]> {
    const limit = params.limit || 100;
    let query = db.select().from(financialMonitoring);
    const conditions = [];
    if (params.agentId) conditions.push(eq(financialMonitoring.agentId, params.agentId));
    if (params.portfolioId) conditions.push(eq(financialMonitoring.portfolioId, params.portfolioId));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return await query.limit(limit);
  }
  
  // ============================================================================
  // PART_3: SOCIAL MEDIA INTEGRATION IMPLEMENTATIONS
  // ============================================================================
  
  async createPlatformConnection(userId: number, data: any): Promise<any> {
    const [connection] = await db.insert(platformConnections).values({ ...data, userId }).returning();
    return connection;
  }
  
  async getPlatformConnections(userId: number): Promise<any[]> {
    return await db.select().from(platformConnections).where(eq(platformConnections.userId, userId));
  }
  
  async getPlatformConnection(userId: number, platform: string): Promise<any | undefined> {
    const [connection] = await db.select().from(platformConnections).where(
      and(eq(platformConnections.userId, userId), eq(platformConnections.platform, platform))
    ).limit(1);
    return connection;
  }
  
  async updatePlatformConnection(id: number, data: any): Promise<any | undefined> {
    const [connection] = await db.update(platformConnections).set({ ...data, updatedAt: new Date() }).where(eq(platformConnections.id, id)).returning();
    return connection;
  }
  
  async deletePlatformConnection(id: number): Promise<void> {
    await db.delete(platformConnections).where(eq(platformConnections.id, id));
  }
  
  async createSocialPost(userId: number, data: any): Promise<any> {
    const [post] = await db.insert(socialPosts).values({ ...data, userId }).returning();
    return post;
  }
  
  async getSocialPosts(userId: number, params?: { status?: string; limit?: number; offset?: number }): Promise<any[]> {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    let query = db.select().from(socialPosts).where(eq(socialPosts.userId, userId));
    if (params?.status) {
      query = query.where(and(eq(socialPosts.userId, userId), eq(socialPosts.status, params.status)));
    }
    return await query.limit(limit).offset(offset);
  }
  
  async getSocialPostById(id: number): Promise<any | undefined> {
    const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, id)).limit(1);
    return post;
  }
  
  async updateSocialPost(id: number, data: any): Promise<any | undefined> {
    const [post] = await db.update(socialPosts).set({ ...data, updatedAt: new Date() }).where(eq(socialPosts.id, id)).returning();
    return post;
  }
  
  async deleteSocialPost(id: number): Promise<void> {
    await db.delete(socialPosts).where(eq(socialPosts.id, id));
  }
  
  async publishSocialPost(id: number): Promise<any> {
    const [post] = await db.update(socialPosts).set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() }).where(eq(socialPosts.id, id)).returning();
    return post;
  }
  
  async createSocialCampaign(userId: number, data: any): Promise<any> {
    const [campaign] = await db.insert(socialCampaigns).values({ ...data, userId }).returning();
    return campaign;
  }
  
  async getSocialCampaigns(userId: number, params?: { status?: string }): Promise<any[]> {
    let query = db.select().from(socialCampaigns).where(eq(socialCampaigns.userId, userId));
    if (params?.status) {
      query = query.where(and(eq(socialCampaigns.userId, userId), eq(socialCampaigns.status, params.status)));
    }
    return await query;
  }
  
  async getSocialCampaignById(id: number): Promise<any | undefined> {
    const [campaign] = await db.select().from(socialCampaigns).where(eq(socialCampaigns.id, id)).limit(1);
    return campaign;
  }
  
  async updateSocialCampaign(id: number, data: any): Promise<any | undefined> {
    const [campaign] = await db.update(socialCampaigns).set({ ...data, updatedAt: new Date() }).where(eq(socialCampaigns.id, id)).returning();
    return campaign;
  }
  
  async deleteSocialCampaign(id: number): Promise<void> {
    await db.delete(socialCampaigns).where(eq(socialCampaigns.id, id));
  }
  
  async getCrossPlatformAnalytics(userId: number, period: string): Promise<any | undefined> {
    const [analytics] = await db.select().from(crossPlatformAnalytics).where(
      and(eq(crossPlatformAnalytics.userId, userId), eq(crossPlatformAnalytics.period, period))
    ).orderBy(desc(crossPlatformAnalytics.calculatedAt)).limit(1);
    return analytics;
  }
  
  async createCrossPlatformAnalytics(userId: number, data: any): Promise<any> {
    const [analytics] = await db.insert(crossPlatformAnalytics).values({ ...data, userId }).returning();
    return analytics;
  }
  
  async createAIGeneratedContent(data: any): Promise<any> {
    const [content] = await db.insert(aiGeneratedContent).values(data).returning();
    return content;
  }
  
  async getAIGeneratedContent(campaignId: number, params?: { approvalStatus?: string }): Promise<any[]> {
    let query = db.select().from(aiGeneratedContent).where(eq(aiGeneratedContent.campaignId, campaignId));
    if (params?.approvalStatus) {
      query = query.where(and(eq(aiGeneratedContent.campaignId, campaignId), eq(aiGeneratedContent.approvalStatus, params.approvalStatus)));
    }
    return await query;
  }
  
  async updateAIGeneratedContent(id: number, data: any): Promise<any | undefined> {
    const [content] = await db.update(aiGeneratedContent).set({ ...data, updatedAt: new Date() }).where(eq(aiGeneratedContent.id, id)).returning();
    return content;
  }
  
  async createScrapedEvent(data: any): Promise<any> {
    const [event] = await db.insert(scrapedEvents).values(data).returning();
    return event;
  }
  
  async getScrapedEvents(params?: { status?: string; limit?: number; offset?: number }): Promise<any[]> {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    let query = db.select().from(scrapedEvents);
    if (params?.status) {
      query = query.where(eq(scrapedEvents.status, params.status));
    }
    return await query.limit(limit).offset(offset);
  }
  
  async updateScrapedEvent(id: number, data: any): Promise<any | undefined> {
    const [event] = await db.update(scrapedEvents).set({ ...data, updatedAt: new Date() }).where(eq(scrapedEvents.id, id)).returning();
    return event;
  }
  
  async createEventClaim(userId: number, scrapedEventId: number, data: any): Promise<any> {
    const [claim] = await db.insert(eventClaims).values({ ...data, userId, scrapedEventId }).returning();
    return claim;
  }
  
  async getEventClaims(userId: number): Promise<any[]> {
    return await db.select().from(eventClaims).where(eq(eventClaims.userId, userId));
  }
  
  async updateEventClaimStatus(id: number, status: string): Promise<any | undefined> {
    const [claim] = await db.update(eventClaims).set({ verificationStatus: status, updatedAt: new Date() }).where(eq(eventClaims.id, id)).returning();
    return claim;
  }
  
  // ============================================================================
  // PART_3: CREATOR MARKETPLACE IMPLEMENTATIONS
  // ============================================================================
  
  async createMarketplaceProduct(userId: number, data: any): Promise<any> {
    const [product] = await db.insert(marketplaceProducts).values({ ...data, creatorUserId: userId }).returning();
    return product;
  }
  
  async getMarketplaceProducts(params?: { creatorUserId?: number; category?: string; limit?: number; offset?: number }): Promise<any[]> {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    let query = db.select().from(marketplaceProducts);
    const conditions = [];
    if (params?.creatorUserId) conditions.push(eq(marketplaceProducts.creatorUserId, params.creatorUserId));
    if (params?.category) conditions.push(eq(marketplaceProducts.category, params.category));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return await query.limit(limit).offset(offset);
  }
  
  async getMarketplaceProductById(id: number): Promise<any | undefined> {
    const [product] = await db.select().from(marketplaceProducts).where(eq(marketplaceProducts.id, id)).limit(1);
    return product;
  }
  
  async updateMarketplaceProduct(id: number, data: any): Promise<any | undefined> {
    const [product] = await db.update(marketplaceProducts).set({ ...data, updatedAt: new Date() }).where(eq(marketplaceProducts.id, id)).returning();
    return product;
  }
  
  async deleteMarketplaceProduct(id: number): Promise<void> {
    await db.delete(marketplaceProducts).where(eq(marketplaceProducts.id, id));
  }
  
  async createProductPurchase(userId: number, productId: number, data: any): Promise<any> {
    const [purchase] = await db.insert(productPurchases).values({ ...data, buyerUserId: userId, productId }).returning();
    return purchase;
  }
  
  async getProductPurchases(userId: number): Promise<any[]> {
    return await db.select().from(productPurchases).where(eq(productPurchases.buyerUserId, userId));
  }
  
  async getProductPurchaseById(id: number): Promise<any | undefined> {
    const [purchase] = await db.select().from(productPurchases).where(eq(productPurchases.id, id)).limit(1);
    return purchase;
  }
  
  async createProductReview(userId: number, productId: number, data: any): Promise<any> {
    const [review] = await db.insert(productReviews).values({ ...data, userId, productId }).returning();
    return review;
  }
  
  async getProductReviews(productId: number): Promise<any[]> {
    return await db.select().from(productReviews).where(eq(productReviews.productId, productId));
  }
  
  async updateProductReview(id: number, data: any): Promise<any | undefined> {
    const [review] = await db.update(productReviews).set({ ...data, updatedAt: new Date() }).where(eq(productReviews.id, id)).returning();
    return review;
  }
  
  async deleteProductReview(id: number): Promise<void> {
    await db.delete(productReviews).where(eq(productReviews.id, id));
  }
  
  async getMarketplaceAnalytics(userId: number, period: string): Promise<any | undefined> {
    const [analytics] = await db.select().from(marketplaceAnalytics).where(
      and(eq(marketplaceAnalytics.userId, userId), eq(marketplaceAnalytics.period, period))
    ).orderBy(desc(marketplaceAnalytics.calculatedAt)).limit(1);
    return analytics;
  }
  
  async createMarketplaceAnalytics(userId: number, data: any): Promise<any> {
    const [analytics] = await db.insert(marketplaceAnalytics).values({ ...data, userId }).returning();
    return analytics;
  }
  
  async createFundingCampaign(userId: number, data: any): Promise<any> {
    const [campaign] = await db.insert(fundingCampaigns).values({ ...data, userId }).returning();
    return campaign;
  }
  
  async getFundingCampaigns(params?: { userId?: number; category?: string; status?: string; limit?: number; offset?: number }): Promise<any[]> {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    let query = db.select().from(fundingCampaigns);
    const conditions = [];
    if (params?.userId) conditions.push(eq(fundingCampaigns.userId, params.userId));
    if (params?.category) conditions.push(eq(fundingCampaigns.category, params.category));
    if (params?.status) conditions.push(eq(fundingCampaigns.status, params.status));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return await query.limit(limit).offset(offset);
  }
  
  async getFundingCampaignById(id: number): Promise<any | undefined> {
    const [campaign] = await db.select().from(fundingCampaigns).where(eq(fundingCampaigns.id, id)).limit(1);
    return campaign;
  }
  
  async updateFundingCampaign(id: number, data: any): Promise<any | undefined> {
    const [campaign] = await db.update(fundingCampaigns).set({ ...data, updatedAt: new Date() }).where(eq(fundingCampaigns.id, id)).returning();
    return campaign;
  }
  
  async deleteFundingCampaign(id: number): Promise<void> {
    await db.delete(fundingCampaigns).where(eq(fundingCampaigns.id, id));
  }
  
  async createCampaignDonation(campaignId: number, data: any): Promise<any> {
    const [donation] = await db.insert(campaignDonations).values({ ...data, campaignId }).returning();
    return donation;
  }
  
  async getCampaignDonations(campaignId: number): Promise<any[]> {
    return await db.select().from(campaignDonations).where(eq(campaignDonations.campaignId, campaignId));
  }
  
  async createCampaignUpdate(campaignId: number, data: any): Promise<any> {
    const [update] = await db.insert(campaignUpdates).values({ ...data, campaignId }).returning();
    return update;
  }
  
  async getCampaignUpdates(campaignId: number): Promise<any[]> {
    return await db.select().from(campaignUpdates).where(eq(campaignUpdates.campaignId, campaignId));
  }
  
  async createLegalDocument(userId: number, data: any): Promise<any> {
    const [document] = await db.insert(legalDocuments).values({ ...data, creatorUserId: userId }).returning();
    return document;
  }
  
  async getLegalDocuments(params?: { category?: string; isPremium?: boolean; limit?: number; offset?: number }): Promise<any[]> {
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    let query = db.select().from(legalDocuments);
    const conditions = [];
    if (params?.category) conditions.push(eq(legalDocuments.category, params.category));
    if (params?.isPremium !== undefined) conditions.push(eq(legalDocuments.isPremium, params.isPremium));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return await query.limit(limit).offset(offset);
  }
  
  async getLegalDocumentById(id: number): Promise<any | undefined> {
    const [document] = await db.select().from(legalDocuments).where(eq(legalDocuments.id, id)).limit(1);
    return document;
  }
  
  async updateLegalDocument(id: number, data: any): Promise<any | undefined> {
    const [document] = await db.update(legalDocuments).set({ ...data, updatedAt: new Date() }).where(eq(legalDocuments.id, id)).returning();
    return document;
  }
  
  async deleteLegalDocument(id: number): Promise<void> {
    await db.delete(legalDocuments).where(eq(legalDocuments.id, id));
  }
  
  async createDocumentInstance(userId: number, templateId: number, data: any): Promise<any> {
    const [instance] = await db.insert(documentInstances).values({ ...data, userId, templateId }).returning();
    return instance;
  }
  
  async getDocumentInstances(userId: number): Promise<any[]> {
    return await db.select().from(documentInstances).where(eq(documentInstances.userId, userId));
  }
  
  async updateDocumentInstance(id: number, data: any): Promise<any | undefined> {
    const [instance] = await db.update(documentInstances).set({ ...data, updatedAt: new Date() }).where(eq(documentInstances.id, id)).returning();
    return instance;
  }
  
  // ============================================================================
  // PART_3: TRAVEL INTEGRATION IMPLEMENTATIONS
  // ============================================================================
  
  async createTravelPlan(userId: number, data: any): Promise<any> {
    const [plan] = await db.insert(travelPlans).values({ ...data, userId }).returning();
    return plan;
  }
  
  async getTravelPlans(userId: number, params?: { status?: string }): Promise<any[]> {
    let query = db.select().from(travelPlans).where(eq(travelPlans.userId, userId));
    if (params?.status) {
      query = query.where(and(eq(travelPlans.userId, userId), eq(travelPlans.status, params.status)));
    }
    return await query;
  }
  
  async getTravelPlanById(id: number): Promise<any | undefined> {
    const [plan] = await db.select().from(travelPlans).where(eq(travelPlans.id, id)).limit(1);
    return plan;
  }
  
  async updateTravelPlan(id: number, data: any): Promise<any | undefined> {
    const [plan] = await db.update(travelPlans).set({ ...data, updatedAt: new Date() }).where(eq(travelPlans.id, id)).returning();
    return plan;
  }
  
  async deleteTravelPlan(id: number): Promise<void> {
    await db.delete(travelPlans).where(eq(travelPlans.id, id));
  }
  
  async createTravelPlanItem(travelPlanId: number, data: any): Promise<any> {
    const [item] = await db.insert(travelPlanItems).values({ ...data, travelPlanId }).returning();
    return item;
  }
  
  async getTravelPlanItems(travelPlanId: number): Promise<any[]> {
    return await db.select().from(travelPlanItems).where(eq(travelPlanItems.travelPlanId, travelPlanId));
  }
  
  async updateTravelPlanItem(id: number, data: any): Promise<any | undefined> {
    const [item] = await db.update(travelPlanItems).set({ ...data, updatedAt: new Date() }).where(eq(travelPlanItems.id, id)).returning();
    return item;
  }
  
  async deleteTravelPlanItem(id: number): Promise<void> {
    await db.delete(travelPlanItems).where(eq(travelPlanItems.id, id));
  }
  
  async getTravelPreferences(userId: number): Promise<any | undefined> {
    const [prefs] = await db.select().from(travelPreferencesProfiles).where(eq(travelPreferencesProfiles.userId, userId)).limit(1);
    return prefs;
  }
  
  async updateTravelPreferences(userId: number, data: any): Promise<any> {
    const existing = await this.getTravelPreferences(userId);
    if (existing) {
      const [prefs] = await db.update(travelPreferencesProfiles).set({ ...data, updatedAt: new Date() }).where(eq(travelPreferencesProfiles.userId, userId)).returning();
      return prefs;
    } else {
      const [prefs] = await db.insert(travelPreferencesProfiles).values({ ...data, userId }).returning();
      return prefs;
    }
  }
  
  async getTravelRecommendations(userId: number, params?: { destination?: string }): Promise<any[]> {
    return [];
  }
  
  async createTravelRecommendation(data: any): Promise<any> {
    return data;
  }
  
  // Facebook Import System
  async createFacebookImport(data: any): Promise<any> {
    const result = await db.insert(facebookImports).values(data).returning();
    return result[0];
  }

  async getFacebookImports(userId?: number): Promise<any[]> {
    if (userId) {
      return await db.select().from(facebookImports).where(eq(facebookImports.userId, userId));
    }
    return await db.select().from(facebookImports).orderBy(desc(facebookImports.importDate));
  }

  async getFacebookImportById(id: number): Promise<any | undefined> {
    const result = await db.select().from(facebookImports).where(eq(facebookImports.id, id)).limit(1);
    return result[0];
  }

  async updateFacebookImport(id: number, data: any): Promise<any | undefined> {
    const result = await db.update(facebookImports).set(data).where(eq(facebookImports.id, id)).returning();
    return result[0];
  }

  async deleteFacebookImport(id: number): Promise<void> {
    await db.delete(facebookImports).where(eq(facebookImports.id, id));
  }

  async createFacebookPost(data: any): Promise<any> {
    const result = await db.insert(facebookPosts).values(data).returning();
    return result[0];
  }

  async createFacebookFriend(data: any): Promise<any> {
    const result = await db.insert(facebookFriends).values(data).returning();
    return result[0];
  }

  async getFacebookPostsByUserId(userId: number): Promise<any[]> {
    return await db.select().from(facebookPosts).where(eq(facebookPosts.userId, userId));
  }

  async getFacebookFriendsByUserId(userId: number): Promise<any[]> {
    return await db.select().from(facebookFriends).where(eq(facebookFriends.userId, userId));
  }
}

export const storage = new DbStorage();

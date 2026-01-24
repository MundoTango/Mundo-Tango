/**
 * Storage Module Barrel Export
 * Provides backward compatibility while supporting new repository pattern
 */

// Re-export from legacy storage (singleton instance for backward compatibility)
export { storage } from "../storage";

// Named repository exports for new code
export { userRepository } from "./repositories/users";
export { eventRepository } from "./repositories/events";
export { postRepository } from "./repositories/posts";
export { venueRepository } from "./repositories/venues";
export { friendRepository } from "./repositories/friends";
export { bookmarkRepository } from "./repositories/bookmarks";
export { albumRepository } from "./repositories/albums";
export { groupRepository } from "./repositories/groups";
export { notificationRepository } from "./repositories/notifications";
export { moderationRepository } from "./repositories/moderation";
export { analyticsRepository } from "./repositories/analytics";
export { mediaRepository } from "./repositories/media";
export { chatRepository } from "./repositories/chat";


// Export database connection
export { db, sql } from './core/connection';


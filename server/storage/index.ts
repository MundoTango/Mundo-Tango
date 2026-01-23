/**
 * Storage Module - Barrel Export
 * Provides backward compatibility with legacy Storage class
 * while exposing new repository pattern
 * 
 * MB.MD Sprint 1.1: Repository Pattern Migration
 */

// Export new repositories
export { UserRepository, userRepository } from './repositories/users';
export { EventRepository, eventRepository } from './repositories/events';
export { PostRepository, postRepository } from './repositories/posts';
export { VenueRepository, venueRepository } from './repositories/venues';

// Export database connection
export { db, sql } from './core/connection';

// Legacy compatibility - will be removed in Sprint 1.3
// For now, import the original Storage class
import { Storage } from '../storage';
export { Storage };
export default Storage;

/**
 * Vitest Test Setup
 * Sets up environment for server tests
 * MB.MD God Command #1: Test infrastructure
 */

// Provide DATABASE_URL for tests that need module to load
// but don't actually connect to the database
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';

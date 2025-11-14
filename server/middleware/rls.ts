/**
 * Row Level Security (RLS) Middleware
 * 
 * This middleware helps enforce RLS policies by providing utilities
 * to execute database queries with the authenticated user's context.
 */

import { Request, Response, NextFunction } from 'express';
import { getDbWithUser } from '../db';

/**
 * Extend Express Request to include RLS-aware database connection
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * User-aware database connection that enforces RLS policies
       * Only available if user is authenticated
       */
      userDb?: ReturnType<typeof getDbWithUser>;
    }
  }
}

/**
 * Middleware to attach RLS-aware database connection to request
 * 
 * This middleware must be used AFTER authentication middleware
 * that sets req.user
 * 
 * @example
 * app.use(authenticateUser);
 * app.use(attachUserDb);
 * 
 * app.get('/api/posts', async (req, res) => {
 *   if (!req.userDb) {
 *     return res.status(401).json({ error: 'Unauthorized' });
 *   }
 *   
 *   const posts = await req.userDb.execute(async (tx) => {
 *     return tx.query.posts.findMany();
 *   });
 *   
 *   res.json(posts);
 * });
 */
export function attachUserDb(req: Request, res: Response, next: NextFunction) {
  // Only attach userDb if user is authenticated
  if (req.user && req.user.id) {
    try {
      req.userDb = getDbWithUser(req.user.id);
    } catch (error) {
      console.error('Error creating user database connection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  next();
}

/**
 * Middleware to require RLS-aware database connection
 * Returns 401 if user is not authenticated
 * 
 * @example
 * app.get('/api/financial-goals', requireUserDb, async (req, res) => {
 *   // req.userDb is guaranteed to exist here
 *   const goals = await req.userDb.execute(async (tx) => {
 *     return tx.query.financialGoals.findMany();
 *   });
 *   res.json(goals);
 * });
 */
export function requireUserDb(req: Request, res: Response, next: NextFunction) {
  if (!req.userDb || !req.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource'
    });
  }
  
  next();
}

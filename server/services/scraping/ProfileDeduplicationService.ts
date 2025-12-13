import { db } from '../../database';

export interface ProfileMatch {
  foundUserId: number;
  matchingUserId?: number;
  matchType: 'email' | 'facebook' | 'instagram' | 'name_city';
  confidence: number;
  evidence: any;
}

export interface MergeResult {
  primaryUserId: number;
  mergedUserId: number;
  success: boolean;
}

export class ProfileDeduplicationService {
  private readonly MATCH_THRESHOLDS = {
    email: 0.95,
    facebook: 0.90,
    instagram: 0.85,
    name_city: 0.75,
  };

  /**
   * Find potential duplicate profiles for a found_user
   */
  async findDuplicateProfiles(foundUserId: number): Promise<ProfileMatch[]> {
    try {
      const foundUser = await this.getFoundUser(foundUserId);
      if (!foundUser) {
        return [];
      }

      const matches: ProfileMatch[] = [];

      // Check email matches
      if (foundUser.found_email) {
        const emailMatches = await this.findByEmail(foundUser.found_email);
        matches.push(
          ...emailMatches.map((m) => ({
            foundUserId,
            matchingUserId: m.id,
            matchType: 'email' as const,
            confidence: 0.95,
            evidence: { email: foundUser.found_email },
          }))
        );
      }

      // Check Facebook matches
      if (foundUser.found_facebook_url) {
        const fbMatches = await this.findByFacebook(foundUser.found_facebook_url);
        matches.push(
          ...fbMatches.map((m) => ({
            foundUserId,
            matchingUserId: m.id,
            matchType: 'facebook' as const,
            confidence: 0.90,
            evidence: { facebook_url: foundUser.found_facebook_url },
          }))
        );
      }

      // Check Instagram matches  
      if (foundUser.found_instagram_handle) {
        const igMatches = await this.findByInstagram(foundUser.found_instagram_handle);
        matches.push(
          ...igMatches.map((m) => ({
            foundUserId,
            matchingUserId: m.id,
            matchType: 'instagram' as const,
            confidence: 0.85,
            evidence: { instagram_handle: foundUser.found_instagram_handle },
          }))
        );
      }

      // Check name + city matches
      if (foundUser.display_name) {
        const nameMatches = await this.findByNameAndCity(
          foundUser.display_name,
          foundUser.city_id
        );
        matches.push(
          ...nameMatches.map((m) => ({
            foundUserId,
            matchingUserId: m.id,
            matchType: 'name_city' as const,
            confidence: this.calculateNameCityConfidence(foundUser.display_name, m.display_name),
            evidence: { name: foundUser.display_name, city_id: foundUser.city_id },
          }))
        );
      }

      // Filter by confidence thresholds
      return matches.filter((m) => m.confidence >= this.MATCH_THRESHOLDS[m.matchType]);
    } catch (error) {
      console.error('Error finding duplicate profiles:', error);
      throw error;
    }
  }

  /**
   * Create a profile claim request
   */
  async createClaimRequest(
    foundUserId: number,
    claimingUserId: number,
    matchType: string,
    evidence: any,
    confidence: number
  ): Promise<number> {
    try {
      const result = await db.query(
        `
        INSERT INTO profile_claim_requests (found_user_id, claiming_user_id, claim_method, evidence, confidence_score, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
        ON CONFLICT (found_user_id, claiming_user_id) DO UPDATE
        SET evidence = $4, confidence_score = $5, updated_at = CURRENT_TIMESTAMP
        RETURNING id
        `,
        [foundUserId, claimingUserId, matchType, JSON.stringify(evidence), confidence]
      );

      return result.rows[0].id;
    } catch (error) {
      console.error('Error creating claim request:', error);
      throw error;
    }
  }

  /**
   * Merge two user profiles
   */
  async mergeProfiles(
    primaryUserId: number,
    mergeUserId: number,
    method: string,
    confidence: number
  ): Promise<MergeResult> {
    try {
      // Get data from user to be merged
      const mergeUser = await this.getUserData(mergeUserId);

      // Begin transaction
      await db.query('BEGIN');

      try {
        // Update all relationships to point to primary user
        await this.transferUserRelationships(mergeUserId, primaryUserId);

        // Store merge history
        await db.query(
          `
          INSERT INTO user_merge_history (primary_user_id, merged_user_id, merge_method, merge_confidence, merged_data)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [primaryUserId, mergeUserId, method, confidence, JSON.stringify(mergeUser)]
        );

        // Mark merged user as merged
        await db.query(
          `
          UPDATE users
          SET merged_into_user_id = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [primaryUserId, mergeUserId]
        );

        await db.query('COMMIT');

        console.log(`Successfully merged user ${mergeUserId} into ${primaryUserId}`);

        return {
          primaryUserId,
          mergedUserId: mergeUserId,
          success: true,
        };
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error merging profiles:', error);
      return {
        primaryUserId,
        mergedUserId: mergeUserId,
        success: false,
      };
    }
  }

  // Private helper methods

  private async getFoundUser(id: number): Promise<any> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  private async findByEmail(email: string): Promise<any[]> {
    const result = await db.query(
      'SELECT id, display_name FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(found_email) = LOWER($1)',
      [email]
    );
    return result.rows;
  }

  private async findByFacebook(facebookUrl: string): Promise<any[]> {
    const result = await db.query(
      'SELECT id, display_name FROM users WHERE found_facebook_url = $1',
      [facebookUrl]
    );
    return result.rows;
  }

  private async findByInstagram(instagramHandle: string): Promise<any[]> {
    const result = await db.query(
      'SELECT id, display_name FROM users WHERE found_instagram_handle = $1',
      [instagramHandle]
    );
    return result.rows;
  }

  private async findByNameAndCity(name: string, cityId?: number): Promise<any[]> {
    if (!cityId) return [];

    const result = await db.query(
      `
      SELECT id, display_name FROM users
      WHERE city_id = $1
      AND LOWER(display_name) LIKE LOWER($2)
      `,
      [cityId, `%${name}%`]
    );
    return result.rows;
  }

  private calculateNameCityConfidence(name1: string, name2: string): number {
    // Simple Levenshtein-like comparison
    const similarity = this.stringSimilarity(name1.toLowerCase(), name2.toLowerCase());
    return similarity;
  }

  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private async getUserData(userId: number): Promise<any> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  }

  private async transferUserRelationships(fromUserId: number, toUserId: number): Promise<void> {
    // Transfer event relationships
    await db.query(
      'UPDATE event_attendees SET user_id = $1 WHERE user_id = $2',
      [toUserId, fromUserId]
    );

    // Add more relationship transfers as needed
  }
}

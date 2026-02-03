/**
 * Voice Trainer Service
 * Manages the voice training workflow and progress tracking
 * 
 * Features:
 * - Training session management
 * - Progress tracking
 * - Status monitoring
 * - Error handling and recovery
 */

import { voiceCloningService, type VoiceCloneRequest } from './VoiceCloningService';
import { db } from '@shared/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface TrainingSession {
  id: string;
  userId: number;
  voiceName: string;
  audioUrls: string[];
  status: 'pending' | 'downloading' | 'processing' | 'training' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep?: string;
  voiceId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

class VoiceTrainerService {
  private sessions: Map<string, TrainingSession> = new Map();

  /**
   * Start voice training from audio URLs
   */
  async startTraining(
    userId: number,
    voiceName: string,
    audioUrls: string[],
    description?: string
  ): Promise<TrainingSession> {
    // Validate inputs
    if (!audioUrls || audioUrls.length === 0) {
      throw new Error('At least one audio URL is required');
    }

    if (audioUrls.length > 25) {
      throw new Error('Maximum 25 audio URLs allowed');
    }

    // Create training session
    const sessionId = `training_${userId}_${Date.now()}`;
    const session: TrainingSession = {
      id: sessionId,
      userId,
      voiceName,
      audioUrls,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    console.log(`[VoiceTrainer] Created training session: ${sessionId}`);

    // Start training in background
    this.executeTraining(sessionId, description).catch(error => {
      console.error(`[VoiceTrainer] Training failed for session ${sessionId}:`, error);
      this.updateSession(sessionId, {
        status: 'failed',
        error: error.message || 'Training failed',
        updatedAt: new Date(),
      });
    });

    return session;
  }

  /**
   * Execute the training workflow
   */
  private async executeTraining(sessionId: string, description?: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Step 1: Downloading audio files
      this.updateSession(sessionId, {
        status: 'downloading',
        progress: 10,
        currentStep: 'Downloading audio files...',
        updatedAt: new Date(),
      });

      // Step 2: Processing audio samples
      this.updateSession(sessionId, {
        status: 'processing',
        progress: 40,
        currentStep: 'Processing audio samples...',
        updatedAt: new Date(),
      });

      // Step 3: Training voice model
      this.updateSession(sessionId, {
        status: 'training',
        progress: 60,
        currentStep: 'Training voice model on ElevenLabs...',
        updatedAt: new Date(),
      });

      // Execute voice cloning
      const voiceId = await voiceCloningService.cloneUserVoice({
        userId: session.userId,
        voiceName: session.voiceName,
        audioUrls: session.audioUrls,
        description,
      });

      // Step 4: Completed
      this.updateSession(sessionId, {
        status: 'completed',
        progress: 100,
        currentStep: 'Training completed!',
        voiceId,
        completedAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`[VoiceTrainer] ✅ Training completed for session ${sessionId}, voice ID: ${voiceId}`);
    } catch (error: any) {
      console.error(`[VoiceTrainer] ❌ Training failed for session ${sessionId}:`, error);
      this.updateSession(sessionId, {
        status: 'failed',
        error: error.message || 'Training failed',
        updatedAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Get training session status
   */
  getSessionStatus(sessionId: string): TrainingSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId: number): TrainingSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update session data
   */
  private updateSession(sessionId: string, updates: Partial<TrainingSession>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Clean up old completed sessions (older than 24 hours)
   */
  cleanupOldSessions(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (
        (session.status === 'completed' || session.status === 'failed') &&
        session.updatedAt.getTime() < cutoffTime
      ) {
        this.sessions.delete(sessionId);
        console.log(`[VoiceTrainer] Cleaned up old session: ${sessionId}`);
      }
    }
  }

  /**
   * Cancel a training session
   */
  cancelSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    if (session.status === 'completed' || session.status === 'failed') {
      return false; // Cannot cancel completed or failed sessions
    }

    this.updateSession(sessionId, {
      status: 'failed',
      error: 'Cancelled by user',
      updatedAt: new Date(),
    });

    console.log(`[VoiceTrainer] Cancelled session: ${sessionId}`);
    return true;
  }

  /**
   * Get training progress summary
   */
  getProgressSummary(sessionId: string): {
    status: string;
    progress: number;
    currentStep: string;
    estimatedTimeRemaining?: string;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    let estimatedTimeRemaining: string | undefined;
    
    // Estimate time remaining based on progress
    if (session.status !== 'completed' && session.status !== 'failed') {
      const elapsedTime = Date.now() - session.createdAt.getTime();
      const progressRate = session.progress > 0 ? elapsedTime / session.progress : 0;
      const remainingProgress = 100 - session.progress;
      const remainingTime = progressRate * remainingProgress;
      
      const minutes = Math.ceil(remainingTime / 60000);
      estimatedTimeRemaining = minutes > 0 ? `~${minutes} minutes` : 'Less than a minute';
    }

    return {
      status: session.status,
      progress: session.progress,
      currentStep: session.currentStep || this.getStepDescription(session.status),
      estimatedTimeRemaining,
    };
  }

  /**
   * Get human-readable step description
   */
  private getStepDescription(status: TrainingSession['status']): string {
    switch (status) {
      case 'pending':
        return 'Preparing to start training...';
      case 'downloading':
        return 'Downloading audio files from URLs...';
      case 'processing':
        return 'Processing and preparing audio samples...';
      case 'training':
        return 'Training your voice model...';
      case 'completed':
        return 'Training completed successfully!';
      case 'failed':
        return 'Training failed';
      default:
        return 'Processing...';
    }
  }
}

// Export singleton instance
export const voiceTrainer = new VoiceTrainerService();

// Clean up old sessions every hour
setInterval(() => {
  voiceTrainer.cleanupOldSessions();
}, 60 * 60 * 1000);

/**
 * Checkpoint Manager Service (Pattern 71)
 * 
 * Saves state before risky operations for rollback capability.
 * Enables safe experimentation with automatic recovery.
 * 
 * MB.MD v3.1 - VibeCoding Evolution
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FileCheckpoint {
  path: string;
  content: string;
  exists: boolean;
}

export interface Checkpoint {
  id: string;
  sessionId: string;
  userId: number;
  description: string;
  files: FileCheckpoint[];
  createdAt: number;
  status: 'active' | 'committed' | 'rolled_back';
  committedAt?: number;
  rolledBackAt?: number;
}

export class CheckpointManager {
  private checkpoints: Map<string, Checkpoint> = new Map();
  private readonly CHECKPOINT_DIR = '/tmp/mrblue-checkpoints';

  constructor() {
    console.log('[CheckpointManager] Service initialized');
    this.ensureCheckpointDir();
  }

  private ensureCheckpointDir(): void {
    if (!fs.existsSync(this.CHECKPOINT_DIR)) {
      fs.mkdirSync(this.CHECKPOINT_DIR, { recursive: true });
    }
  }

  async createCheckpoint(
    sessionId: string,
    userId: number,
    description: string,
    filePaths: string[]
  ): Promise<Checkpoint> {
    const id = `cp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const files: FileCheckpoint[] = [];
    
    for (const filePath of filePaths) {
      try {
        const fullPath = path.resolve(filePath);
        const exists = fs.existsSync(fullPath);
        const content = exists ? fs.readFileSync(fullPath, 'utf-8') : '';
        
        files.push({
          path: filePath,
          content,
          exists,
        });
      } catch (error: any) {
        console.warn(`[CheckpointManager] Failed to read file ${filePath}: ${error.message}`);
        files.push({
          path: filePath,
          content: '',
          exists: false,
        });
      }
    }

    const checkpoint: Checkpoint = {
      id,
      sessionId,
      userId,
      description,
      files,
      createdAt: Date.now(),
      status: 'active',
    };

    this.checkpoints.set(id, checkpoint);
    
    const checkpointFile = path.join(this.CHECKPOINT_DIR, `${id}.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));

    console.log(`[CheckpointManager] Created checkpoint ${id}: ${description} (${files.length} files)`);
    
    return checkpoint;
  }

  async rollback(checkpointId: string): Promise<{ success: boolean; restoredFiles: string[]; errors: string[] }> {
    const checkpoint = this.checkpoints.get(checkpointId);
    
    if (!checkpoint) {
      const checkpointFile = path.join(this.CHECKPOINT_DIR, `${checkpointId}.json`);
      if (fs.existsSync(checkpointFile)) {
        const loaded = JSON.parse(fs.readFileSync(checkpointFile, 'utf-8'));
        this.checkpoints.set(checkpointId, loaded);
        return this.rollback(checkpointId);
      }
      
      return {
        success: false,
        restoredFiles: [],
        errors: [`Checkpoint not found: ${checkpointId}`],
      };
    }

    if (checkpoint.status !== 'active') {
      return {
        success: false,
        restoredFiles: [],
        errors: [`Checkpoint already ${checkpoint.status}: ${checkpointId}`],
      };
    }

    const restoredFiles: string[] = [];
    const errors: string[] = [];

    for (const file of checkpoint.files) {
      try {
        const fullPath = path.resolve(file.path);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        if (file.exists) {
          fs.writeFileSync(fullPath, file.content, 'utf-8');
          restoredFiles.push(file.path);
        } else if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          restoredFiles.push(`${file.path} (deleted)`);
        }
      } catch (error: any) {
        errors.push(`Failed to restore ${file.path}: ${error.message}`);
      }
    }

    checkpoint.status = 'rolled_back';
    checkpoint.rolledBackAt = Date.now();

    const checkpointFile = path.join(this.CHECKPOINT_DIR, `${checkpointId}.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));

    console.log(`[CheckpointManager] Rolled back checkpoint ${checkpointId}: ${restoredFiles.length} files restored`);

    return {
      success: errors.length === 0,
      restoredFiles,
      errors,
    };
  }

  commit(checkpointId: string): boolean {
    const checkpoint = this.checkpoints.get(checkpointId);
    
    if (!checkpoint || checkpoint.status !== 'active') {
      return false;
    }

    checkpoint.status = 'committed';
    checkpoint.committedAt = Date.now();

    const checkpointFile = path.join(this.CHECKPOINT_DIR, `${checkpointId}.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));

    console.log(`[CheckpointManager] Committed checkpoint ${checkpointId}`);
    return true;
  }

  getCheckpoint(checkpointId: string): Checkpoint | undefined {
    return this.checkpoints.get(checkpointId);
  }

  getActiveCheckpoints(sessionId?: string): Checkpoint[] {
    const checkpoints = Array.from(this.checkpoints.values())
      .filter(cp => cp.status === 'active');

    if (sessionId) {
      return checkpoints.filter(cp => cp.sessionId === sessionId);
    }

    return checkpoints;
  }

  async createFileCheckpoint(
    sessionId: string,
    userId: number,
    filePath: string
  ): Promise<Checkpoint> {
    return this.createCheckpoint(
      sessionId,
      userId,
      `Auto-checkpoint before editing ${filePath}`,
      [filePath]
    );
  }

  async wrapWithCheckpoint<T>(
    sessionId: string,
    userId: number,
    description: string,
    filePaths: string[],
    operation: () => Promise<T>
  ): Promise<{ result?: T; checkpoint: Checkpoint; error?: string }> {
    const checkpoint = await this.createCheckpoint(sessionId, userId, description, filePaths);

    try {
      const result = await operation();
      this.commit(checkpoint.id);
      return { result, checkpoint };
    } catch (error: any) {
      console.error(`[CheckpointManager] Operation failed, rolling back: ${error.message}`);
      await this.rollback(checkpoint.id);
      return { checkpoint, error: error.message };
    }
  }

  cleanupOldCheckpoints(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    const entries = Array.from(this.checkpoints.entries());
    for (const [id, checkpoint] of entries) {
      if (checkpoint.status !== 'active' && now - checkpoint.createdAt > maxAgeMs) {
        this.checkpoints.delete(id);
        
        const checkpointFile = path.join(this.CHECKPOINT_DIR, `${id}.json`);
        if (fs.existsSync(checkpointFile)) {
          fs.unlinkSync(checkpointFile);
        }
        
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[CheckpointManager] Cleaned up ${cleaned} old checkpoints`);
    }

    return cleaned;
  }
}

export const checkpointManager = new CheckpointManager();

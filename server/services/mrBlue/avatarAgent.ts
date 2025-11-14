import { db } from "@db";
import { mrBlueKnowledgeBase } from "@shared/schema";

export type AvatarEmotion = 'idle' | 'happy' | 'surprised' | 'listening' | 'speaking' | 'nodding' | 'walk-left' | 'walk-right';

interface AvatarAnimation {
  emotion: AvatarEmotion;
  duration: number;
  videoUrl: string;
  lipSyncData?: any;
  gestureData?: any;
}

const AVATAR_ANIMATIONS: Record<AvatarEmotion, Partial<AvatarAnimation>> = {
  idle: {
    emotion: 'idle',
    duration: 5000,
    videoUrl: '/videos/states/idle.mp4'
  },
  happy: {
    emotion: 'happy',
    duration: 3000,
    videoUrl: '/videos/states/happy.mp4'
  },
  surprised: {
    emotion: 'surprised',
    duration: 2000,
    videoUrl: '/videos/states/surprised.mp4'
  },
  listening: {
    emotion: 'listening',
    duration: 4000,
    videoUrl: '/videos/states/listening.mp4'
  },
  speaking: {
    emotion: 'speaking',
    duration: 6000,
    videoUrl: '/videos/states/speaking.mp4'
  },
  nodding: {
    emotion: 'nodding',
    duration: 2000,
    videoUrl: '/videos/states/nodding.mp4'
  },
  'walk-left': {
    emotion: 'walk-left',
    duration: 4000,
    videoUrl: '/videos/states/walk-left.mp4'
  },
  'walk-right': {
    emotion: 'walk-right',
    duration: 4000,
    videoUrl: '/videos/states/walk-right.mp4'
  }
};

export class AvatarAgent {
  async generateAvatarAnimation(emotion: AvatarEmotion): Promise<AvatarAnimation> {
    const baseAnimation = AVATAR_ANIMATIONS[emotion];

    const lipSyncData = this.generateLipSyncData(emotion);
    const gestureData = this.generateGestureData(emotion);

    const animation: AvatarAnimation = {
      emotion,
      duration: baseAnimation.duration || 3000,
      videoUrl: baseAnimation.videoUrl || '/videos/states/idle.mp4',
      lipSyncData,
      gestureData
    };

    await this.storeAnimation(emotion, animation);

    return animation;
  }

  async loadAvatarModel(): Promise<{
    modelUrl: string;
    format: string;
    scale: number;
    position: [number, number, number];
  }> {
    return {
      modelUrl: '/models/mr-blue-avatar.glb',
      format: 'glb',
      scale: 1.0,
      position: [0, 0, 0]
    };
  }

  private generateLipSyncData(emotion: AvatarEmotion): any {
    const baseVisemes = {
      idle: ['neutral'],
      happy: ['smile', 'open'],
      surprised: ['wide', 'open'],
      listening: ['neutral', 'slight-smile'],
      speaking: ['open', 'a', 'e', 'o', 'u', 'neutral'],
      nodding: ['neutral'],
      'walk-left': ['neutral'],
      'walk-right': ['neutral']
    };

    return {
      visemes: baseVisemes[emotion] || ['neutral'],
      timing: this.generateVisemeTiming(baseVisemes[emotion] || ['neutral'])
    };
  }

  private generateVisemeTiming(visemes: string[]): number[] {
    const baseInterval = 100;
    return visemes.map((_, i) => i * baseInterval);
  }

  private generateGestureData(emotion: AvatarEmotion): any {
    const gestures = {
      idle: { head: { rotation: [0, 0, 0] }, hands: [] },
      happy: { head: { rotation: [0.1, 0, 0] }, hands: ['wave'] },
      surprised: { head: { rotation: [0.2, 0, 0] }, hands: ['raise'] },
      listening: { head: { rotation: [0, 0.1, 0] }, hands: [] },
      speaking: { head: { rotation: [0, -0.1, 0.1] }, hands: ['gesture'] },
      nodding: { head: { rotation: [0.3, 0, 0], animation: 'nod' }, hands: [] },
      'walk-left': { head: { rotation: [0, 0.2, 0] }, hands: [], movement: 'left' },
      'walk-right': { head: { rotation: [0, -0.2, 0] }, hands: [], movement: 'right' }
    };

    return gestures[emotion] || gestures.idle;
  }

  private async storeAnimation(emotion: AvatarEmotion, animation: AvatarAnimation): Promise<void> {
    try {
      await db.insert(mrBlueKnowledgeBase).values({
        userId: null,
        category: 'avatar_animation',
        title: `Avatar Animation - ${emotion}`,
        content: JSON.stringify(animation),
        tags: ['avatar', emotion, '3d'],
        useCount: 1,
        lastUsedAt: new Date()
      });
    } catch (error) {
      console.error('[AvatarAgent] Failed to store animation:', error);
    }
  }

  getAvailableEmotions(): AvatarEmotion[] {
    return Object.keys(AVATAR_ANIMATIONS) as AvatarEmotion[];
  }

  async getAnimationSequence(emotions: AvatarEmotion[]): Promise<AvatarAnimation[]> {
    const animations: AvatarAnimation[] = [];

    for (const emotion of emotions) {
      const animation = await this.generateAvatarAnimation(emotion);
      animations.push(animation);
    }

    return animations;
  }
}

export const avatarAgent = new AvatarAgent();

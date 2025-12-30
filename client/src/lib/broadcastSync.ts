/**
 * Multi-Tab State Sync using BroadcastChannel API
 * UX-007 Fix: Enables cross-tab synchronization for auth, notifications, and messages
 */

type SyncEventType = 
  | 'auth:login' 
  | 'auth:logout' 
  | 'notifications:update' 
  | 'messages:new' 
  | 'messages:read'
  | 'cache:invalidate';

interface SyncEvent {
  type: SyncEventType;
  payload?: unknown;
  timestamp: number;
  tabId: string;
}

const TAB_ID = `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
const CHANNEL_NAME = 'mundo-tango-sync';

let channel: BroadcastChannel | null = null;
const listeners: Map<SyncEventType, Set<(payload: unknown) => void>> = new Map();

function initChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    console.warn('[BroadcastSync] BroadcastChannel not supported');
    return null;
  }

  if (channel) return channel;

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    
    channel.onmessage = (event: MessageEvent<SyncEvent>) => {
      const { type, payload, tabId } = event.data;
      
      if (tabId === TAB_ID) return;
      
      const typeListeners = listeners.get(type);
      if (typeListeners) {
        typeListeners.forEach(callback => callback(payload));
      }
    };

    channel.onmessageerror = () => {
      console.error('[BroadcastSync] Message error');
    };

    return channel;
  } catch (err) {
    console.error('[BroadcastSync] Failed to initialize:', err);
    return null;
  }
}

export function broadcast(type: SyncEventType, payload?: unknown): void {
  const ch = initChannel();
  if (!ch) return;

  const event: SyncEvent = {
    type,
    payload,
    timestamp: Date.now(),
    tabId: TAB_ID,
  };

  try {
    ch.postMessage(event);
  } catch (err) {
    console.error('[BroadcastSync] Failed to broadcast:', err);
  }
}

export function subscribe(
  type: SyncEventType, 
  callback: (payload: unknown) => void
): () => void {
  initChannel();

  if (!listeners.has(type)) {
    listeners.set(type, new Set());
  }
  
  listeners.get(type)!.add(callback);

  return () => {
    const typeListeners = listeners.get(type);
    if (typeListeners) {
      typeListeners.delete(callback);
    }
  };
}

export function closeChannel(): void {
  if (channel) {
    channel.close();
    channel = null;
  }
  listeners.clear();
}

export { TAB_ID, type SyncEventType, type SyncEvent };

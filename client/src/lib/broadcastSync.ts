/**
 * Multi-Tab State Sync using BroadcastChannel API
 * UX-007 Fix: Enables cross-tab synchronization for auth, notifications, and messages
 * 
 * Features:
 * - Typed payload contracts per event type
 * - LocalStorage fallback for browsers without BroadcastChannel
 * - Self-loop prevention via tabId
 */

export type SyncEventType = 
  | 'auth:login' 
  | 'auth:logout' 
  | 'notifications:update' 
  | 'messages:new' 
  | 'messages:read'
  | 'cache:invalidate';

export interface AuthLoginPayload {
  userId?: number;
}

export interface AuthLogoutPayload {
  reason?: string;
}

export interface NotificationsUpdatePayload {
  count?: number;
}

export interface MessagesPayload {
  conversationId?: number;
  messageId?: number;
}

export interface CacheInvalidatePayload {
  queryKey?: string | string[];
}

export type SyncPayloadMap = {
  'auth:login': AuthLoginPayload;
  'auth:logout': AuthLogoutPayload;
  'notifications:update': NotificationsUpdatePayload;
  'messages:new': MessagesPayload;
  'messages:read': MessagesPayload;
  'cache:invalidate': CacheInvalidatePayload;
};

interface SyncEvent<T extends SyncEventType = SyncEventType> {
  type: T;
  payload: SyncPayloadMap[T];
  timestamp: number;
  tabId: string;
}

const TAB_ID = `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
const CHANNEL_NAME = 'mundo-tango-sync';
const STORAGE_KEY = 'mundo-tango-sync-event';

let channel: BroadcastChannel | null = null;
const listeners: Map<SyncEventType, Set<(payload: unknown) => void>> = new Map();
let useLocalStorage = false;

function initChannel(): boolean {
  if (typeof window === 'undefined') return false;

  if (channel) return true;

  if ('BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      
      channel.onmessage = (event: MessageEvent<SyncEvent>) => {
        handleSyncEvent(event.data);
      };

      channel.onmessageerror = () => {
        console.error('[BroadcastSync] Message error');
      };

      return true;
    } catch (err) {
      console.warn('[BroadcastSync] BroadcastChannel failed, using localStorage fallback');
    }
  }

  useLocalStorage = true;
  window.addEventListener('storage', handleStorageEvent);
  return true;
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  
  try {
    const syncEvent = JSON.parse(event.newValue) as SyncEvent;
    handleSyncEvent(syncEvent);
  } catch (err) {
    console.error('[BroadcastSync] Failed to parse storage event:', err);
  }
}

function handleSyncEvent(event: SyncEvent): void {
  const { type, payload, tabId } = event;
  
  if (tabId === TAB_ID) return;
  
  console.log(`[BroadcastSync] Received ${type} from ${tabId.substring(0, 10)}...`);
  
  const typeListeners = listeners.get(type);
  if (typeListeners) {
    typeListeners.forEach(callback => callback(payload));
  }
}

export function broadcast<T extends SyncEventType>(
  type: T, 
  payload: SyncPayloadMap[T] = {} as SyncPayloadMap[T]
): void {
  if (!initChannel()) return;

  const event: SyncEvent<T> = {
    type,
    payload,
    timestamp: Date.now(),
    tabId: TAB_ID,
  };

  try {
    if (channel && !useLocalStorage) {
      channel.postMessage(event);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
      setTimeout(() => localStorage.removeItem(STORAGE_KEY), 100);
    }
  } catch (err) {
    console.error('[BroadcastSync] Failed to broadcast:', err);
  }
}

export function subscribe<T extends SyncEventType>(
  type: T, 
  callback: (payload: SyncPayloadMap[T]) => void
): () => void {
  initChannel();

  if (!listeners.has(type)) {
    listeners.set(type, new Set());
  }
  
  listeners.get(type)!.add(callback as (payload: unknown) => void);

  return () => {
    const typeListeners = listeners.get(type);
    if (typeListeners) {
      typeListeners.delete(callback as (payload: unknown) => void);
    }
  };
}

export function closeChannel(): void {
  if (channel) {
    channel.close();
    channel = null;
  }
  if (useLocalStorage) {
    window.removeEventListener('storage', handleStorageEvent);
  }
  listeners.clear();
}

export { TAB_ID };

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { useDiaryStore } from '@/store/diaryStore';
import { useUserStore } from '@/store/userStore';
import type { MealEntry, User, WeightEntry } from '@/types';

const LOCAL_CHANGE_KEY = 'coach-imi-last-local-change';
const SYNC_TIMEOUT_MS = 10000;

// Supabase-js doesn't impose a timeout on its own — a hung connection would
// otherwise leave a push/pull promise unsettled forever, which would in turn
// leave the sync store's status stuck on 'syncing' indefinitely with no error
// ever surfacing (the "sync worked once, then locked up" symptom). Race
// against a timer so the call is always guaranteed to settle one way or the
// other.
function withTimeout<T>(promise: PromiseLike<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label}: Zeitüberschreitung.`)), SYNC_TIMEOUT_MS);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

// Tracks when local state last changed, independent of whether the debounced
// push to Supabase has actually landed yet. Used to make sure a reload can
// never let an older/missing remote snapshot clobber a newer local edit that
// just hasn't finished syncing — see pullSnapshot's `updatedAt`.
export async function recordLocalChange(): Promise<void> {
  await AsyncStorage.setItem(LOCAL_CHANGE_KEY, new Date().toISOString());
}

export async function getLocalChangeTimestamp(): Promise<string | null> {
  return AsyncStorage.getItem(LOCAL_CHANGE_KEY);
}

// Only let a pulled snapshot overwrite local state if it's actually newer than
// the last local edit (or there is no local edit on record yet, e.g. a fresh
// device). Otherwise a hard refresh shortly after an edit — before the
// debounced auto-sync push lands — would pull back the stale pre-edit row and
// silently discard the edit.
export function shouldApplyRemote(remoteUpdatedAt: string | null | undefined, localChangedAt: string | null): boolean {
  if (!localChangedAt) return true;
  if (!remoteUpdatedAt) return false;
  return new Date(remoteUpdatedAt).getTime() > new Date(localChangedAt).getTime();
}

export interface CloudSnapshot {
  user: User;
  weightHistory: WeightEntry[];
  entriesByDate: Record<string, MealEntry[]>;
  hasOnboarded: boolean;
}

export function buildSnapshot(): CloudSnapshot {
  const { user, weightHistory, hasOnboarded } = useUserStore.getState();
  const { entriesByDate } = useDiaryStore.getState();

  return {
    user,
    weightHistory,
    entriesByDate,
    hasOnboarded,
  };
}

export function applySnapshot(snapshot: CloudSnapshot): void {
  useUserStore.setState((state) => ({
    user: { ...state.user, ...snapshot.user },
    weightHistory: snapshot.weightHistory ?? state.weightHistory,
    hasOnboarded: snapshot.hasOnboarded ?? state.hasOnboarded,
  }));
  useDiaryStore.setState({
    entriesByDate: snapshot.entriesByDate ?? {},
  });
}

// Set on every push and checked by the realtime handler so a device doesn't
// treat its own write echoing back through `postgres_changes` as a remote
// change and redundantly re-apply/re-fetch its own just-pushed data.
let lastPushedUpdatedAt: string | null = null;

export async function pushSnapshot(userId: string): Promise<string> {
  const snapshot = buildSnapshot();
  const updatedAt = new Date().toISOString();
  const { error } = await withTimeout(
    supabase.from('user_data').upsert({ user_id: userId, data: snapshot, updated_at: updatedAt }),
    'Sync-Push',
  );
  if (error) {
    console.error('[Sync] Error:', error);
    throw error;
  }
  lastPushedUpdatedAt = updatedAt;
  return updatedAt;
}

export interface RemoteSnapshot {
  snapshot: CloudSnapshot;
  updatedAt: string | null;
}

export async function pullSnapshot(userId: string): Promise<RemoteSnapshot | null> {
  const { data, error } = await withTimeout(
    supabase.from('user_data').select('data, updated_at').eq('user_id', userId).maybeSingle(),
    'Sync-Pull',
  );
  if (error) {
    console.error('[Sync] Error:', error);
    throw error;
  }
  if (!data?.data) return null;
  return { snapshot: data.data as CloudSnapshot, updatedAt: (data.updated_at as string | undefined) ?? null };
}

// Listens for another device/session pushing a new snapshot for this user
// (requires `user_data` to be added to the `supabase_realtime` publication —
// see supabase/schema.sql) and calls back with its updated_at, unless it's
// just this device's own write echoing back. Returns an unsubscribe fn.
export function subscribeToRemoteChanges(userId: string, onRemoteChange: (updatedAt: string | null) => void): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`user_data:${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'user_data', filter: `user_id=eq.${userId}` },
      (payload) => {
        const updatedAt = (payload.new as { updated_at?: string } | null)?.updated_at ?? null;
        if (updatedAt && updatedAt === lastPushedUpdatedAt) return;
        onRemoteChange(updatedAt);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

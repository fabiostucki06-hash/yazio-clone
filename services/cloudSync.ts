import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';
import { useDiaryStore } from '@/store/diaryStore';
import { useUserStore } from '@/store/userStore';
import type { MealEntry, User, WeightEntry } from '@/types';

const LOCAL_CHANGE_KEY = 'coach-imi-last-local-change';

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

export async function pushSnapshot(userId: string): Promise<void> {
  const snapshot = buildSnapshot();
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: userId, data: snapshot, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export interface RemoteSnapshot {
  snapshot: CloudSnapshot;
  updatedAt: string | null;
}

export async function pullSnapshot(userId: string): Promise<RemoteSnapshot | null> {
  const { data, error } = await supabase
    .from('user_data')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.data) return null;
  return { snapshot: data.data as CloudSnapshot, updatedAt: (data.updated_at as string | undefined) ?? null };
}

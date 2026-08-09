import { supabase } from '@/lib/supabase';
import { useDiaryStore } from '@/store/diaryStore';
import { useUserStore } from '@/store/userStore';
import type { DrinkEntry, MealEntry, User, WeightEntry } from '@/types';

export interface CloudSnapshot {
  user: User;
  weightHistory: WeightEntry[];
  entriesByDate: Record<string, MealEntry[]>;
  drinkEntriesByDate: Record<string, DrinkEntry[]>;
}

export function buildSnapshot(): CloudSnapshot {
  const { user, weightHistory } = useUserStore.getState();
  const { entriesByDate, drinkEntriesByDate } = useDiaryStore.getState();

  return {
    user,
    weightHistory,
    entriesByDate,
    drinkEntriesByDate,
  };
}

export function applySnapshot(snapshot: CloudSnapshot): void {
  useUserStore.setState((state) => ({
    user: { ...state.user, ...snapshot.user },
    weightHistory: snapshot.weightHistory ?? state.weightHistory,
    hasOnboarded: true,
  }));
  useDiaryStore.setState({
    entriesByDate: snapshot.entriesByDate ?? {},
    drinkEntriesByDate: snapshot.drinkEntriesByDate ?? {},
  });
}

export async function pushSnapshot(userId: string): Promise<void> {
  const payload = buildSnapshot();
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: userId, payload, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function pullSnapshot(userId: string): Promise<CloudSnapshot | null> {
  const { data, error } = await supabase
    .from('user_data')
    .select('payload')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.payload as CloudSnapshot | undefined) ?? null;
}

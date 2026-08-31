jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let authCallback: ((event: string, session: unknown) => void) | undefined;
const mockMaybeSingle = jest.fn();
const mockUpsert = jest.fn().mockResolvedValue({ error: null });

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        authCallback = cb;
      },
    },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
      upsert: mockUpsert,
    }),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useUserStore } from '@/store/userStore';
import { useSyncStore } from '@/store/syncStore';

function flush() {
  return new Promise<void>((resolve) => setImmediate(() => resolve()));
}

beforeEach(async () => {
  await AsyncStorage.clear();
  useUserStore.setState((state) => ({ user: { ...state.user, dailyCalorieGoal: 1800 } }));
});

function remoteRowAt(dailyCalorieGoal: number, updatedAt: string) {
  const { user, weightHistory } = useUserStore.getState();
  return {
    data: { user: { ...user, dailyCalorieGoal }, weightHistory, entriesByDate: {}, hasOnboarded: true },
    updated_at: updatedAt,
  };
}

// Regression: a hard refresh shortly after a local edit (before the debounced
// auto-sync push lands) used to lose that edit — the reload re-runs
// onAuthStateChange's INITIAL_SESSION, which unconditionally pulled whatever
// stale snapshot was already in Supabase and overwrote the fresher local
// state that zustand's persist middleware had already saved to localStorage.
it('does not let a stale remote snapshot clobber a newer local edit on reload', async () => {
  const oldTimestamp = new Date(Date.now() - 60_000).toISOString();

  // Boot #1: remote and local already in sync.
  mockMaybeSingle.mockResolvedValue({ data: remoteRowAt(1800, oldTimestamp), error: null });
  useSyncStore.getState().init();
  authCallback?.('INITIAL_SESSION', { user: { id: 'u1' }, access_token: 'tok-1' });
  await flush();
  await flush();
  expect(useUserStore.getState().user.dailyCalorieGoal).toBe(1800);

  // A local edit happens, but the debounced push to Supabase hasn't landed yet.
  useUserStore.getState().updateGoals({ dailyCalorieGoal: 2500, dailyMacroGoal: { carbs: 300, protein: 180, fat: 80 } });
  await flush();

  // Simulate a hard refresh: a fresh INITIAL_SESSION fires and pulls the same
  // stale (pre-edit) remote row, since the push never got a chance to run.
  authCallback?.('INITIAL_SESSION', { user: { id: 'u1' }, access_token: 'tok-2' });
  await flush();
  await flush();

  expect(useUserStore.getState().user.dailyCalorieGoal).toBe(2500);
});

it('still applies a genuinely newer remote snapshot (e.g. edited on another device)', async () => {
  const oldTimestamp = new Date(Date.now() - 60_000).toISOString();

  mockMaybeSingle.mockResolvedValue({ data: remoteRowAt(1800, oldTimestamp), error: null });
  useSyncStore.getState().init();
  authCallback?.('INITIAL_SESSION', { user: { id: 'u2' }, access_token: 'tok-3' });
  await flush();
  await flush();
  expect(useUserStore.getState().user.dailyCalorieGoal).toBe(1800);

  // Another device pushes a newer edit after this device's last local change.
  const newerTimestamp = new Date(Date.now() + 60_000).toISOString();
  mockMaybeSingle.mockResolvedValue({ data: remoteRowAt(3000, newerTimestamp), error: null });
  authCallback?.('INITIAL_SESSION', { user: { id: 'u2' }, access_token: 'tok-4' });
  await flush();
  await flush();

  expect(useUserStore.getState().user.dailyCalorieGoal).toBe(3000);
});

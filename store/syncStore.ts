import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { applySnapshot, pullSnapshot, pushSnapshot } from '@/services/cloudSync';
import { useDiaryStore } from '@/store/diaryStore';
import { useUserStore } from '@/store/userStore';

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

interface SyncState {
  session: Session | null;
  sessionChecked: boolean;
  status: SyncStatus;
  error: string | null;
  lastSyncedAt: string | null;
  init: () => void;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

let hasInitialized = false;
let applyingRemote = false;
let autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
let unsubscribers: (() => void)[] = [];
let lastHandledAccessToken: string | null = null;

function describeSyncError(err: unknown): string {
  console.error('[sync]', err);
  if (err && typeof err === 'object') {
    const { hint, message, details } = err as { hint?: string; message?: string; details?: string };
    return hint || message || details || 'Sync fehlgeschlagen';
  }
  return 'Sync fehlgeschlagen';
}

function scheduleAutoSync() {
  if (applyingRemote) return;
  if (autoSyncTimer) clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(() => {
    useSyncStore.getState().syncNow();
  }, 200);
}

function startAutoSyncWatchers() {
  stopAutoSyncWatchers();
  unsubscribers = [
    useUserStore.subscribe(scheduleAutoSync),
    useDiaryStore.subscribe(scheduleAutoSync),
  ];
}

function stopAutoSyncWatchers() {
  unsubscribers.forEach((unsub) => unsub());
  unsubscribers = [];
  if (autoSyncTimer) {
    clearTimeout(autoSyncTimer);
    autoSyncTimer = null;
  }
}

async function afterSessionEstablished(session: Session) {
  if (session.access_token === lastHandledAccessToken) return;
  lastHandledAccessToken = session.access_token;

  startAutoSyncWatchers();
  try {
    const remote = await pullSnapshot(session.user.id);
    if (remote) {
      applyingRemote = true;
      applySnapshot(remote);
      applyingRemote = false;
    }
    // No remote row yet: leave local state untouched instead of pushing it as the
    // account's canonical data — that would seed placeholder defaults into the cloud
    // before the user has actually filled in their profile.
    useSyncStore.setState({ status: 'synced', lastSyncedAt: remote ? new Date().toISOString() : null, error: null });
  } catch (err) {
    applyingRemote = false;
    useSyncStore.setState({ status: 'error', error: describeSyncError(err) });
  }
}

export const useSyncStore = create<SyncState>((set, get) => ({
  session: null,
  sessionChecked: false,
  status: 'offline',
  error: null,
  lastSyncedAt: null,

  init: () => {
    if (hasInitialized) return;
    hasInitialized = true;

    supabase.auth.onAuthStateChange((event, session) => {
      set({ session, sessionChecked: true });
      if (session) {
        // Only pull remote state on a genuine (re-)login, not on token refreshes or
        // user-metadata updates — those fire the same callback but must not overwrite
        // local edits made since the last sync.
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          set({ status: 'syncing', error: null });
          afterSessionEstablished(session);
        }
      } else {
        stopAutoSyncWatchers();
        set({ status: 'offline', lastSyncedAt: null, error: null });
      }
    });
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { needsEmailConfirmation: !data.session };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      set({ session: data.session, sessionChecked: true, status: 'syncing', error: null });
      await afterSessionEstablished(data.session);
    }
  },

  signOut: async () => {
    stopAutoSyncWatchers();
    await supabase.auth.signOut();
    set({ status: 'offline', lastSyncedAt: null, error: null });
  },

  syncNow: async () => {
    const { session } = get();
    if (!session) return;
    set({ status: 'syncing', error: null });
    try {
      await pushSnapshot(session.user.id);
      set({ status: 'synced', lastSyncedAt: new Date().toISOString() });
    } catch (err) {
      set({ status: 'error', error: describeSyncError(err) });
    }
  },
}));

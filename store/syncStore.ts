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
  startAutoSyncWatchers();
  try {
    const remote = await pullSnapshot(session.user.id);
    if (remote) {
      applyingRemote = true;
      applySnapshot(remote);
      applyingRemote = false;
    } else {
      await pushSnapshot(session.user.id);
    }
    useSyncStore.setState({ status: 'synced', lastSyncedAt: new Date().toISOString(), error: null });
  } catch (err) {
    applyingRemote = false;
    useSyncStore.setState({ status: 'error', error: err instanceof Error ? err.message : 'Sync fehlgeschlagen' });
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

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, sessionChecked: true });
      if (session) {
        set({ status: 'syncing', error: null });
        afterSessionEstablished(session);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
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
      set({ status: 'error', error: err instanceof Error ? err.message : 'Sync fehlgeschlagen' });
    }
  },
}));

import { create } from 'zustand';

export type ToastVariant = 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toast: Toast | null;
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: () => void;
}

let nextId = 0;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

const AUTO_DISMISS_MS = 4000;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,

  show: (message, variant = 'error') => {
    if (hideTimer) clearTimeout(hideTimer);
    const id = ++nextId;
    set({ toast: { id, message, variant } });
    hideTimer = setTimeout(() => {
      set((state) => (state.toast?.id === id ? { toast: null } : state));
    }, AUTO_DISMISS_MS);
  },

  dismiss: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ toast: null });
  },
}));

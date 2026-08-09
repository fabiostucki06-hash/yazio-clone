import { router } from 'expo-router';
import { AlertCircle, Check, Cloud, LogOut } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useSyncStore } from '@/store/syncStore';

export function CloudSyncCard() {
  const session = useSyncStore((state) => state.session);
  const status = useSyncStore((state) => state.status);
  const error = useSyncStore((state) => state.error);
  const signOut = useSyncStore((state) => state.signOut);
  const syncNow = useSyncStore((state) => state.syncNow);

  if (!session) return null;

  async function handleSignOut() {
    await signOut();
    router.replace('/onboarding');
  }

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100/70 dark:bg-white/5">
            {status === 'syncing' ? (
              <ActivityIndicator size="small" color="#f59e0b" />
            ) : status === 'error' ? (
              <AlertCircle color="#ef4444" size={18} />
            ) : status === 'synced' ? (
              <Check color="#10b981" size={18} />
            ) : (
              <Cloud color="#64748b" size={18} />
            )}
          </View>
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cloud-Sync</Text>
        </View>

        <Pressable
          onPress={handleSignOut}
          className="h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5"
        >
          <LogOut color="#64748b" size={18} />
        </Pressable>
      </View>

      {status === 'error' ? (
        <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-red-200/60 bg-red-50/70 px-3 py-2 dark:border-red-500/20 dark:bg-red-500/10">
          <Text className="flex-1 text-xs text-red-600 dark:text-red-400" numberOfLines={2}>
            {error ?? 'Sync fehlgeschlagen'}
          </Text>
          <Pressable
            onPress={() => syncNow()}
            className="rounded-xl border border-red-300/60 bg-white/70 px-3 py-1.5 active:opacity-80 dark:border-red-500/30 dark:bg-white/5"
          >
            <Text className="text-xs font-semibold text-red-600 dark:text-red-400">Erneut versuchen</Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

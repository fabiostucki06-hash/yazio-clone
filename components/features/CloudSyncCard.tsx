import { router } from 'expo-router';
import { AlertCircle, Check, Cloud, LogOut, RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSyncStore } from '@/store/syncStore';

function formatSyncTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function CloudSyncCard() {
  const session = useSyncStore((state) => state.session);
  const status = useSyncStore((state) => state.status);
  const error = useSyncStore((state) => state.error);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const signOut = useSyncStore((state) => state.signOut);
  const syncNow = useSyncStore((state) => state.syncNow);

  if (!session) return null;

  async function handleSignOut() {
    await signOut();
    router.replace('/onboarding');
  }

  const statusMeta: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    syncing: { icon: <RefreshCw color="#f59e0b" size={18} />, label: 'Synchronisiere…', color: 'text-amber-600 dark:text-amber-400' },
    synced: {
      icon: <Check color="#10b981" size={18} />,
      label: lastSyncedAt ? `Daten synchronisiert ✅ · ${formatSyncTime(lastSyncedAt)}` : 'Daten synchronisiert ✅',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    error: { icon: <AlertCircle color="#ef4444" size={18} />, label: error ?? 'Fehler beim Synchronisieren', color: 'text-red-500' },
    offline: { icon: <Cloud color="#64748b" size={18} />, label: 'Noch nicht synchronisiert', color: 'text-slate-500 dark:text-slate-400' },
  };
  const meta = statusMeta[status] ?? statusMeta.offline;

  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100/70 dark:bg-white/5">
          {status === 'syncing' ? <ActivityIndicator size="small" color="#f59e0b" /> : meta.icon}
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cloud-Sync</Text>
          <Text className={`text-sm font-medium ${meta.color}`}>{meta.label}</Text>
        </View>
      </View>

      <Text className="text-xs text-slate-400" numberOfLines={1}>
        {session.user.email}
      </Text>

      <View className="flex-row gap-3">
        <Button label="Jetzt manuell synchronisieren" onPress={() => syncNow()} disabled={status === 'syncing'} className="flex-1" />
        <Pressable
          onPress={handleSignOut}
          className="h-[50px] w-[50px] items-center justify-center rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5"
        >
          <LogOut color="#64748b" size={18} />
        </Pressable>
      </View>
    </Card>
  );
}

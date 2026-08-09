import { AlertCircle, Check, Cloud, CloudOff, LogOut, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useSyncStore } from '@/store/syncStore';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatSyncTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function CloudSyncCard() {
  const session = useSyncStore((state) => state.session);
  const status = useSyncStore((state) => state.status);
  const error = useSyncStore((state) => state.error);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const signUp = useSyncStore((state) => state.signUp);
  const signIn = useSyncStore((state) => state.signIn);
  const signOut = useSyncStore((state) => state.signOut);
  const syncNow = useSyncStore((state) => state.syncNow);

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const trimmedEmail = email.trim();
  const isFormValid = EMAIL_PATTERN.test(trimmedEmail) && password.length >= 6;

  async function handleSubmit() {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setFormError(null);
    setConfirmationSent(false);
    try {
      if (mode === 'signUp') {
        const { needsEmailConfirmation } = await signUp(trimmedEmail, password);
        if (needsEmailConfirmation) {
          setConfirmationSent(true);
        }
      } else {
        await signIn(trimmedEmail, password);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <Card className="gap-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100/70 dark:bg-white/5">
            <CloudOff color="#64748b" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cloud-Sync</Text>
            <Text className="text-xs text-slate-400">Melde dich an, um deinen Fortschritt geräteübergreifend zu speichern.</Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setMode('signIn')}
            className={`flex-1 items-center rounded-full border px-4 py-2 ${
              mode === 'signIn' ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-white/60 bg-white/70 dark:border-white/10 dark:bg-white/5'
            }`}
          >
            <Text className={`text-sm font-medium ${mode === 'signIn' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
              Anmelden
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('signUp')}
            className={`flex-1 items-center rounded-full border px-4 py-2 ${
              mode === 'signUp' ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-white/60 bg-white/70 dark:border-white/10 dark:bg-white/5'
            }`}
          >
            <Text className={`text-sm font-medium ${mode === 'signUp' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
              Registrieren
            </Text>
          </Pressable>
        </View>

        <TextField
          label="E-Mail-Adresse"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="max@beispiel.de"
        />
        <TextField label="Passwort" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mind. 6 Zeichen" />

        {formError && <Text className="text-xs text-red-500">{formError}</Text>}
        {confirmationSent && (
          <Text className="text-xs text-emerald-600 dark:text-emerald-400">
            Bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben, und melde dich anschließend an.
          </Text>
        )}

        <Button
          label={mode === 'signUp' ? 'Konto erstellen' : 'Anmelden'}
          onPress={handleSubmit}
          disabled={!isFormValid || submitting}
          loading={submitting}
        />
      </Card>
    );
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
        <Button
          label="Jetzt manuell synchronisieren"
          onPress={() => syncNow()}
          disabled={status === 'syncing'}
          className="flex-1"
        />
        <Pressable
          onPress={() => signOut()}
          className="h-[50px] w-[50px] items-center justify-center rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5"
        >
          <LogOut color="#64748b" size={18} />
        </Pressable>
      </View>
    </Card>
  );
}

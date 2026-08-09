import { Play, Square, Utensils } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { FASTING_PLANS, useFastingStore } from '@/store/fastingStore';
import type { FastingPlanId } from '@/types';

const RING_SIZE = 220;
const RING_STROKE = 18;
const FASTING_COLOR = '#10b981';
const EATING_COLOR = '#f59e0b';

function formatDuration(totalSeconds: number): string {
  const clamped = Math.max(totalSeconds, 0);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = Math.floor(clamped % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function FastenScreen() {
  const selectedPlanId = useFastingStore((state) => state.selectedPlanId);
  const session = useFastingStore((state) => state.session);
  const selectPlan = useFastingStore((state) => state.selectPlan);
  const startFasting = useFastingStore((state) => state.startFasting);
  const startEating = useFastingStore((state) => state.startEating);
  const stopSession = useFastingStore((state) => state.stopSession);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session]);

  const plan = FASTING_PLANS.find((p) => p.id === (session?.planId ?? selectedPlanId)) ?? FASTING_PLANS[0];
  const windowHours = session ? (session.isFasting ? plan.fastingHours : plan.eatingHours) : plan.fastingHours;
  const windowSeconds = windowHours * 3600;

  const elapsedSeconds = session ? Math.max((now - new Date(session.startedAt).getTime()) / 1000, 0) : 0;
  const remainingSeconds = Math.max(windowSeconds - elapsedSeconds, 0);
  const progress = session ? Math.min(elapsedSeconds / windowSeconds, 1) : 0;
  const isWindowComplete = session ? elapsedSeconds >= windowSeconds : false;

  const ringColor = session?.isFasting || !session ? FASTING_COLOR : EATING_COLOR;

  function handlePrimaryAction() {
    if (!session) {
      startFasting();
      return;
    }
    if (session.isFasting) {
      startEating();
    } else {
      startFasting();
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-background-dark">
      <ScrollView className="flex-1" contentContainerClassName="gap-6 px-6 pt-4 pb-12">
        <View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Fasten</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">Intervallfasten</Text>
        </View>

        <View className="flex-row gap-3">
          {FASTING_PLANS.map((p) => {
            const isSelected = p.id === selectedPlanId;
            return (
              <Pressable
                key={p.id}
                disabled={!!session}
                onPress={() => selectPlan(p.id as FastingPlanId)}
                className={`flex-1 items-center gap-1 rounded-2xl border-2 px-3 py-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'border-transparent bg-white dark:bg-slate-800'
                } ${session ? 'opacity-50' : ''}`}
              >
                <Text
                  className={`text-base font-bold ${
                    isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {p.label}
                </Text>
                <Text className="text-[11px] text-slate-400">
                  {p.id === '5:2' ? '2 Fastentage/Woche' : `${p.fastingHours}h Fasten`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Card className="items-center gap-4 rounded-3xl p-6">
          <ProgressRing size={RING_SIZE} strokeWidth={RING_STROKE} progress={progress} color={ringColor}>
            <Text className="text-4xl font-bold tabular-nums text-slate-900 dark:text-white">
              {formatDuration(remainingSeconds)}
            </Text>
            <Text className="mt-1 text-xs text-slate-400">
              {!session
                ? `Bereit für ${plan.label}`
                : isWindowComplete
                  ? session.isFasting
                    ? 'Fastenfenster abgeschlossen'
                    : 'Essensfenster abgeschlossen'
                  : session.isFasting
                    ? 'Fastenfenster läuft'
                    : 'Essensfenster läuft'}
            </Text>
          </ProgressRing>

          <View className="w-full gap-3">
            {!session ? (
              <Button label="Fasten starten" icon={<Play color="#ffffff" size={16} />} onPress={handlePrimaryAction} />
            ) : (
              <>
                <Button
                  label={session.isFasting ? 'Essensfenster starten' : 'Fasten fortsetzen'}
                  icon={<Utensils color="#ffffff" size={16} />}
                  onPress={handlePrimaryAction}
                />
                <Button label="Beenden" variant="secondary" icon={<Square color="#10b981" size={16} />} onPress={stopSession} />
              </>
            )}
          </View>
        </Card>

        <Card className="gap-3">
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Plan-Details</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600 dark:text-slate-300">Fasten</Text>
            <Text className="text-sm font-semibold text-slate-900 dark:text-white">{plan.fastingHours}h</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-600 dark:text-slate-300">Essen</Text>
            <Text className="text-sm font-semibold text-slate-900 dark:text-white">{plan.eatingHours}h</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

import { Coffee, CupSoda, Droplet, GlassWater, Pencil } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { TextField } from '@/components/ui/TextField';
import { useDiaryStore, todayKey } from '@/store/diaryStore';
import { useUserStore } from '@/store/userStore';
import type { DrinkType } from '@/types';

interface IconProps {
  color?: string;
  size?: number;
}

const DRINK_META: { type: DrinkType; label: string; ml: number; color: string; Icon: ComponentType<IconProps> }[] = [
  { type: 'water', label: 'Wasser', ml: 250, color: '#0ea5e9', Icon: Droplet },
  { type: 'coffee', label: 'Kaffee', ml: 200, color: '#92400e', Icon: Coffee },
  { type: 'juice', label: 'Saft', ml: 200, color: '#f97316', Icon: GlassWater },
  { type: 'soda', label: 'Softdrink', ml: 330, color: '#db2777', Icon: CupSoda },
];

const DEFAULT_WATER_GOAL_ML = 2500;

export function DrinkTracker() {
  const date = todayKey();
  const totalMl = useDiaryStore((state) => state.getTotalWaterMlForDate(date));
  const addDrink = useDiaryStore((state) => state.addDrink);
  const waterGoalMl = useUserStore((state) => state.user.waterGoalMl ?? DEFAULT_WATER_GOAL_ML);
  const setWaterGoal = useUserStore((state) => state.setWaterGoal);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String((waterGoalMl / 1000).toFixed(1)));

  const pct = waterGoalMl > 0 ? Math.min(totalMl / waterGoalMl, 1) : 0;
  const liters = (totalMl / 1000).toFixed(2);
  const goalLiters = (waterGoalMl / 1000).toFixed(1);

  function handleSaveGoal() {
    const parsed = Number.parseFloat(goalInput.replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) {
      setWaterGoal(Math.round(parsed * 1000));
    }
    setIsEditingGoal(false);
  }

  return (
    <View className="gap-4 rounded-[28px] border border-white/60 bg-white/70 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
            <Droplet color="#0ea5e9" size={18} />
          </View>
          <View>
            <Text className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Wasser & Getränke</Text>
            <Text className="text-xs text-slate-400">
              {liters} L von {goalLiters} L
            </Text>
          </View>
        </View>

        {isEditingGoal ? (
          <View className="flex-row items-center gap-2">
            <View className="w-20">
              <TextField
                keyboardType="decimal-pad"
                value={goalInput}
                onChangeText={setGoalInput}
                suffix="L"
                autoFocus
              />
            </View>
            <Pressable
              className="rounded-full bg-emerald-500 px-3 py-2 shadow-md shadow-emerald-500/30 active:opacity-90 active:bg-emerald-600"
              onPress={handleSaveGoal}
            >
              <Text className="text-xs font-semibold text-white">OK</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-full border border-slate-200/50 bg-slate-100/60 backdrop-blur-md active:opacity-80 dark:border-white/10 dark:bg-white/5"
            onPress={() => {
              setGoalInput(String((waterGoalMl / 1000).toFixed(1)));
              setIsEditingGoal(true);
            }}
          >
            <Pencil color="#64748b" size={14} />
          </Pressable>
        )}
      </View>

      <ProgressBar progress={pct} color="#0ea5e9" />

      <View className="flex-row flex-wrap gap-2">
        {DRINK_META.map(({ type, label, ml, color, Icon }) => (
          <Pressable
            key={type}
            className="flex-1 basis-[47%] flex-row items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 active:opacity-80"
            style={{ backgroundColor: `${color}14`, borderColor: `${color}33` }}
            onPress={() => addDrink(date, type, ml)}
          >
            <Icon color={color} size={16} />
            <Text className="text-xs font-semibold" style={{ color }}>
              {label} +{ml}ml
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

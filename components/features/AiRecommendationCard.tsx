import { Sparkles } from 'lucide-react-native';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import type { Macros, NutrientVisibility } from '@/types';
import { generateRecommendation, getTimeOfDay } from '@/utils/recommendationEngine';

interface AiRecommendationCardProps {
  remainingCalories: number;
  remainingMacros: Macros;
  visibleNutrients: NutrientVisibility;
}

export function AiRecommendationCard({ remainingCalories, remainingMacros, visibleNutrients }: AiRecommendationCardProps) {
  const recommendation = useMemo(
    () =>
      generateRecommendation(getTimeOfDay(), remainingCalories, remainingMacros, {
        protein: visibleNutrients.protein,
        carbs: visibleNutrients.carbs,
        fat: visibleNutrients.fat,
      }),
    [remainingCalories, remainingMacros, visibleNutrients.protein, visibleNutrients.carbs, visibleNutrients.fat],
  );

  return (
    <View className="gap-3 rounded-[28px] border border-white/20 bg-emerald-500/90 p-4 shadow-2xl shadow-emerald-500/30 backdrop-blur-xl">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
          <Sparkles color="#ffffff" size={18} />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
            {recommendation.timeLabel} · Coach imi Tipp
          </Text>
          <Text className="text-sm font-bold tracking-tight text-white">{recommendation.headline}</Text>
        </View>
      </View>
      <Text className="text-sm leading-5 text-white/90">{recommendation.suggestion}</Text>
    </View>
  );
}

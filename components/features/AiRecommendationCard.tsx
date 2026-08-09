import { Sparkles } from 'lucide-react-native';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import type { Macros } from '@/types';
import { generateRecommendation, getTimeOfDay } from '@/utils/recommendationEngine';

interface AiRecommendationCardProps {
  remainingCalories: number;
  remainingMacros: Macros;
}

export function AiRecommendationCard({ remainingCalories, remainingMacros }: AiRecommendationCardProps) {
  const recommendation = useMemo(
    () => generateRecommendation(getTimeOfDay(), remainingCalories, remainingMacros),
    [remainingCalories, remainingMacros],
  );

  return (
    <View className="gap-3 rounded-3xl bg-emerald-500 p-4 shadow-md">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Sparkles color="#ffffff" size={18} />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
            {recommendation.timeLabel} · KI-Empfehlung
          </Text>
          <Text className="text-sm font-bold text-white">{recommendation.headline}</Text>
        </View>
      </View>
      <Text className="text-sm leading-5 text-white/90">{recommendation.suggestion}</Text>
    </View>
  );
}

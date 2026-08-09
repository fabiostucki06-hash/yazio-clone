import type { Macros } from '@/types';

export type TimeOfDay = 'morning' | 'midday' | 'evening';

export interface Recommendation {
  timeLabel: string;
  headline: string;
  suggestion: string;
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: 'Morgens',
  midday: 'Mittags',
  evening: 'Abends',
};

const SUGGESTIONS_BY_MACRO: Record<'protein' | 'carbs' | 'fat', Record<TimeOfDay, string>> = {
  protein: {
    morning: 'Rührei mit Hüttenkäse',
    midday: 'Hähnchenbrust mit Quinoa',
    evening: 'Magerquark mit Beeren',
  },
  carbs: {
    morning: 'Haferflocken mit Banane',
    midday: 'Vollkornreis mit Gemüse',
    evening: 'Vollkornbrot mit Honig',
  },
  fat: {
    morning: 'Avocado-Toast',
    midday: 'Nüsse & Olivenöl-Dressing',
    evening: 'Ein Stück Käse mit Nüssen',
  },
};

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'midday';
  return 'evening';
}

export function generateRecommendation(
  timeOfDay: TimeOfDay,
  remainingCalories: number,
  remainingMacros: Macros,
): Recommendation {
  const timeLabel = TIME_LABELS[timeOfDay];

  if (remainingCalories <= 0) {
    return {
      timeLabel,
      headline: 'Tagesziel erreicht',
      suggestion: 'Du hast dein Kalorienziel bereits erreicht. Gönn deinem Körper jetzt lieber Ruhe statt Essen.',
    };
  }

  const gaps: { key: 'protein' | 'carbs' | 'fat'; remaining: number }[] = [
    { key: 'protein', remaining: Math.max(remainingMacros.protein, 0) },
    { key: 'carbs', remaining: Math.max(remainingMacros.carbs, 0) },
    { key: 'fat', remaining: Math.max(remainingMacros.fat, 0) },
  ];

  const topGap = gaps.reduce((max, gap) => (gap.remaining > max.remaining ? gap : max), gaps[0]);
  const macroLabel = topGap.key === 'protein' ? 'Protein' : topGap.key === 'carbs' ? 'Kohlenhydrate' : 'Fett';
  const suggestion = SUGGESTIONS_BY_MACRO[topGap.key][timeOfDay];

  return {
    timeLabel,
    headline: `Noch ${Math.round(topGap.remaining)}g ${macroLabel} übrig`,
    suggestion: `${suggestion} passt gut zu den verbleibenden ${Math.round(remainingCalories)} kcal.`,
  };
}

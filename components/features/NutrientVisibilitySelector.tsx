import { Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';

import { NUTRIENT_CATEGORY_LABELS, NUTRIENT_CATEGORY_ORDER, NUTRIENT_META, NUTRIENT_ORDER } from '@/components/features/nutrientMeta';
import type { NutrientKey, NutrientVisibility } from '@/types';

interface NutrientVisibilitySelectorProps {
  visibleNutrients: NutrientVisibility;
  onToggle: (key: NutrientKey) => void;
}

export function NutrientVisibilitySelector({ visibleNutrients, onToggle }: NutrientVisibilitySelectorProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const visibleCount = NUTRIENT_ORDER.filter((key) => visibleNutrients[key]).length;

  const groups = useMemo(() => {
    return NUTRIENT_CATEGORY_ORDER.map((category) => ({
      category,
      keys: NUTRIENT_ORDER.filter(
        (key) => NUTRIENT_META[key].category === category && NUTRIENT_META[key].label.toLowerCase().includes(normalizedQuery),
      ),
    })).filter((group) => group.keys.length > 0);
  }, [normalizedQuery]);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sichtbare Nährstoffe</Text>
        <Text className="text-xs text-slate-400">{visibleCount} ausgewählt</Text>
      </View>

      <View className="flex-row items-center gap-2 rounded-2xl border border-slate-200/60 bg-slate-100/70 px-4 py-2.5 transition-shadow duration-200 ease-in-out dark:border-slate-800/60 dark:bg-white/5">
        <Search color="#94a3b8" size={16} />
        <TextInput
          className="flex-1 text-sm text-slate-900 dark:text-white"
          placeholder="Nährstoff suchen..."
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Suche leeren"
            className="h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 transition-colors duration-150 ease-in-out active:opacity-70 dark:bg-white/10"
          >
            <X color="#64748b" size={11} />
          </Pressable>
        )}
      </View>

      {groups.length === 0 ? (
        <Text className="py-4 text-center text-sm text-slate-400">Kein Nährstoff gefunden.</Text>
      ) : (
        groups.map(({ category, keys }) => (
          <View key={category} className="gap-1">
            <Text className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {NUTRIENT_CATEGORY_LABELS[category]}
            </Text>
            {keys.map((key, index) => {
              const { label, Icon, color } = NUTRIENT_META[key];
              return (
                <View
                  key={key}
                  className={`flex-row items-center justify-between py-3 ${
                    index > 0 ? 'border-t border-slate-200/50 dark:border-slate-800/60' : ''
                  }`}
                >
                  <View className="flex-1 flex-row items-center gap-3 pr-3">
                    <Icon color={color} size={18} />
                    <Text className="flex-1 text-sm text-slate-700 dark:text-slate-200">{label}</Text>
                  </View>
                  <Switch
                    value={visibleNutrients[key] ?? false}
                    onValueChange={() => onToggle(key)}
                    trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                    thumbColor="#ffffff"
                  />
                </View>
              );
            })}
          </View>
        ))
      )}
    </View>
  );
}

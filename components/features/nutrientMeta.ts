import { Candy, Citrus, Droplet, Egg, Leaf, Waves, Wheat } from 'lucide-react-native';
import type { ComponentType } from 'react';

import type { NutrientKey } from '@/types';

interface IconProps {
  color?: string;
  size?: number;
}

export interface NutrientMeta {
  label: string;
  unit: string;
  color: string;
  Icon: ComponentType<IconProps>;
}

export const NUTRIENT_META: Record<NutrientKey, NutrientMeta> = {
  carbs: { label: 'Carbs', unit: 'g', color: '#3b82f6', Icon: Wheat },
  protein: { label: 'Protein', unit: 'g', color: '#ef4444', Icon: Egg },
  fat: { label: 'Fett', unit: 'g', color: '#f59e0b', Icon: Droplet },
  fiber: { label: 'Ballaststoffe', unit: 'g', color: '#84cc16', Icon: Leaf },
  sugar: { label: 'Zucker', unit: 'g', color: '#ec4899', Icon: Candy },
  sodium: { label: 'Natrium', unit: 'mg', color: '#64748b', Icon: Waves },
  vitaminC: { label: 'Vitamin C', unit: 'mg', color: '#f97316', Icon: Citrus },
};

export const NUTRIENT_ORDER: NutrientKey[] = ['carbs', 'protein', 'fat', 'fiber', 'sugar', 'sodium', 'vitaminC'];

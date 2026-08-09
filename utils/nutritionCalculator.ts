import type { Macros, Micronutrients, NutrientVisibility } from '../types';

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type Goal = 'weight_loss' | 'maintain' | 'muscle_gain';

export interface BMRInput {
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const GOAL_ADJUSTMENTS_KCAL: Record<Goal, number> = {
  weight_loss: -500,
  maintain: 0,
  muscle_gain: 300,
};

const MACRO_SPLIT = {
  protein: { ratio: 0.3, kcalPerGram: 4 },
  carbs: { ratio: 0.4, kcalPerGram: 4 },
  fat: { ratio: 0.3, kcalPerGram: 9 },
} as const;

/** Mifflin-St Jeor formula. */
export function calculateBMR({ age, gender, weightKg, heightCm }: BMRInput): number {
  if (age <= 0) throw new Error('age must be greater than 0');
  if (weightKg <= 0) throw new Error('weightKg must be greater than 0');
  if (heightCm <= 0) throw new Error('heightCm must be greater than 0');

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return Math.round(base + 5);
  if (gender === 'female') return Math.round(base - 161);
  throw new Error(`Unsupported gender: ${gender}`);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  if (bmr <= 0) throw new Error('bmr must be greater than 0');
  const factor = ACTIVITY_FACTORS[activityLevel];
  if (factor === undefined) throw new Error(`Unsupported activity level: ${activityLevel}`);
  return Math.round(bmr * factor);
}

export function calculateDailyTargets(tdee: number, goal: Goal): number {
  if (tdee <= 0) throw new Error('tdee must be greater than 0');
  const adjustment = GOAL_ADJUSTMENTS_KCAL[goal];
  if (adjustment === undefined) throw new Error(`Unsupported goal: ${goal}`);
  return Math.round(tdee + adjustment);
}

export function calculateMacros(calories: number): Macros {
  if (calories <= 0) throw new Error('calories must be greater than 0');
  return {
    protein: Math.round((calories * MACRO_SPLIT.protein.ratio) / MACRO_SPLIT.protein.kcalPerGram),
    carbs: Math.round((calories * MACRO_SPLIT.carbs.ratio) / MACRO_SPLIT.carbs.kcalPerGram),
    fat: Math.round((calories * MACRO_SPLIT.fat.ratio) / MACRO_SPLIT.fat.kcalPerGram),
  };
}

/** Reference daily intake used as the progress-bar goal for each micronutrient. */
export const MICRONUTRIENT_GOALS: Micronutrients = {
  fiber: 30,
  sugar: 50,
  sodium: 2300,
  vitaminC: 90,
};

export const DEFAULT_VISIBLE_NUTRIENTS: NutrientVisibility = {
  carbs: true,
  protein: true,
  fat: true,
  fiber: false,
  sugar: false,
  sodium: false,
  vitaminC: false,
};

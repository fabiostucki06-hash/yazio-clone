import type { ActivityLevel, Gender, Goal } from '@/utils/nutritionCalculator';

export interface Macros {
  carbs: number;
  protein: number;
  fat: number;
}

export interface Micronutrients {
  fiber: number;
  sugar: number;
  sodium: number;
  vitaminC: number;
}

export type NutrientKey = keyof Macros | keyof Micronutrients;

export type NutrientVisibility = Record<NutrientKey, boolean>;

export interface User {
  id: string;
  name: string;
  email: string;
  dailyCalorieGoal: number;
  dailyMacroGoal: Macros;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  goal?: Goal;
  waterGoalMl?: number;
  visibleNutrients: NutrientVisibility;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  caloriesPerServing: number;
  macrosPerServing: Macros;
  micronutrientsPerServing: Micronutrients;
  servingSize: number;
  servingUnit: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  mealType: MealType;
  servings: number;
  loggedAt: string;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  entries: MealEntry[];
  totalCalories: number;
  totalMacros: Macros;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
}

export type DrinkType = 'water' | 'coffee' | 'juice' | 'soda';

export interface DrinkEntry {
  id: string;
  type: DrinkType;
  ml: number;
  loggedAt: string;
}

export interface Macros {
  carbs: number;
  protein: number;
  fat: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  dailyCalorieGoal: number;
  dailyMacroGoal: Macros;
  weightKg?: number;
  heightCm?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  caloriesPerServing: number;
  macrosPerServing: Macros;
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

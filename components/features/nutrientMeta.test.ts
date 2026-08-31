jest.mock('lucide-react-native', () => new Proxy({}, { get: () => 'Icon' }));

import type { FoodItem, MealEntry } from '@/types';

import { sumEntryNutrients } from './nutrientMeta';

function makeEntry(overrides: Partial<FoodItem>, servings: number): MealEntry {
  const foodItem: FoodItem = {
    id: 'food',
    name: 'Testfood',
    caloriesPerServing: 100,
    macrosPerServing: { carbs: 10, protein: 5, fat: 2 },
    micronutrientsPerServing: {},
    servingSize: 100,
    servingUnit: 'g',
    ...overrides,
  };
  return { id: 'entry', foodItem, mealType: 'breakfast', servings, loggedAt: '2026-01-01T00:00:00.000Z' };
}

it('scales macros and reported micronutrients by servings', () => {
  const entry = makeEntry({ micronutrientsPerServing: { fiber: 4, vitaminC: 10 } }, 2);
  const totals = sumEntryNutrients([entry]);

  expect(totals.carbs).toBe(20);
  expect(totals.protein).toBe(10);
  expect(totals.fat).toBe(4);
  expect(totals.fiber).toBe(8);
  expect(totals.vitaminC).toBe(20);
});

it('treats a nutrient the food item does not report as 0, not NaN', () => {
  const entry = makeEntry({ micronutrientsPerServing: { fiber: 4 } }, 3);
  const totals = sumEntryNutrients([entry]);

  expect(totals.iron).toBe(0);
  expect(totals.vitaminB12).toBe(0);
  expect(Number.isNaN(totals.iron)).toBe(false);
});

it('sums across multiple entries', () => {
  const entries = [
    makeEntry({ micronutrientsPerServing: { calcium: 50 } }, 1),
    makeEntry({ micronutrientsPerServing: { calcium: 20 } }, 2),
  ];
  const totals = sumEntryNutrients(entries);

  expect(totals.calcium).toBe(90);
  expect(totals.carbs).toBe(30);
});

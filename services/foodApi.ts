import type { FoodItem } from '@/types';

const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';

export class FoodApiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'FoodApiError';
  }
}

export class ProductNotFoundError extends FoodApiError {
  constructor(identifier: string) {
    super(`Produkt nicht gefunden: ${identifier}`);
    this.name = 'ProductNotFoundError';
  }
}

interface OffNutriments {
  'energy-kcal_100g'?: number;
  'energy-kcal'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;
  'vitamin-c_100g'?: number;
}

interface OffProduct {
  code?: string;
  id?: string;
  product_name?: string;
  product_name_de?: string;
  brands?: string;
  nutriments?: OffNutriments;
}

interface OffSearchResponse {
  products?: OffProduct[];
}

interface OffProductResponse {
  status: number;
  product?: OffProduct;
}

function normalizeFoodItem(product: OffProduct, fallbackId: string): FoodItem {
  const nutriments = product.nutriments ?? {};
  const calories = nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0;

  return {
    id: product.code ?? product.id ?? fallbackId,
    name: product.product_name_de || product.product_name || 'Unbekanntes Produkt',
    brand: product.brands || undefined,
    caloriesPerServing: Math.round(calories),
    macrosPerServing: {
      carbs: nutriments.carbohydrates_100g ?? 0,
      protein: nutriments.proteins_100g ?? 0,
      fat: nutriments.fat_100g ?? 0,
    },
    micronutrientsPerServing: {
      fiber: nutriments.fiber_100g ?? 0,
      sugar: nutriments.sugars_100g ?? 0,
      sodium: (nutriments.sodium_100g ?? 0) * 1000,
      vitaminC: (nutriments['vitamin-c_100g'] ?? 0) * 1000,
    },
    servingSize: 100,
    servingUnit: 'g',
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new FoodApiError('Netzwerkfehler: Open Food Facts konnte nicht erreicht werden.', error);
  }

  if (!response.ok) {
    throw new FoodApiError(`Open Food Facts antwortete mit Status ${response.status}.`);
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new FoodApiError('Antwort von Open Food Facts konnte nicht gelesen werden.', error);
  }
}

export async function searchFood(query: string): Promise<FoodItem[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const url = `${SEARCH_URL}?search_terms=${encodeURIComponent(trimmedQuery)}&search_simple=1&action=process&json=1&page_size=25`;
  const data = await fetchJson<OffSearchResponse>(url);
  const products = data.products ?? [];

  return products
    .filter((product) => product.product_name || product.product_name_de)
    .map((product, index) => normalizeFoodItem(product, `search-${index}`));
}

export async function getFoodByBarcode(barcode: string): Promise<FoodItem> {
  const trimmedBarcode = barcode.trim();
  if (!trimmedBarcode) {
    throw new FoodApiError('Barcode darf nicht leer sein.');
  }

  const url = `${PRODUCT_URL}/${encodeURIComponent(trimmedBarcode)}.json`;
  const data = await fetchJson<OffProductResponse>(url);

  if (data.status !== 1 || !data.product) {
    throw new ProductNotFoundError(trimmedBarcode);
  }

  return normalizeFoodItem(data.product, trimmedBarcode);
}

import type { Macros, Micronutrients } from '@/types';

export interface VisionAnalysisResult {
  name: string;
  estimatedGrams: number;
  caloriesPer100g: number;
  macrosPer100g: Macros;
  micronutrientsPer100g: Micronutrients;
  source: 'ai' | 'fallback';
}

// Set via EXPO_PUBLIC_OPENAI_API_KEY at build time to enable real Vision analysis.
// Client-exposed by design (EXPO_PUBLIC_ vars ship in the JS bundle) - only use a
// low-scoped/throwaway key, never a production secret, for this demo integration.
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const ANALYSIS_SCHEMA_PROMPT =
  'Du bist ein Ernährungsexperte. Analysiere das Foto einer Mahlzeit: erkenne das Gericht, schätze die ' +
  'Portionsgröße in Gramm und die Nährwerte pro 100g. Antworte ausschließlich mit kompaktem JSON in genau ' +
  'diesem Schema, ohne weitere Erklärung: {"name": string, "estimatedGrams": number, "caloriesPer100g": number, ' +
  '"carbsPer100g": number, "proteinPer100g": number, "fatPer100g": number, "fiberPer100g": number, ' +
  '"sugarPer100g": number, "sodiumPer100gMg": number, "vitaminCPer100gMg": number}';

interface OpenAiVisionJson {
  name?: string;
  estimatedGrams?: number;
  caloriesPer100g?: number;
  carbsPer100g?: number;
  proteinPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  sugarPer100g?: number;
  sodiumPer100gMg?: number;
  vitaminCPer100gMg?: number;
}

function toNonNegative(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && (value as number) >= 0 ? (value as number) : fallback;
}

async function analyzeWithOpenAi(base64Image: string): Promise<VisionAnalysisResult> {
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      max_tokens: 400,
      messages: [
        { role: 'system', content: ANALYSIS_SCHEMA_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analysiere diese Mahlzeit.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Vision-API antwortete mit Status ${response.status}.`);
  }

  const data = await response.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Keine Antwort von der Vision-API erhalten.');
  }

  const parsed = JSON.parse(content) as OpenAiVisionJson;

  return {
    name: parsed.name?.trim() || 'Erkannte Mahlzeit',
    estimatedGrams: toNonNegative(parsed.estimatedGrams, 200),
    caloriesPer100g: toNonNegative(parsed.caloriesPer100g, 0),
    macrosPer100g: {
      carbs: toNonNegative(parsed.carbsPer100g, 0),
      protein: toNonNegative(parsed.proteinPer100g, 0),
      fat: toNonNegative(parsed.fatPer100g, 0),
    },
    micronutrientsPer100g: {
      fiber: toNonNegative(parsed.fiberPer100g, 0),
      sugar: toNonNegative(parsed.sugarPer100g, 0),
      sodium: toNonNegative(parsed.sodiumPer100gMg, 0),
      vitaminC: toNonNegative(parsed.vitaminCPer100gMg, 0),
    },
    source: 'ai',
  };
}

/** Generic estimate used when no API key is configured or the Vision API call fails. */
function fallbackEstimate(): VisionAnalysisResult {
  return {
    name: 'Mahlzeit (Schätzung)',
    estimatedGrams: 250,
    caloriesPer100g: 220,
    macrosPer100g: { carbs: 24, protein: 10, fat: 9 },
    micronutrientsPer100g: { fiber: 3, sugar: 5, sodium: 280, vitaminC: 4 },
    source: 'fallback',
  };
}

export async function analyzeFoodPhoto(base64Image: string): Promise<VisionAnalysisResult> {
  if (!OPENAI_API_KEY) {
    return fallbackEstimate();
  }

  try {
    return await analyzeWithOpenAi(base64Image);
  } catch {
    return fallbackEstimate();
  }
}

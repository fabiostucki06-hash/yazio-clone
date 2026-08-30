import type { Macros, Micronutrients } from '@/types';

export interface DetectedFoodItem {
  name: string;
  cookingMethod: string | null;
  estimatedGrams: number;
  caloriesPer100g: number;
  macrosPer100g: Macros;
  micronutrientsPer100g: Micronutrients;
  confidence: number;
  needsVerification: boolean;
}

export interface VisionAnalysisResult {
  items: DetectedFoodItem[];
  notice: string | null;
  source: 'ai' | 'fallback';
}

class VisionAnalysisError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'VisionAnalysisError';
  }
}

// Set via EXPO_PUBLIC_OPENAI_API_KEY at build time to enable real Vision analysis.
// Client-exposed by design (EXPO_PUBLIC_ vars ship in the JS bundle) - only use a
// low-scoped/throwaway key, never a production secret, for this demo integration.
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const VISION_TIMEOUT_MS = 25000;
const LOW_CONFIDENCE_THRESHOLD = 0.55;

const ANALYSIS_SCHEMA_PROMPT = `Du bist ein Ernährungsexperte mit Fokus auf präzise Bildanalyse von Mahlzeiten.

Analysiere das Foto Stück für Stück, nicht als Ganzes:
1. Zerlege die Mahlzeit in ihre einzelnen erkennbaren Lebensmittel/Komponenten (z. B. "Hähnchenbrust", "Reis", "Brokkoli" statt nur "Teller mit Essen").
2. Bestimme für jede Komponente die Zubereitungsart (z. B. gebraten, gekocht, roh, frittiert), falls erkennbar.
3. Schätze für jede Komponente das Volumen/Gewicht in Gramm anhand von Referenzgrößen im Bild (Teller, Besteck, Hände).
4. Schätze für jede Komponente die Nährwerte pro 100g möglichst genau.
5. Gib für jede Komponente eine confidence zwischen 0 und 1 an, wie sicher du dir bei Erkennung UND Mengenschätzung bist.

Falls das Bild unscharf, zu dunkel, teilweise verdeckt oder anderweitig schwer auswertbar ist: gib trotzdem deine
beste konservative Schätzung ab (niemals verweigern), aber setze die confidence entsprechend niedrig und fülle
"qualityNotice" mit einem kurzen deutschen Hinweis, dass der Nutzer die Werte prüfen soll.

Falls das Bild klar erkennbar KEIN Lebensmittel zeigt, setze "isFoodImage" auf false und "items" auf ein leeres Array.

Antworte ausschließlich mit kompaktem JSON in genau diesem Schema, ohne weitere Erklärung, ohne Markdown:
{
  "isFoodImage": boolean,
  "qualityNotice": string | null,
  "items": [
    {
      "name": string,
      "cookingMethod": string | null,
      "estimatedGrams": number,
      "confidence": number,
      "caloriesPer100g": number,
      "carbsPer100g": number,
      "proteinPer100g": number,
      "fatPer100g": number,
      "fiberPer100g": number,
      "sugarPer100g": number,
      "sodiumPer100gMg": number,
      "vitaminCPer100gMg": number
    }
  ]
}`;

interface OpenAiVisionItemJson {
  name?: string;
  cookingMethod?: string | null;
  estimatedGrams?: number;
  confidence?: number;
  caloriesPer100g?: number;
  carbsPer100g?: number;
  proteinPer100g?: number;
  fatPer100g?: number;
  fiberPer100g?: number;
  sugarPer100g?: number;
  sodiumPer100gMg?: number;
  vitaminCPer100gMg?: number;
}

interface OpenAiVisionJson {
  isFoodImage?: boolean;
  qualityNotice?: string | null;
  items?: OpenAiVisionItemJson[];
}

function toNonNegative(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && (value as number) >= 0 ? (value as number) : fallback;
}

function toConfidence(value: number | undefined): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value as number));
}

function normalizeDetectedItem(raw: OpenAiVisionItemJson): DetectedFoodItem {
  const confidence = toConfidence(raw.confidence);
  return {
    name: raw.name?.trim() || 'Erkanntes Lebensmittel',
    cookingMethod: raw.cookingMethod?.trim() || null,
    estimatedGrams: toNonNegative(raw.estimatedGrams, 150),
    caloriesPer100g: toNonNegative(raw.caloriesPer100g, 0),
    macrosPer100g: {
      carbs: toNonNegative(raw.carbsPer100g, 0),
      protein: toNonNegative(raw.proteinPer100g, 0),
      fat: toNonNegative(raw.fatPer100g, 0),
    },
    micronutrientsPer100g: {
      fiber: toNonNegative(raw.fiberPer100g, 0),
      sugar: toNonNegative(raw.sugarPer100g, 0),
      sodium: toNonNegative(raw.sodiumPer100gMg, 0),
      vitaminC: toNonNegative(raw.vitaminCPer100gMg, 0),
    },
    confidence,
    needsVerification: confidence < LOW_CONFIDENCE_THRESHOLD,
  };
}

async function analyzeWithOpenAi(base64Image: string): Promise<VisionAnalysisResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(OPENAI_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        max_tokens: 900,
        temperature: 0.2,
        messages: [
          { role: 'system', content: ANALYSIS_SCHEMA_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analysiere diese Mahlzeit Komponente für Komponente.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' } },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new VisionAnalysisError('Zeitüberschreitung bei der Bildanalyse.', error);
    }
    throw new VisionAnalysisError('Netzwerkfehler bei der Bildanalyse.', error);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new VisionAnalysisError(`Vision-API antwortete mit Status ${response.status}.`);
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = await response.json();
  } catch (error) {
    throw new VisionAnalysisError('Antwort der Vision-API konnte nicht gelesen werden.', error);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new VisionAnalysisError('Keine Antwort von der Vision-API erhalten.');
  }

  let parsed: OpenAiVisionJson;
  try {
    parsed = JSON.parse(content) as OpenAiVisionJson;
  } catch (error) {
    throw new VisionAnalysisError('Antwort der Vision-API war kein gültiges JSON.', error);
  }

  if (parsed.isFoodImage === false || !parsed.items?.length) {
    return {
      items: [],
      notice: 'Kein Lebensmittel erkannt. Bitte ein anderes Foto wählen oder manuell hinzufügen.',
      source: 'ai',
    };
  }

  const items = parsed.items.map(normalizeDetectedItem);
  const hasLowConfidenceItem = items.some((item) => item.needsVerification);
  const notice =
    parsed.qualityNotice?.trim() ||
    (hasLowConfidenceItem ? 'Erkennung unsicher – bitte Mengen und Nährwerte vor dem Speichern prüfen.' : null);

  return { items, notice, source: 'ai' };
}

/** Generic estimate used when no API key is configured or the Vision API call fails. */
function fallbackEstimate(notice: string): VisionAnalysisResult {
  return {
    items: [
      {
        name: 'Mahlzeit (Schätzung)',
        cookingMethod: null,
        estimatedGrams: 250,
        caloriesPer100g: 220,
        macrosPer100g: { carbs: 24, protein: 10, fat: 9 },
        micronutrientsPer100g: { fiber: 3, sugar: 5, sodium: 280, vitaminC: 4 },
        confidence: 0.3,
        needsVerification: true,
      },
    ],
    notice,
    source: 'fallback',
  };
}

export async function analyzeFoodPhoto(base64Image: string): Promise<VisionAnalysisResult> {
  if (!OPENAI_API_KEY) {
    return fallbackEstimate('Keine KI-Analyse konfiguriert – bitte Schätzwerte anpassen.');
  }

  try {
    return await analyzeWithOpenAi(base64Image);
  } catch (error) {
    const message = error instanceof VisionAnalysisError ? error.message : 'Bildanalyse fehlgeschlagen.';
    return fallbackEstimate(`${message} Bitte Schätzwerte anpassen.`);
  }
}

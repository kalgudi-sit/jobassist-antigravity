import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

/**
 * Returns a lazy-initialized singleton instance of GoogleGenAI SDK client.
 * Does not crash at module load if the key is not set.
 */
export function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

/**
 * Safely extracts JSON from markdown backticks or raw text returned by LLMs.
 */
export function extractJsonFromText<T = any>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return JSON.parse(cleaned) as T;
}

export interface GeminiCallPromptOptions {
  prompt: string | any;
  config?: any;
  candidateModels?: string[];
  maxRetriesPerModel?: number;
}

/**
 * Resilient multi-tier Gemini caller with exponential backoff and model cascade.
 * Falls through 503 / 429 errors gracefully across official production models.
 */
export async function callGeminiWithRetryAndFallback(
  ai: GoogleGenAI,
  options: GeminiCallPromptOptions
): Promise<string | null> {
  const models = options.candidateModels && options.candidateModels.length > 0
    ? options.candidateModels
    : ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];

  const retries = options.maxRetriesPerModel ?? 2;

  for (const model of models) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.prompt,
          config: options.config
        });

        if (response && response.text && response.text.trim().length > 0) {
          return response.text;
        }
      } catch (err: any) {
        const errMsg = (err?.message || JSON.stringify(err)).toLowerCase();
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('high demand') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('timeout') ||
          errMsg.includes('rate limit');

        console.warn(`[Gemini API Warning] Model "${model}" (attempt ${attempt + 1}/${retries}) failed:`, err?.message || err);

        if (isTransient && attempt < retries - 1) {
          const delayMs = (attempt + 1) * 750;
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        break; // Try next fallback model
      }
    }
  }

  return null;
}

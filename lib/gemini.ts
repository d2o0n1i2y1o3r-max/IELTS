const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODEL = 'gemini-3.8-flash';

export interface GeminiOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  options: GeminiOptions = {}
): Promise<string> {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const body: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 1500,
        }
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      if (options.jsonMode) {
        body.generationConfig.responseMimeType = 'application/json';
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn(`Gemini (${model}) error ${res.status}:`, errData);
        lastError = errData;
        continue; // try next model
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err) {
      console.error(`Gemini fetch error for ${model}:`, err);
      lastError = err;
    }
  }

  throw new Error(`All Gemini models failed: ${JSON.stringify(lastError)}`);
}

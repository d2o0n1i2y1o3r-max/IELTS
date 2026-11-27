const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Real, active Google Generative Language models
const MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

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
  if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith('AQ.')) {
    throw new Error('Valid Google Gemini API key is not configured');
  }

  let lastError: any = null;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const body: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 1500,
        },
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      if (options.jsonMode) {
        body.generationConfig.responseMimeType = 'application/json';
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).finally(() => clearTimeout(timeoutId));

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn(`Gemini (${model}) error ${res.status}:`, errData);
        lastError = errData;
        continue; // try next model
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No content returned from Gemini');
      }

      return text.trim();
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

/**
 * Mistral AI — umumiy yordamchi funksiya.
 * API kaliti faqat process.env orqali o'qiladi.
 */

const MISTRAL_API_BASE = 'https://api.mistral.ai/v1';

export interface MistralAIOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Mistral AI ga so'rov yuboradi va matn javob qaytaradi.
 */
export async function callCfAI(
  prompt: string,
  options: MistralAIOptions = {}
): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY .env.local da topilmadi');
  }

  const model = options.model ?? 'mistral-small-latest';
  const url = `${MISTRAL_API_BASE}/chat/completions`;

  const body = {
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.2,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Mistral AI xatosi (${res.status}): ${errText}`);
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message: string };
  };

  if (data.error) {
    throw new Error(`Mistral API muvaffaqiyatsiz: ${data.error.message}`);
  }

  if (!data.choices || !data.choices[0] || !data.choices[0].message?.content) {
    throw new Error('Bo\'sh javob');
  }

  return data.choices[0].message.content.trim();
}

/**
 * Mistral AI javobidan JSON ob'ektini xavfsiz ajratib oladi.
 * Markdown code block larini tozalab JSON parse qiladi.
 */
export function parseCfAIJson<T>(raw: string): T | null {
  try {
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

/**
 * Cloudflare Workers AI — umumiy yordamchi funksiya.
 * Token va Account ID faqat process.env orqali o'qiladi.
 */

const CF_API_BASE = 'https://api.cloudflare.com/client/v4/accounts';

export interface CfAIOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Cloudflare Workers AI ga so'rov yuboradi va matn javob qaytaradi.
 */
export async function callCfAI(
  prompt: string,
  options: CfAIOptions = {}
): Promise<string> {
  const token = process.env.CF_API_TOKEN;
  const accountId = process.env.CF_ACCOUNT_ID;

  if (!token || !accountId) {
    throw new Error('CF_API_TOKEN yoki CF_ACCOUNT_ID .env.local da topilmadi');
  }

  const model = options.model ?? '@cf/meta/llama-3.1-8b-instruct';
  const url = `${CF_API_BASE}/${accountId}/ai/run/${model}`;

  const body = {
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
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`CF AI xatosi (${res.status}): ${errText}`);
  }

  const data = await res.json() as {
    success: boolean;
    result?: { response?: string };
    errors?: { message: string }[];
  };

  if (!data.success || !data.result?.response) {
    const errMsg = data.errors?.map((e) => e.message).join(', ') ?? 'Bo\'sh javob';
    throw new Error(`CF AI muvaffaqiyatsiz: ${errMsg}`);
  }

  return data.result.response.trim();
}

/**
 * CF AI javobidan JSON ob'ektini xavfsiz ajratib oladi.
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

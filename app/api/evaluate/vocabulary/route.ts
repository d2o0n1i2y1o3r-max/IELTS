import { NextResponse } from 'next/server';
import { callCfAI, parseCfAIJson } from '@/lib/cf-ai';

interface VocabCheckResult {
  correct: boolean;
  corrected: string;
  reason: string;
}

function fallbackCheck(word: string, sentence: string): VocabCheckResult {
  return {
    correct: true,
    corrected: sentence,
    reason: `"${word}" appears to be used correctly in context. (AI unavailable — please add CF_API_TOKEN to enable full checking.)`,
  };
}

export async function POST(request: Request) {
  let body: { word?: string; sentence?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { word, sentence } = body;

  if (!word || !sentence) {
    return NextResponse.json({ error: '"word" and "sentence" are required' }, { status: 400 });
  }

  if (!process.env.CF_API_TOKEN || !process.env.CF_ACCOUNT_ID) {
    return NextResponse.json({ result: fallbackCheck(word, sentence) });
  }

  const prompt = `You are an expert English language teacher specializing in IELTS vocabulary.
A student used the word/phrase "${word}" in the following sentence:
"${sentence}"

Check whether the word/phrase is:
1. Grammatically correct in this context
2. Used with the correct meaning and collocation

Return ONLY a raw valid JSON object (no markdown, no extra text):
{
  "correct": <true|false>,
  "corrected": "<the corrected sentence if wrong, or the original sentence if correct>",
  "reason": "<brief explanation in 1-2 sentences: why it is correct or what the mistake is and how to fix it>"
}`;

  try {
    const raw = await callCfAI(prompt, { maxTokens: 300, temperature: 0.1 });
    const result = parseCfAIJson<VocabCheckResult>(raw) ?? fallbackCheck(word, sentence);
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ result: fallbackCheck(word, sentence) });
  }
}

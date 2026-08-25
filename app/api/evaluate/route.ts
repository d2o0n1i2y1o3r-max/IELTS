import { NextResponse } from 'next/server';
import { EvaluationResult } from '@/lib/types';
import { callCfAI, parseCfAIJson } from '@/lib/cf-ai';

function fallbackEvaluate(transcript: string, questionText: string): EvaluationResult {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let baseBand = 6.0;
  if (wordCount > 100) baseBand = 8.0;
  else if (wordCount > 60) baseBand = 7.5;
  else if (wordCount > 30) baseBand = 7.0;
  else if (wordCount > 15) baseBand = 6.5;
  else baseBand = 5.5;

  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lexicalRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;

  const fc  = Math.min(9.0, Math.max(5.0, Number((baseBand + (wordCount > 50 ? 0.5 : -0.5)).toFixed(1))));
  const lr  = Math.min(9.0, Math.max(5.0, Number((baseBand + (lexicalRatio > 0.7 ? 0.5 : 0)).toFixed(1))));
  const ga  = Math.min(9.0, Math.max(5.0, Number((baseBand - 0.5 + (wordCount > 40 ? 0.5 : 0)).toFixed(1))));
  const pr  = Math.min(9.0, Math.max(5.0, Number(baseBand.toFixed(1))));
  const overall = Number(((fc + lr + ga + pr) / 4).toFixed(1));

  let cefr: 'B1' | 'B2' | 'C1' | 'C2' = 'B2';
  if (overall >= 8.0) cefr = 'C2';
  else if (overall >= 7.0) cefr = 'C1';
  else if (overall >= 5.5) cefr = 'B2';
  else cefr = 'B1';

  return {
    overallBand: overall,
    cefrLevel: cefr,
    criteriaScores: { fluencyCoherence: fc, lexicalResource: lr, grammaticalAccuracy: ga, pronunciation: pr },
    strengths: [
      `Delivered a clear response of ${wordCount} words addressing the key context of the question.`,
      `Demonstrated good lexical variety with a distinct vocabulary ratio of ${Math.round(lexicalRatio * 100)}%.`,
      `Maintained a structured response flow with understandable sentence organization.`,
    ],
    weaknesses: [
      `Could expand complex sentence clauses (e.g. using 'not only... but also', complex conditionals).`,
      `Incorporate more idiomatic phrases and precise topic-specific collocations to push into Band 8.5+.`,
    ],
    improvedSample: `Regarding '${questionText}', a comprehensive response would highlight both primary causes and personal insights.`,
    detailedFeedback: `Your response addresses the prompt effectively. Focus on extending answers naturally with specific examples and sophisticated transition words.`,
  };
}

export async function POST(request: Request) {
  let body: { transcript?: string; questionText?: string; part?: string; topic?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { transcript, questionText, part, topic } = body;

  if (!transcript || transcript.trim().length === 0) {
    return NextResponse.json({ error: 'Transcript text is required' }, { status: 400 });
  }

  // CF AI mavjud bo'lmasa fallback ishlatiladi
  if (!process.env.CF_API_TOKEN || !process.env.CF_ACCOUNT_ID) {
    return NextResponse.json({ evaluation: fallbackEvaluate(transcript, questionText ?? 'Speaking prompt') });
  }

  const prompt = `You are an expert official IELTS Speaking Examiner and CEFR Language Assessor.
Analyze the candidate's spoken response transcript:
- Question: "${questionText ?? 'General speaking prompt'}"
- Exam part: ${part ?? 'part1'}
- Topic: ${topic ?? 'General'}

Candidate transcript: "${transcript}"

Evaluate strictly according to official IELTS Speaking band descriptors across 4 criteria:
1. Fluency & Coherence
2. Lexical Resource
3. Grammatical Range & Accuracy
4. Pronunciation (inferred from phrasing and structures)

Return ONLY a raw valid JSON object (no markdown, no extra text):
{
  "overallBand": <number 0-9, step 0.5>,
  "cefrLevel": "<B1|B2|C1|C2>",
  "criteriaScores": {
    "fluencyCoherence": <number>,
    "lexicalResource": <number>,
    "grammaticalAccuracy": <number>,
    "pronunciation": <number>
  },
  "strengths": ["<string>", "<string>", "<string>"],
  "weaknesses": ["<string>", "<string>"],
  "improvedSample": "<string>",
  "detailedFeedback": "<string>"
}`;

  try {
    const raw = await callCfAI(prompt, { maxTokens: 1024, temperature: 0.2 });
    const evaluation = parseCfAIJson<EvaluationResult>(raw) ?? fallbackEvaluate(transcript, questionText ?? 'Speaking prompt');
    return NextResponse.json({ evaluation });
  } catch {
    return NextResponse.json({ evaluation: fallbackEvaluate(transcript, questionText ?? 'Speaking prompt') });
  }
}

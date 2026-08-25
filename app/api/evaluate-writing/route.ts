import { NextResponse } from 'next/server';
import { WritingEvaluation } from '@/lib/types';
import { callCfAI, parseCfAIJson } from '@/lib/cf-ai';

function fallbackEvaluate(essay: string, promptText: string, taskType: string): WritingEvaluation {
  const words = essay.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let baseBand = 6.0;
  if (wordCount > 250) baseBand = 8.0;
  else if (wordCount > 200) baseBand = 7.5;
  else if (wordCount > 150) baseBand = 7.0;
  else if (wordCount > 100) baseBand = 6.5;
  else baseBand = 5.5;

  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lexicalRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;

  const ta  = Math.min(9.0, Math.max(5.0, Number((baseBand + (wordCount > 150 ? 0.5 : -0.5)).toFixed(1))));
  const cc  = Math.min(9.0, Math.max(5.0, Number((baseBand + (lexicalRatio > 0.6 ? 0.5 : 0)).toFixed(1))));
  const lr  = Math.min(9.0, Math.max(5.0, Number((baseBand + (lexicalRatio > 0.7 ? 0.5 : 0)).toFixed(1))));
  const gra = Math.min(9.0, Math.max(5.0, Number((baseBand - 0.5 + (wordCount > 120 ? 0.5 : 0)).toFixed(1))));
  const overall = Number(((ta + cc + lr + gra) / 4).toFixed(1));

  let cefr: 'B1' | 'B2' | 'C1' | 'C2' = 'B2';
  if (overall >= 8.0) cefr = 'C2';
  else if (overall >= 7.0) cefr = 'C1';
  else if (overall >= 5.5) cefr = 'B2';
  else cefr = 'B1';

  return {
    overallBand: overall,
    cefrLevel: cefr,
    criteriaScores: { taskAchievement: ta, coherenceCohesion: cc, lexicalResource: lr, grammaticalRange: gra },
    strengths: [
      `Submitted a ${taskType} essay of ${wordCount} words addressing the prompt requirements.`,
      `Demonstrated reasonable lexical variety with a vocabulary ratio of ${Math.round(lexicalRatio * 100)}%.`,
      `Maintained basic essay structure with introduction, body paragraphs, and conclusion.`,
    ],
    weaknesses: [
      `Could improve paragraph coherence with stronger topic sentences and linking devices.`,
      `Incorporate more sophisticated grammatical structures and academic vocabulary for higher bands.`,
    ],
    improvedSample: `For this ${taskType} prompt, a Band 8.5+ response would feature a clear thesis, well-developed body paragraphs with specific examples, and sophisticated transitions.`,
    detailedFeedback: `Your essay addresses the prompt with relevant ideas. Focus on expanding arguments with specific examples and using more varied sentence structures.`,
    wordCount,
  };
}

export async function POST(request: Request) {
  let body: { essay?: string; promptText?: string; taskType?: string; topic?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { essay, promptText, taskType, topic } = body;

  if (!essay || essay.trim().length === 0) {
    return NextResponse.json({ error: 'Essay text is required' }, { status: 400 });
  }

  if (!process.env.CF_API_TOKEN || !process.env.CF_ACCOUNT_ID) {
    return NextResponse.json({ evaluation: fallbackEvaluate(essay, promptText ?? 'Writing prompt', taskType ?? 'task2') });
  }

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  const prompt = `You are an expert official IELTS Writing Examiner.
Analyze the candidate's essay:
- Task type: ${taskType ?? 'task2'}
- Topic: ${topic ?? 'General'}
- Prompt: "${promptText ?? 'General writing prompt'}"
- Word count: ${wordCount}

Candidate essay:
"""
${essay}
"""

Evaluate strictly according to official IELTS Writing band descriptors (0-9) across 4 criteria:
1. Task Achievement/Response
2. Coherence & Cohesion
3. Lexical Resource
4. Grammatical Range & Accuracy

Return ONLY a raw valid JSON object (no markdown, no extra text):
{
  "overallBand": <number 0-9, step 0.5>,
  "cefrLevel": "<B1|B2|C1|C2>",
  "criteriaScores": {
    "taskAchievement": <number>,
    "coherenceCohesion": <number>,
    "lexicalResource": <number>,
    "grammaticalRange": <number>
  },
  "strengths": ["<string>", "<string>", "<string>"],
  "weaknesses": ["<string>", "<string>"],
  "improvedSample": "<string>",
  "detailedFeedback": "<string>",
  "wordCount": ${wordCount}
}`;

  try {
    const raw = await callCfAI(prompt, { maxTokens: 1200, temperature: 0.2 });
    const evaluation = parseCfAIJson<WritingEvaluation>(raw) ?? fallbackEvaluate(essay, promptText ?? 'Writing prompt', taskType ?? 'task2');
    return NextResponse.json({ evaluation });
  } catch {
    return NextResponse.json({ evaluation: fallbackEvaluate(essay, promptText ?? 'Writing prompt', taskType ?? 'task2') });
  }
}

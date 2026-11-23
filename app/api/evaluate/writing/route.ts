import { NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai';
import { saveSessionToHistory } from '@/lib/db';

const SYSTEM_PROMPT = 'You are a strict IELTS examiner. Use official band descriptors, bands 0-9 in 0.5 steps. Return ONLY valid JSON.';

export async function POST(request: Request) {
  let body: {
    essay?: string;
    promptText?: string;
    prompt?: string;
    taskType?: string;
    topic?: string;
    language?: 'en' | 'uz' | 'ru';
    userId?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const essay = (body.essay || '').trim();
  const promptText = (body.promptText || body.prompt || '').trim();
  const taskType = body.taskType || 'task2';
  const lang = body.language || 'en';
  const userId = body.userId || 'anonymous';

  if (!essay || essay.length === 0) {
    return NextResponse.json(
      { error: 'Essay text is required. Please write your essay before submitting.' },
      { status: 400 }
    );
  }

  const words = essay.split(/\s+/).filter(Boolean);
  if (words.length < 20) {
    return NextResponse.json(
      { error: `Essay is too short (${words.length} words). Please write at least 20 words for meaningful IELTS assessment.` },
      { status: 400 }
    );
  }

  const langInstruction =
    lang === 'uz'
      ? "Write the 'feedback' in Uzbek (O'zbek tilida). Explain mistakes and suggestions clearly."
      : lang === 'ru'
      ? "Write the 'feedback' in Russian (На русском языке)."
      : "Write the 'feedback' in English.";

  const userPrompt = `Evaluate the candidate's IELTS Writing essay.
Task Type: ${taskType}
Prompt: "${promptText || 'General writing prompt'}"
Word Count: ${words.length} words
Target Feedback Language: ${lang}

Candidate essay:
"""
${essay}
"""

${langInstruction}

Strict rules:
1. Grade strictly using official IELTS band descriptors (0.0 to 9.0 in 0.5 steps).
2. Four criteria:
   - taskAchievement (Task Achievement for Task 1 / Task Response for Task 2)
   - coherence (Coherence & Cohesion)
   - lexicalResource (Lexical Resource)
   - grammar (Grammatical Range & Accuracy)
3. 'band' is the average of the four scores rounded to the nearest 0.5.
4. 'feedback' must be comprehensive, constructive, and written in ${lang}.

Return ONLY a raw valid JSON object in this exact schema (no markdown formatting, no code fences):
{
  "band": 6.5,
  "taskAchievement": 6.5,
  "coherence": 6.5,
  "lexicalResource": 6.5,
  "grammar": 6.5,
  "feedback": "Detailed constructive evaluation in ${lang} covering strengths, weaknesses, and key advice."
}`;

  try {
    const raw = await callAI({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 1000,
      userId,
    });

    const parsed = parseJSON(raw);

    if (!parsed || typeof parsed.band !== 'number') {
      throw new Error('AI returned invalid schema');
    }

    const roundHalf = (n: number) => Math.round(n * 2) / 2;
    const band = roundHalf(parsed.band);
    const taskAchievement = roundHalf(parsed.taskAchievement ?? band);
    const coherence = roundHalf(parsed.coherence ?? band);
    const lexicalResource = roundHalf(parsed.lexicalResource ?? band);
    const grammar = roundHalf(parsed.grammar ?? band);

    const evaluation = {
      band,
      overallBand: band,
      taskAchievement,
      coherence,
      lexicalResource,
      grammar,
      feedback: parsed.feedback || 'Well-written essay with good structure.',
      cefrLevel: band >= 8 ? 'C2' : band >= 7 ? 'C1' : band >= 5.5 ? 'B2' : 'B1',
      criteriaScores: {
        taskAchievement,
        coherenceCohesion: coherence,
        lexicalResource,
        grammaticalRange: grammar,
      },
      wordCount: words.length,
      strengths: ['Clear organizational flow', 'Addressed key aspects of the prompt'],
      weaknesses: ['Could develop supporting ideas more thoroughly'],
      detailedFeedback: parsed.feedback,
    };

    // Save session to history
    const session = {
      id: `writing-${Date.now()}`,
      module: 'writing' as const,
      createdAt: new Date().toISOString(),
      promptText,
      topic: body.topic || 'General',
      taskType: (taskType as any) || 'task2',
      essay,
      wordCount: words.length,
      duration: 40,
      evaluation,
    };

    try {
      saveSessionToHistory(session as any);
    } catch (saveErr) {
      console.warn('Failed to save writing session:', saveErr);
    }

    return NextResponse.json({
      ...evaluation,
      session,
      evaluation, // backwards compatibility
    });
  } catch (error: any) {
    console.error('Writing evaluation error:', error);
    return NextResponse.json(
      { error: error.message || 'Writing AI evaluation failed. Please try again.' },
      { status: 500 }
    );
  }
}

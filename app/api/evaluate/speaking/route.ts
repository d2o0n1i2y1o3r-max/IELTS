import { NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai';
import { saveSessionToHistory } from '@/lib/db';

const SYSTEM_PROMPT = 'You are a strict IELTS examiner. Use official band descriptors, bands 0-9 in 0.5 steps. Return ONLY valid JSON.';

export async function POST(request: Request) {
  let body: {
    transcript?: string;
    question?: string;
    questionText?: string;
    part?: string;
    topic?: string;
    language?: 'en' | 'uz' | 'ru';
    userId?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const transcript = (body.transcript || '').trim();
  const question = (body.question || body.questionText || '').trim();
  const lang = body.language || 'en';
  const userId = body.userId || 'anonymous';

  if (!transcript || transcript.length === 0) {
    return NextResponse.json(
      { error: 'Transcript is required. Please speak or provide your spoken response.' },
      { status: 400 }
    );
  }

  if (transcript.length < 10) {
    return NextResponse.json(
      { error: 'Transcript is too short for IELTS evaluation. Please provide at least one full sentence.' },
      { status: 400 }
    );
  }

  const langInstruction =
    lang === 'uz'
      ? "Write the 'feedback' in Uzbek (O'zbek tilida). Keep technical terms clear."
      : lang === 'ru'
      ? "Write the 'feedback' in Russian (На русском языке)."
      : "Write the 'feedback' in English.";

  const userPrompt = `Evaluate the candidate's IELTS Speaking response.
Question: "${question || 'General IELTS Speaking question'}"
Candidate spoken transcript: "${transcript}"
Target feedback language: ${lang}

${langInstruction}

Strict rules:
1. Assess according to official IELTS Speaking descriptors (0.0 to 9.0 in 0.5 increments).
2. Note: 'pronunciation' is a text-based estimate inferred from phrasing, natural pause markers, and structural rhythm. Explicitly state this in feedback.
3. Provide a high-scoring Band 8.5+ 'modelAnswer' in natural English.

Return ONLY a raw valid JSON object in this exact schema (no markdown fences, no extra text):
{
  "band": 6.5,
  "fluency": 6.5,
  "lexical": 6.5,
  "grammar": 6.5,
  "pronunciation": 6.5,
  "feedback": "Detailed constructive evaluation in ${lang} with strengths and areas to improve.",
  "modelAnswer": "High-scoring model response in natural English."
}`;

  try {
    const raw = await callAI({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      maxTokens: 800,
      userId,
    });

    const parsed = parseJSON(raw);

    if (!parsed || typeof parsed.band !== 'number') {
      throw new Error('AI returned invalid schema');
    }

    // Standardize band scores to 0.5 increments
    const roundHalf = (n: number) => Math.round(n * 2) / 2;
    const band = roundHalf(parsed.band);
    const fluency = roundHalf(parsed.fluency ?? band);
    const lexical = roundHalf(parsed.lexical ?? band);
    const grammar = roundHalf(parsed.grammar ?? band);
    const pronunciation = roundHalf(parsed.pronunciation ?? band);

    const evaluation = {
      band,
      overallBand: band,
      fluency,
      lexical,
      grammar,
      pronunciation,
      pronunciationNote: 'Text-based estimate based on sentence flow and structure',
      feedback: parsed.feedback || 'Good effort. Keep expanding on your points with specific examples.',
      modelAnswer: parsed.modelAnswer || 'A well-structured answer with fluent connectors and relevant examples.',
    };

    // Save finished session to history
    const session = {
      id: `speaking-${Date.now()}`,
      module: 'speaking' as const,
      createdAt: new Date().toISOString(),
      questionText: question,
      topic: body.topic || 'General',
      part: (body.part as any) || 'part1',
      transcript,
      duration: 45,
      evaluation: {
        overallBand: band,
        cefrLevel: band >= 8 ? 'C2' : band >= 7 ? 'C1' : band >= 5.5 ? 'B2' : 'B1',
        criteriaScores: {
          fluencyCoherence: fluency,
          lexicalResource: lexical,
          grammaticalAccuracy: grammar,
          pronunciation,
        },
        strengths: ['Addressed the topic directly', 'Coherent thought progression'],
        weaknesses: ['Could use more topic-specific collocations'],
        improvedSample: evaluation.modelAnswer,
        detailedFeedback: evaluation.feedback,
      },
    };

    try {
      saveSessionToHistory(session as any);
    } catch (saveErr) {
      console.warn('Failed to save session to history:', saveErr);
    }

    return NextResponse.json({
      ...evaluation,
      session,
      evaluation, // backwards compatibility
    });
  } catch (error: any) {
    console.error('Speaking evaluation error:', error);
    return NextResponse.json(
      { error: error.message || 'AI evaluation failed. Please try again.' },
      { status: 500 }
    );
  }
}

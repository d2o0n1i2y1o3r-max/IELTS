import { NextResponse } from 'next/server';
import { rawScoreToBand, bandToCefr } from '@/lib/types';
import { getReadingPassagesData } from '@/lib/db';
import { callCfAI, parseCfAIJson } from '@/lib/cf-ai';

interface WrongAnswer {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface ReadingAIFeedback {
  detailedFeedback: string;
  wrongAnswers: WrongAnswer[];
}

export async function POST(request: Request) {
  let body: {
    passageId?: string;
    answers?: Record<string, string>;
    passageTitle?: string;
    topic?: string;
    duration?: number;
  } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { passageId, answers, passageTitle, topic, duration } = body;

  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
  }

  // Passage va to'g'ri javoblarni yuklash
  const passages = getReadingPassagesData();
  const passage = passages.find((p) => p.id === passageId);

  const answerKeys = Object.keys(answers);
  const totalQuestions = answerKeys.length;

  let correctCount = 0;
  const wrongAnswers: WrongAnswer[] = [];

  if (passage) {
    passage.questions.forEach((q) => {
      const userAns = (answers[q.id] ?? '').toLowerCase().trim();
      const correctAns = q.correctAnswer.toLowerCase().trim();
      if (userAns === correctAns) {
        correctCount++;
      } else {
        wrongAnswers.push({
          questionId: q.id,
          question: q.question,
          userAnswer: answers[q.id] ?? '(blank)',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        });
      }
    });
  } else {
    // Passage topilmasa: heuristic
    answerKeys.forEach((key) => {
      const answer = answers[key].toLowerCase().trim();
      if (answer.length > 2 && !answer.includes('not sure')) {
        correctCount += 0.7;
      }
    });
    correctCount = Math.round(correctCount);
  }

  const overallBand = rawScoreToBand(correctCount, totalQuestions);
  const cefrLevel = bandToCefr(overallBand);

  // AI bilan detailed feedback
  let detailedFeedback = `You answered ${correctCount} out of ${totalQuestions} questions correctly (Band ${overallBand}). ${
    correctCount >= totalQuestions * 0.7
      ? 'Good performance! Focus on reading more carefully to catch subtle details.'
      : 'Keep practising reading comprehension to improve your score.'
  }`;

  if (process.env.MISTRAL_API_KEY && wrongAnswers.length > 0) {
    const wrongSummary = wrongAnswers
      .map(
        (w) =>
          `Q: "${w.question}" | Your answer: "${w.userAnswer}" | Correct: "${w.correctAnswer}" | Explanation: ${w.explanation}`
      )
      .join('\n');

    const aiFeedbackPrompt = `You are an expert IELTS Reading coach.
A student scored ${correctCount}/${totalQuestions} (Band ${overallBand}) on an IELTS Reading passage titled "${passageTitle ?? 'Unknown'}".

Incorrect answers:
${wrongSummary}

Write a concise, encouraging paragraph (3-5 sentences) explaining the main mistakes and giving specific improvement tips based on the question types missed. Do NOT repeat the questions verbatim; focus on patterns and strategies.`;

    try {
      const aiRaw = await callCfAI(aiFeedbackPrompt, { maxTokens: 400, temperature: 0.3 });
      if (aiRaw && aiRaw.length > 20) detailedFeedback = aiRaw;
    } catch {
      // fallback: use simple message
    }
  }

  const evaluation = {
    overallBand,
    cefrLevel,
    rawScore: correctCount,
    totalQuestions,
    detailedFeedback,
    wrongAnswers,
  };

  const sessionObj = {
    id: `reading-${Date.now()}`,
    module: 'reading' as const,
    createdAt: new Date().toISOString(),
    passageId,
    passageTitle,
    topic,
    answers,
    correctCount,
    totalQuestions,
    duration,
    evaluation,
  };

  return NextResponse.json({ evaluation, session: sessionObj });
}

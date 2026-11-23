import { NextResponse } from 'next/server';
import { rawScoreToBand, bandToCefr } from '@/lib/types';
import { getReadingPassagesData, saveSessionToHistory } from '@/lib/db';
import { callAI } from '@/lib/ai';

interface WrongAnswer {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export async function POST(request: Request) {
  let body: {
    passageId?: string;
    answers?: Record<string, string>;
    passageTitle?: string;
    topic?: string;
    duration?: number;
    language?: 'en' | 'uz' | 'ru';
    userId?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { passageId, answers, passageTitle, topic, duration, language = 'en', userId = 'anonymous' } = body;

  if (!answers || Object.keys(answers).length === 0) {
    return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
  }

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

  let detailedFeedback =
    language === 'uz'
      ? `Siz ${totalQuestions} ta savoldan ${correctCount} tasiga to'g'ri javob berdingiz (Band ${overallBand}).`
      : language === 'ru'
      ? `Вы правильно ответили на ${correctCount} из ${totalQuestions} вопросов (Band ${overallBand}).`
      : `You answered ${correctCount} out of ${totalQuestions} questions correctly (Band ${overallBand}).`;

  if (wrongAnswers.length > 0) {
    const wrongSummary = wrongAnswers
      .slice(0, 5) // max 5 for conciseness
      .map(
        (w) =>
          `Q: "${w.question}" | User: "${w.userAnswer}" | Correct: "${w.correctAnswer}" | Reason: ${w.explanation}`
      )
      .join('\n');

    const langInstruction =
      language === 'uz'
        ? "Izohni o'zbek tilida yozing. Xatolarning asosiy sabablarini tushuntiring."
        : language === 'ru'
        ? "Напишите объяснение на русском языке."
        : "Write the explanation in English.";

    const systemPrompt = 'You are an expert IELTS Reading coach. Explain mistakes concisely and constructively.';
    const userPrompt = `A student scored ${correctCount}/${totalQuestions} (Band ${overallBand}) on IELTS Reading "${passageTitle ?? 'Passage'}".
Wrong answers:
${wrongSummary}

${langInstruction}
Write 3-4 sentences explaining why the answers were incorrect and how to identify correct clues next time.`;

    try {
      const aiExplanation = await callAI({
        system: systemPrompt,
        user: userPrompt,
        maxTokens: 400,
        userId,
      });
      if (aiExplanation && aiExplanation.length > 15) {
        detailedFeedback = aiExplanation;
      }
    } catch (aiErr) {
      console.warn('Reading AI explanation fallback:', aiErr);
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

  try {
    saveSessionToHistory(sessionObj as any);
  } catch (err) {
    console.warn('Failed to save reading session:', err);
  }

  return NextResponse.json({ evaluation, session: sessionObj });
}

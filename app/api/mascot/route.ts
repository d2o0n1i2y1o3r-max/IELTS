import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';
import { callAI, parseJSON } from '@/lib/cf-ai';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const conversation = messages
      .slice(-6)
      .map((m: any) => `${m.role === 'user' ? 'Foydalanuvchi' : 'AI Mascot'}: ${m.content}`)
      .join('\n');
    
    const systemPrompt = `You are a friendly, encouraging and highly knowledgeable IELTS coach AI mascot.
Analyze the user's latest message in the context of the conversation.
Reply naturally in the exact language the user used (Uzbek, Russian, or English).
Provide clear explanations, IELTS tips, grammar help, vocabulary suggestions, and examples.
Keep your response conversational, friendly, and structured.

Determine your facial expression mood:
- "calm": for normal helpful conversation, congratulations, answering questions.
- "agitated": if the user expresses frustration, complains about difficulty, makes repeated mistakes, or seems worried.

Respond STRICTLY with a valid JSON object (no markdown formatting, no code fences):
{
  "reply": "<your detailed conversational response here>",
  "mood": "calm" or "agitated"
}`;

    const prompt = `Conversation history:
${conversation}

Respond with JSON:`;

    // 1. Try Google Gemini first
    try {
      const raw = await callGemini(prompt, systemPrompt, {
        temperature: 0.7,
        maxTokens: 1200,
        jsonMode: true,
      });

      const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.reply) {
        return NextResponse.json({
          reply: parsed.reply,
          mood: parsed.mood === 'agitated' ? 'agitated' : 'calm',
        });
      }
    } catch (geminiError) {
      console.warn('Gemini failed, trying fallback:', geminiError);
    }

    // 2. Fallback to GitHub Models / CF AI if Gemini fails
    if (process.env.GITHUB_MODELS_TOKEN) {
      try {
        const raw = await callAI(systemPrompt, prompt, { maxTokens: 1024, temperature: 0.6 });
        const data = parseJSON<{ reply: string; mood: 'calm' | 'agitated' }>(raw);
        if (data && data.reply) {
          return NextResponse.json(data);
        }
      } catch (fbError) {
        console.error('Fallback AI also failed:', fbError);
      }
    }

    // 3. Fallback answer if everything fails
    return NextResponse.json({
      reply: "Salom! Men sizning IELTS bo'yicha yordamchingizman. Savolingizni bering, sizga yordam berishdan xursand bo'laman!",
      mood: 'calm',
    });

  } catch (error: any) {
    console.error('Mascot API error:', error);
    return NextResponse.json({
      reply: "Kechirasiz, javob berishda xatolik yuz berdi. Iltimos qaytadan yozing.",
      mood: 'calm',
    }, { status: 500 });
  }
}

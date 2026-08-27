import { NextResponse } from 'next/server';
import { callCfAI, parseCfAIJson } from '@/lib/cf-ai';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Format conversation history
    const conversation = messages
      .slice(-5) // Send only last 5 messages to avoid token limits
      .map((m: any) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');
    
    const prompt = `You are a friendly, conversational IELTS coach AI mascot.
Analyze the user's latest message in the context of the conversation.
Reply in the language the user used (Uzbek, Russian, or English).
Provide explanations, grammar corrections, band score tips, vocabulary suggestions, and examples as needed.

Your mood should be "calm" for normal conversations, and "agitated" if the user makes many errors, asks a very confusing/difficult question, or if the conversation is tense.

Conversation history:
${conversation}

Respond STRICTLY with a raw valid JSON object in this format (no extra text, no markdown block, just the JSON):
{
  "reply": "<your detailed conversational response here>",
  "mood": "<calm or agitated>"
}`;

    // Cloudflare Workers AI call
    const raw = await callCfAI(prompt, { maxTokens: 1024, temperature: 0.6 });
    const data = parseCfAIJson<{ reply: string; mood: 'calm' | 'agitated' }>(raw);

    if (data && data.reply && data.mood) {
      return NextResponse.json(data);
    }

    // Fallback if JSON parsing fails
    const cleanRaw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json({
      reply: cleanRaw || "Kechirasiz, javobni shakllantirishda xatolik yuz berdi.",
      mood: 'calm'
    });

  } catch (error: any) {
    console.error('Mascot API error:', error);
    return NextResponse.json({
      reply: "Kechirasiz, hozircha javob bera olmayman. Tizimda uzilish yuz berdi.",
      mood: 'agitated'
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { callCfAI, parseCfAIJson } from '@/lib/cf-ai';

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${i + 1}/${maxRetries + 1} failed:`, error);
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    if (!process.env.CF_API_TOKEN || !process.env.CF_ACCOUNT_ID) {
      console.error('Missing CF_API_TOKEN or CF_ACCOUNT_ID environment variables');
      const lastMessage = messages[messages.length - 1]?.content || '';
      let mood: 'calm' | 'agitated' = 'calm';
      let reply = "Hozircha AI ulanish sozlanmagan. Iltimos, .env.local faylida CF_API_TOKEN va CF_ACCOUNT_ID o'rnating. Shunga qaramay, IELTS bo'yicha umumiy maslahat bera olaman!";
      
      if (lastMessage.toLowerCase().includes('xato') || lastMessage.toLowerCase().includes('yomon') || lastMessage.toLowerCase().includes('qiyin')) {
         mood = 'agitated';
         reply = "Xavotir olmang! AI hozircha ishlamayapti, lekin IELTS bo'yicha asosiy maslahatlar bera olaman. Qaysi qismida qiynalyapsiz?";
      }

      return NextResponse.json({ reply, mood });
    }

    const conversation = messages
      .slice(-5)
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

    let raw: string;
    try {
      raw = await retryWithBackoff(() => callCfAI(prompt, { maxTokens: 1024, temperature: 0.6 }));
    } catch (apiError) {
      console.error('CF AI API call failed after retries:', apiError);
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      let mood: 'calm' | 'agitated' = 'calm';
      let reply = "AI serveriga ulanishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring yoki keyinroq qayta boring.";
      
      if (lastMessage.includes('xato') || lastMessage.includes('yomon') || lastMessage.includes('qiyin')) {
         mood = 'agitated';
         reply = "Ulanishda muammo bor! Lekin xavotir olmang, IELTS tayyorgarligida sizga yordam bera olaman. Qaysi mavzuda qiynalyapsiz?";
      }

      return NextResponse.json({ reply, mood, error: 'API_CONNECTION_FAILED' });
    }

    const data = parseCfAIJson<{ reply: string; mood: 'calm' | 'agitated' }>(raw);

    if (data && data.reply && data.mood) {
      return NextResponse.json(data);
    }

    console.error('JSON parsing failed for CF AI response:', raw);
    const cleanRaw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json({
      reply: cleanRaw || "Kechirasiz, javobni shakllantirishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
      mood: 'calm',
      error: 'JSON_PARSE_FAILED'
    });

  } catch (error: any) {
    console.error('Mascot API unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({
      reply: "Kechirasiz, tizimda kutilmagan xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
      mood: 'agitated',
      error: 'UNEXPECTED_ERROR'
    }, { status: 500 });
  }
}

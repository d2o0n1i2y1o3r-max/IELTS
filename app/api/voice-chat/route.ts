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
    const { messages, language = 'uz' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    let langInstruction = "O'zbek tilida";
    if (language === 'ru') langInstruction = "Rus tilida";
    if (language === 'en') langInstruction = "Ingliz tilida";

    if (!process.env.MISTRAL_API_KEY) {
      console.error('Missing MISTRAL_API_KEY environment variable');
      const lastMessage = messages[messages.length - 1]?.content || '';
      let mood: 'calm' | 'agitated' = 'calm';
      let reply = "Hozircha AI ulanish sozlanmagan. Iltimos, .env.local faylida MISTRAL_API_KEY o'rnating.";
      if (language === 'ru') reply = "ИИ пока не настроен. Пожалуйста, установите MISTRAL_API_KEY в .env.local.";
      if (language === 'en') reply = "AI is not configured yet. Please set MISTRAL_API_KEY in .env.local.";

      if (lastMessage.toLowerCase().includes('xato') || lastMessage.toLowerCase().includes('yomon') || lastMessage.toLowerCase().includes('qiyin')) {
         mood = 'agitated';
      }

      return NextResponse.json({ reply, mood });
    }

    const conversation = messages
      .slice(-5)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');

    const prompt = `Sen foydalanuvchi bilan erkin, tabiiy suhbatlashuvchi do'stsan. Har qanday mavzuda gaplasha olasan — IELTS bilan cheklanma. Qisqa, tabiiy, jonli odamdek javob ber (uzun ma'ruza emas). Foydalanuvchi kundalik hayot, hazil, boshqa mavzular va h.k. haqida gapirsa, shunga mos tabiiy javob ber.

MUHIM: Foydalanuvchi bilan STRICTLY ${langInstruction} gaplash! Boshqa tilda javob berma. Javobing albatta va to'liq ${langInstruction} bo'lishi SHART.

Javobing iloji boricha qisqa, tabiiy va suhbatdoshdek bo'lsin. 1-3 gap yetarli.

Conversation history:
${conversation}

Respond STRICTLY with a raw valid JSON object in this format (no extra text, no markdown block, just the JSON):
{
  "reply": "<your short, natural conversational response here, STRICTLY in ${langInstruction}>",
  "mood": "<calm or agitated>"
}`;

    let raw: string;
    try {
      raw = await retryWithBackoff(() => callCfAI(prompt, { maxTokens: 512, temperature: 0.8 }));
    } catch (apiError) {
      console.error('Mistral AI API call failed after retries:', apiError);
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      let mood: 'calm' | 'agitated' = 'calm';
      let reply = "AI serveriga ulanishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.";
      
      if (lastMessage.includes('xato') || lastMessage.includes('yomon') || lastMessage.includes('qiyin')) {
         mood = 'agitated';
         reply = "Ulanishda muammo bor! Lekin suhbat davom etishi mumkin.";
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
    console.error('Voice chat API unexpected error:', {
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

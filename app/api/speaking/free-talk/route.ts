import { NextResponse } from 'next/server';

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

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Missing OPENROUTER_API_KEY environment variable');
      return NextResponse.json({
        reply: "Hozircha AI ulanish sozlanmagan. Iltimos, .env.local faylida OPENROUTER_API_KEY o'rnating. Shunga qaramay, IELTS bo'yicha umumiy suhbat bera olaman!",
        error: 'MISSING_API_KEY'
      });
    }

    const model = process.env.OPENROUTER_MODEL || 'google/gemma-7b-it:free';
    
    const systemPrompt = `You are a friendly, conversational IELTS Speaking practice partner. Your role is to:

1. Engage in natural, friendly conversation with the user
2. Respond in the same language the user uses (Uzbek, Russian, or English)
3. Ask follow-up questions to keep the conversation flowing naturally
4. Only correct grammar or vocabulary errors if the user specifically asks for corrections
5. Provide encouraging responses and help build confidence
6. Discuss topics relevant to IELTS: education, work, hobbies, travel, culture, technology, etc.
7. Keep responses conversational and concise (1-3 sentences typically)
8. Be patient and supportive, like a language exchange partner

Remember: This is FREE TALK mode - focus on natural conversation, not formal evaluation or scoring.`;

    const conversation = messages.slice(-10).map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    let aiResponse: string;
    try {
      aiResponse = await retryWithBackoff(async () => {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'IELTS Speaking Practice'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversation
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          
          throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || errorText}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from OpenRouter');
        }

        return data.choices[0].message.content;
      });
    } catch (apiError) {
      console.error('OpenRouter API call failed after retries:', apiError);
      const lastMessage = messages[messages.length - 1]?.content || '';
      
      let fallbackReply = "AI serveriga ulanishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring yoki keyinroq qayta boring.";
      
      if (apiError instanceof Error && apiError.message.includes('Rate limit')) {
        fallbackReply = "Hozircha AI juda band (ko'p so'rov tufayli). Iltimos, bir necha daqiqadan so'ng qayta urinib ko'ring.";
      }
      
      return NextResponse.json({ 
        reply: fallbackReply,
        error: 'API_CONNECTION_FAILED'
      });
    }

    return NextResponse.json({ reply: aiResponse });

  } catch (error: any) {
    console.error('Free talk API unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({
      reply: "Kechirasiz, tizimda kutilmagan xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
      error: 'UNEXPECTED_ERROR'
    }, { status: 500 });
  }
}

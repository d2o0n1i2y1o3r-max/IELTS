import { NextResponse } from 'next/server';

const CYRILLIC_TO_LATIN: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'ye', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh',
  'ъ': "'", 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ғ': "g'", 'қ': 'q', 'ҳ': 'h', 'ў': "o'", 'ҷ': 'j',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'Ye', 'Ё': 'Yo',
  'Ж': 'J', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'X', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sh',
  'Ъ': "'", 'Ы': 'I', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  'Ғ': "G'", 'Қ': 'Q', 'Ҳ': 'H', 'Ў': "O'", 'Ҷ': 'J',
};

function hasCyrillic(text: string): boolean {
  return /[а-яёА-ЯЁғқҳўҷҒҚҲЎҶ]/.test(text);
}

function cyrillicToLatin(text: string): string {
  if (!hasCyrillic(text)) return text;
  return text.split('').map(ch => CYRILLIC_TO_LATIN[ch] ?? ch).join('');
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey || !voiceId) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TTS] Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in .env.local');
      }
      return NextResponse.json({ error: 'TTS not configured' }, { status: 503 });
    }

    const latinText = cyrillicToLatin(text);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: latinText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS] ElevenLabs error:', response.status, errorText);

      if (response.status === 401) {
        return NextResponse.json({ error: 'Invalid ElevenLabs API key' }, { status: 401 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: 'ElevenLabs quota exceeded' }, { status: 429 });
      }
      return NextResponse.json({ error: 'ElevenLabs API request failed' }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error('[TTS] Unexpected error:', error.message);
    return NextResponse.json({ error: 'TTS request failed' }, { status: 500 });
  }
}

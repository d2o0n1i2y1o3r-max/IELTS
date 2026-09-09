import { NextResponse } from 'next/server';
import { findUserByEmail, saveUser, updateUser } from '@/lib/db';
import { User } from '@/lib/types';

// RFC 5322 asosida sodda email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: Request) {
  let body: { name?: string; email?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();

  // ─── Validatsiya ───
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak.' },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json({ error: 'Email kiritilishi shart.' }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: 'Email formati noto\'g\'ri. Masalan: user@example.com' },
      { status: 400 }
    );
  }

  // ─── Mavjud foydalanuvchini tekshirish ───
  const existing = findUserByEmail(email);
  
  if (existing) {
    // Agar foydalanuvchi allaqachon mavjud bo'lsa, ma'lumotlarni yangilash
    try {
      const updatedUser = updateUser(existing.id, { name, email });
      return NextResponse.json(
        { success: true, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email } },
        { status: 200 }
      );
    } catch (err) {
      console.error('Update error:', err);
      return NextResponse.json({ error: 'Yangilashda xato yuz berdi. Qayta urinib ko\'ring.' }, { status: 500 });
    }
  }

  // ─── Yangi foydalanuvchi yaratish ───
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    createdAt: new Date().toISOString(),
  };

  try {
    saveUser(newUser);
    return NextResponse.json(
      { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } },
      { status: 201 }
    );
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Saqlashda xato yuz berdi. Qayta urinib ko\'ring.' }, { status: 500 });
  }
}

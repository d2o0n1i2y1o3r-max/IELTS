import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'd2o0n1i2y1o3r@gmail.com';
const ADMIN_PASSWORD = 'Doniyor2012';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email va parol kiritilishi shart' },
        { status: 400 }
      );
    }

    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        admin: {
          email: ADMIN_EMAIL,
          role: 'SUPER_ADMIN',
          token: 'admin_session_' + Date.now(),
        }
      });
    }

    return NextResponse.json(
      { error: "Email yoki parol noto'g'ri!" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Server xatoligi' },
      { status: 500 }
    );
  }
}

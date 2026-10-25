import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = verifyCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password. Default is ankit / ankitcu21' },
        { status: 401 }
      );
    }

    const cookieData = createSessionCookie();
    const res = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: username.trim(),
    });

    res.cookies.set(cookieData.name, cookieData.value, cookieData.options);
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const cookieData = clearSessionCookie();
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.set(cookieData.name, cookieData.value, cookieData.options);
  return res;
}

import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const authed = isAuthenticated();
  return NextResponse.json({
    authenticated: authed,
    user: authed ? 'ankit' : null,
  });
}

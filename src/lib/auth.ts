import { cookies } from 'next/headers';

const ADMIN_USER = process.env.ADMIN_USER || 'ankit';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'ankitcu21';
const AUTH_COOKIE_NAME = 'cumeal_admin_session';
const SECRET_TOKEN = 'cumeal_secure_session_ankit_2026';

export function verifyCredentials(user: string, pass: string): boolean {
  return user.trim() === ADMIN_USER && pass.trim() === ADMIN_PASS;
}

export function createSessionCookie(): { name: string; value: string; options: any } {
  return {
    name: AUTH_COOKIE_NAME,
    value: SECRET_TOKEN,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  };
}

export function isAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    return token === SECRET_TOKEN;
  } catch {
    return false;
  }
}

export function clearSessionCookie(): { name: string; value: string; options: any } {
  return {
    name: AUTH_COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    },
  };
}

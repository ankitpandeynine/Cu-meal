import { cookies } from 'next/headers';
import { getAllAdmins } from '@/lib/db';

const AUTH_COOKIE_NAME = 'cumeal_admin_session';
const SECRET_TOKEN = 'cumeal_secure_session_ankit_2026';

export function verifyCredentials(user: string, pass: string): { success: boolean; name?: string; role?: string } {
  const cleanUser = user.trim().toLowerCase();
  const cleanPass = pass.trim();

  // 1. Check against master env variables
  const masterUser = (process.env.ADMIN_USER || 'ankit').toLowerCase();
  const masterPass = process.env.ADMIN_PASSWORD || 'ankitcu21';

  if (cleanUser === masterUser && cleanPass === masterPass) {
    return { success: true, name: 'Ankit (Master Admin)', role: 'master' };
  }

  // 2. Check against stored admin accounts
  try {
    const allAdmins = getAllAdmins();
    const found = allAdmins.find(
      (a) => a.username.toLowerCase() === cleanUser && a.password === cleanPass
    );
    if (found) {
      return { success: true, name: found.name, role: found.role };
    }
  } catch (err) {
    console.warn('Error reading admin accounts from db:', err);
  }

  return { success: false };
}

export function createSessionCookie(adminName: string = 'Ankit'): { name: string; value: string; options: any } {
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

import { NextRequest, NextResponse } from 'next/server';
import { getMenuByDate, saveMenu, getAllMenus } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const all = searchParams.get('all');

  if (all === 'true') {
    return NextResponse.json({ menus: getAllMenus() });
  }

  // Default to today in YYYY-MM-DD
  const targetDate = date || new Date().toISOString().split('T')[0];
  const menu = getMenuByDate(targetDate);
  return NextResponse.json({ menu });
}

export async function POST(req: NextRequest) {
  // Allow authenticated admin, or dev environment
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized. Please login as admin.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const saved = saveMenu({
      date: body.date,
      isAvailable: body.isAvailable ?? true,
      unavailableMessage: body.unavailableMessage || 'The menu is currently being updated. Please check back shortly.',
      meals: body.meals || [],
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, menu: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save menu' }, { status: 500 });
  }
}

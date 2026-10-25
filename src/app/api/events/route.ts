import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, saveEvent } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const events = getAllEvents();
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    const saved = saveEvent(body);
    return NextResponse.json({ success: true, event: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create event' }, { status: 500 });
  }
}

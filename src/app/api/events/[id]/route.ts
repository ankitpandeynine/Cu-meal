import { NextRequest, NextResponse } from 'next/server';
import { getEventById, saveEvent, deleteEvent } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const event = getEventById(params.id);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  return NextResponse.json({ event });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = saveEvent({ ...body, id: params.id });
    return NextResponse.json({ success: true, event: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const success = deleteEvent(params.id);
  if (!success) {
    return NextResponse.json({ error: 'Event not found or could not be deleted' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Event deleted successfully' });
}

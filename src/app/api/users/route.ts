import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, saveUser, deleteUser } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const users = getAllUsers();
  return NextResponse.json({ users, count: users.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.email && !body.uid) {
      return NextResponse.json(
        { error: 'Email or Student UID is required' },
        { status: 400 }
      );
    }

    const saved = saveUser(body);
    return NextResponse.json({ success: true, user: saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to save user profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const success = deleteUser(id);
  return NextResponse.json({ success });
}

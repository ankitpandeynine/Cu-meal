import { NextRequest, NextResponse } from 'next/server';
import { getAllAdmins, saveAdmin, deleteAdmin } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admins = getAllAdmins().map((a) => ({
    id: a.id,
    username: a.username,
    name: a.name,
    role: a.role,
    createdAt: a.createdAt,
  }));
  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password, name } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const newAdmin = saveAdmin({
      username: username.trim(),
      password: password.trim(),
      name: name?.trim() || `Admin (${username})`,
      role: 'admin',
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        name: newAdmin.name,
        role: newAdmin.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create admin account' },
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
    return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
  }

  const success = deleteAdmin(id);
  if (!success) {
    return NextResponse.json(
      { error: 'Cannot delete master administrator' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { getAllChatMessages, addChatMessage, likeChatMessage } from '@/lib/db';

export async function GET() {
  const messages = getAllChatMessages();
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  try {
    const { senderName, senderUid, senderHostel, content, isSecretary } = await req.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content cannot be empty' },
        { status: 400 }
      );
    }

    const created = addChatMessage({
      senderName: senderName?.trim() || 'Hostel Student',
      senderUid: senderUid?.trim(),
      senderHostel: senderHostel?.trim() || 'NC / Zakir Hostels',
      content: content.trim(),
      isSecretary: Boolean(isSecretary),
    });

    return NextResponse.json({ success: true, message: created });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to post message' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const updated = likeChatMessage(id);
    if (!updated) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to like message' },
      { status: 500 }
    );
  }
}

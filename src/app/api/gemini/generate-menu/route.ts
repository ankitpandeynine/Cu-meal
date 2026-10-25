import { NextRequest, NextResponse } from 'next/server';
import { generateMenuWithGemini } from '@/lib/gemini';
import { saveMenu } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prompt, targetDate, apiKey, autoSave } = await req.json();

    if (!prompt || !targetDate) {
      return NextResponse.json(
        { error: 'Prompt and targetDate are required' },
        { status: 400 }
      );
    }

    const meals = await generateMenuWithGemini(prompt, targetDate, apiKey);

    let savedMenu = null;
    if (autoSave) {
      savedMenu = saveMenu({
        date: targetDate,
        isAvailable: true,
        meals,
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      meals,
      savedMenu,
      isSaved: Boolean(savedMenu),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to generate menu with Gemini' },
      { status: 500 }
    );
  }
}

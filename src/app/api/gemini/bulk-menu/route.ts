import { NextRequest, NextResponse } from 'next/server';
import { generateBulkWeekMenuWithGemini } from '@/lib/gemini';
import { saveBulkMenus } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { rawText, startDate, apiKey, autoSave } = await req.json();

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide the raw menu text to parse.' },
        { status: 400 }
      );
    }

    const parsedDays = await generateBulkWeekMenuWithGemini(rawText, startDate, apiKey);

    let savedMenus = null;
    if (autoSave && parsedDays.length > 0) {
      const dayMenusToSave = parsedDays.map((d) => ({
        date: d.date,
        isAvailable: true,
        meals: d.meals,
        lastUpdated: new Date().toISOString(),
      }));
      savedMenus = saveBulkMenus(dayMenusToSave);
    }

    return NextResponse.json({
      success: true,
      days: parsedDays,
      savedCount: savedMenus ? savedMenus.length : 0,
      isSaved: Boolean(savedMenus),
      message: savedMenus
        ? `Successfully parsed and saved ${savedMenus.length} days to the live menu plan!`
        : `Successfully parsed ${parsedDays.length} days. Review and click Save All.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process bulk menu with Gemini' },
      { status: 500 }
    );
  }
}

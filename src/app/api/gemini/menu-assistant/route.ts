import { NextRequest, NextResponse } from 'next/server';
import { parseMenuImageWithGemini, modifyDateMenuWithGemini } from '@/lib/gemini';
import { getMenuByDate, saveMenu, saveBulkMenus } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, apiKey } = body;

    // =========================================================================
    // ACTION 1: PARSE IMAGE (Vision: Picture -> Whole Week Day-by-Day Schedule)
    // =========================================================================
    if (action === 'parse-image') {
      const { imageBase64, mimeType, startDate, autoSave } = body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return NextResponse.json(
          { error: 'Image data is required. Please attach a picture of the menu.' },
          { status: 400 }
        );
      }

      const parsedDays = await parseMenuImageWithGemini(
        imageBase64,
        mimeType || 'image/jpeg',
        startDate,
        apiKey
      );

      let savedCount = 0;
      if (autoSave && parsedDays.length > 0) {
        const menusToSave = parsedDays.map((d) => ({
          date: d.date,
          isAvailable: true,
          meals: d.meals,
          lastUpdated: new Date().toISOString(),
        }));
        const saved = saveBulkMenus(menusToSave);
        savedCount = saved.length;
      }

      return NextResponse.json({
        success: true,
        days: parsedDays,
        savedCount,
        isSaved: savedCount > 0,
        message: savedCount > 0
          ? `✓ Gemini Vision parsed and saved ${savedCount} days directly to the live menu!`
          : `✓ Gemini Vision extracted ${parsedDays.length} days of meals. Review and click Publish.`,
      });
    }

    // =========================================================================
    // ACTION 2: MODIFY PARTICULAR DATE (Instruction: "Change Lunch on Friday...")
    // =========================================================================
    if (action === 'modify-day') {
      const { date, instruction, autoSave = true } = body;

      if (!date || !instruction) {
        return NextResponse.json(
          { error: 'Both date and instruction are required.' },
          { status: 400 }
        );
      }

      const existingDayMenu = getMenuByDate(date);
      const currentMeals = existingDayMenu.meals || [];

      const updatedMeals = await modifyDateMenuWithGemini(
        date,
        instruction,
        currentMeals,
        apiKey
      );

      let savedMenu = existingDayMenu;
      if (autoSave) {
        savedMenu = saveMenu({
          date,
          isAvailable: true,
          meals: updatedMeals,
          lastUpdated: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        date,
        menu: savedMenu,
        updatedMeals,
        message: `✓ Menu for ${date} updated successfully with Gemini AI!`,
      });
    }

    return NextResponse.json(
      { error: `Unknown action "${action}". Valid actions: 'parse-image', 'modify-day'` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Gemini Menu Assistant API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Error processing request with Gemini AI' },
      { status: 500 }
    );
  }
}

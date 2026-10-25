import { NextRequest, NextResponse } from 'next/server';
import { generateEventWithGemini } from '@/lib/gemini';
import { saveEvent } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authed = isAuthenticated();
  if (!authed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const { prompt, apiKey, autoPublish, posterTheme } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required. e.g. "Add a Grand Hostel Biryani Fest on Sunday with ice cream and DJ night"' },
        { status: 400 }
      );
    }

    const generatedEventData = await generateEventWithGemini(prompt.trim(), apiKey);

    if (posterTheme) {
      generatedEventData.posterTheme = posterTheme;
    }

    // If autoPublish is requested, immediately save to website database
    let publishedEvent = null;
    if (autoPublish) {
      publishedEvent = saveEvent({
        title: generatedEventData.title || 'Campus Event',
        subtitle: generatedEventData.subtitle,
        date: generatedEventData.date || new Date().toISOString().split('T')[0],
        time: generatedEventData.time || '07:30 PM - 10:00 PM',
        venue: generatedEventData.venue || 'Central Mess Lawn',
        category: generatedEventData.category || 'special-feast',
        description: generatedEventData.description || 'Special hostel gathering.',
        highlights: generatedEventData.highlights || [],
        posterUrl: generatedEventData.posterUrl,
        posterTheme: generatedEventData.posterTheme || 'festive',
        author: generatedEventData.author || 'Ankit Pandey (Admin)',
      });
    }

    return NextResponse.json({
      success: true,
      event: publishedEvent || generatedEventData,
      isPublished: Boolean(publishedEvent),
      message: publishedEvent
        ? 'Event and poster successfully created and published to website!'
        : 'Event generated successfully! Ready for your review.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process Gemini event generation' },
      { status: 500 }
    );
  }
}

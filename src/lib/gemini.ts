import { GoogleGenerativeAI } from '@google/generative-ai';
import { EventPost, MealSlot } from '@/types';

// Curated high quality thematic poster backdrops
const THEME_POSTER_IMAGES: Record<string, string[]> = {
  festive: [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  ],
  foodie: [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  ],
  'dj-night': [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  ],
  neon: [
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  ],
  sports: [
    'https://images.unsplash.com/photo-1531415074868-036b1c57e3b0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  ],
  general: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
  ],
};

export async function generateEventWithGemini(
  prompt: string,
  customApiKey?: string
): Promise<Partial<EventPost>> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `
You are an expert college event planner and campus announcement writer for Chandigarh University (CU) Mess and Hostel Council.
A user will provide a casual prompt asking to create an event or post on the hostel meal & events portal.
Generate a structured JSON response with the following schema (DO NOT include markdown backticks around JSON if possible, just raw JSON):
{
  "title": "string (catchy, exciting event title)",
  "subtitle": "string (one line teaser)",
  "date": "YYYY-MM-DD (estimate realistic future date from prompt, e.g. 2026-11-01)",
  "time": "string (e.g. 07:00 PM - 10:30 PM)",
  "venue": "string (e.g. Central Mess Lawn, NC Block Dining Hall, etc.)",
  "category": "one of: 'special-feast' | 'festival' | 'dj-night' | 'mess-notice' | 'sports' | 'general'",
  "description": "string (engaging, 2-3 paragraph announcement with all details, food specials, timings, instructions)",
  "highlights": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "posterTheme": "one of: 'festive' | 'neon' | 'royal' | 'minimal' | 'foodie'",
  "author": "string (e.g. Mess Committee / Ankit Pandey)",
  "suggestedPosterUrl": "string (leave empty or provide image URL)"
}
`;

      const result = await model.generateContent([systemPrompt, `User Request: "${prompt}"`]);
      const responseText = result.response.text();
      const cleanedJson = responseText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanedJson);
      const category = parsed.category || 'special-feast';
      const themeList = THEME_POSTER_IMAGES[category] || THEME_POSTER_IMAGES.general;
      const posterUrl = parsed.suggestedPosterUrl || themeList[Math.floor(Math.random() * themeList.length)];

      return {
        title: parsed.title,
        subtitle: parsed.subtitle,
        date: parsed.date || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        time: parsed.time || '07:30 PM - 10:00 PM',
        venue: parsed.venue || 'Campus Central Mess Hall',
        category: category,
        description: parsed.description,
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : ['Exciting Special Menu', 'Open for all hostelers', 'Music & Celebrations'],
        posterTheme: parsed.posterTheme || 'festive',
        posterUrl,
        author: parsed.author || 'Ankit Pandey (Hostel Admin)',
      };
    } catch (err) {
      console.warn('[Gemini API Error, falling back to smart heuristic parser]:', err);
    }
  }

  // Fallback Smart Heuristic Parser (works offline & without requiring immediate API key!)
  return smartFallbackEventGenerator(prompt);
}

function smartFallbackEventGenerator(prompt: string): Partial<EventPost> {
  const lower = prompt.toLowerCase();
  let category: EventPost['category'] = 'special-feast';
  let posterTheme: EventPost['posterTheme'] = 'foodie';

  if (lower.includes('diwali') || lower.includes('holi') || lower.includes('festival') || lower.includes('eid') || lower.includes('christmas')) {
    category = 'festival';
    posterTheme = 'festive';
  } else if (lower.includes('dj') || lower.includes('party') || lower.includes('music') || lower.includes('night')) {
    category = 'dj-night';
    posterTheme = 'neon';
  } else if (lower.includes('cricket') || lower.includes('football') || lower.includes('sports') || lower.includes('match') || lower.includes('screening')) {
    category = 'sports';
    posterTheme = 'neon';
  } else if (lower.includes('notice') || lower.includes('meeting') || lower.includes('timing') || lower.includes('change')) {
    category = 'mess-notice';
    posterTheme = 'minimal';
  }

  // Extract or synthesize date
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 4);
  const dateStr = futureDate.toISOString().split('T')[0];

  // Capitalize Title from prompt
  const cleanPrompt = prompt.replace(/add\s+(a\s+|an\s+)?(event|post)?(\s+about)?/i, '').trim();
  const title = cleanPrompt.length > 5
    ? cleanPrompt.slice(0, 1).toUpperCase() + cleanPrompt.slice(1)
    : 'Grand Campus Mess Special Event';

  const themeList = THEME_POSTER_IMAGES[category] || THEME_POSTER_IMAGES.general;
  const posterUrl = themeList[Math.floor(Math.random() * themeList.length)];

  return {
    title,
    subtitle: 'Special announcement from the Chandigarh University Mess Council',
    date: dateStr,
    time: '07:30 PM - 10:00 PM',
    venue: 'Central Mess Grounds & Dining Hall',
    category,
    description: `We are thrilled to announce: ${title}!\n\nJoin us for an unforgettable evening featuring handpicked chef specials, festive decor, and great campus vibes. All hostellers across NC, Zakir, and Girls blocks are invited. Please bring your student ID card for smooth entry.`,
    highlights: [
      'Chef Signature Delicacies & Fresh Tandoori Dishes',
      'Special Festive Dessert Counter',
      'Campus Music & Ambience Lights',
      'Exclusive for CU Hostel Residents'
    ],
    posterTheme,
    posterUrl,
    author: 'Ankit Pandey (Hostel Admin)',
  };
}

export async function generateMenuWithGemini(
  prompt: string,
  targetDate: string,
  customApiKey?: string
): Promise<MealSlot[]> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `
You are an expert hostel mess manager at Chandigarh University.
The user wants to generate meals for date ${targetDate}.
Prompt: "${prompt}"

Return a strict JSON array of 5 meal objects:
[
  { "id": "breakfast", "name": "Breakfast", "time": "07:30 AM - 09:00 AM", "items": "dish1, dish2, tea/coffee", "category": "breakfast" },
  { "id": "lunch", "name": "Lunch", "time": "12:00 PM - 01:45 PM", "items": "dish1, dish2, chapati, rice, salad, pickle", "category": "lunch" },
  { "id": "snacks-boys", "name": "Snacks (Boys)", "time": "04:30 PM - 05:15 PM", "items": "NC: Snack1, Tea\\nZakir: Snack2, Tea", "category": "snacks" },
  { "id": "snacks-girls", "name": "Snacks (Girls)", "time": "04:30 PM - 05:15 PM", "items": "Snack, Tea", "category": "snacks" },
  { "id": "dinner", "name": "Dinner", "time": "07:30 PM - 09:00 PM", "items": "dish1, dish2, roti, rice, sweet, salad", "category": "dinner" }
]
Only raw JSON, no markdown backticks.
`;
      const result = await model.generateContent(systemPrompt);
      const text = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed;
      }
    } catch (e) {
      console.warn('[Gemini Menu Generator Error, using fallback]:', e);
    }
  }

  // Fallback menu
  return [
    {
      id: 'breakfast',
      name: 'Breakfast',
      time: '07:30 AM - 09:00 AM',
      items: 'Paneer Stuffed Paratha, Fresh Curd, Mixed Jam Toast, Boiled Eggs, Tea',
      category: 'breakfast',
    },
    {
      id: 'lunch',
      name: 'Lunch',
      time: '12:00 PM - 01:45 PM',
      items: 'Amritsari Kulche Chole, Boondi Raita, Jeera Rice, Onion Rings, Lemon Pickle',
      category: 'lunch',
    },
    {
      id: 'snacks-boys',
      name: 'Snacks (Boys)',
      time: '04:30 PM - 05:15 PM',
      items: 'NC: Samosa, Green Chutney, Tea\nZakir: Bread Roll, Tea',
      category: 'snacks',
    },
    {
      id: 'snacks-girls',
      name: 'Snacks (Girls)',
      time: '04:30 PM - 05:15 PM',
      items: 'Hot Samosa, Adrak Chai',
      category: 'snacks',
    },
    {
      id: 'dinner',
      name: 'Dinner',
      time: '07:30 PM - 09:00 PM',
      items: 'Kadhai Paneer, Dal Makhani, Butter Roti, Peas Rice, Hot Gulab Jamun, Salad',
      category: 'dinner',
    },
  ];
}

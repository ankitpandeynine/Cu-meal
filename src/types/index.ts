export interface MealSlot {
  id: string;
  name: string;
  time: string;
  items: string;
  notes?: string;
  category?: 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'other';
}

export interface DayMenu {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  unavailableMessage?: string;
  meals: MealSlot[];
  lastUpdated: string;
}

export interface EventPost {
  id: string;
  title: string;
  subtitle?: string;
  date: string; // YYYY-MM-DD or display date
  time?: string;
  venue: string;
  category: 'special-feast' | 'festival' | 'dj-night' | 'mess-notice' | 'sports' | 'general';
  description: string;
  highlights: string[];
  posterUrl?: string;
  posterTheme?: 'festive' | 'neon' | 'royal' | 'minimal' | 'foodie' | 'sports';
  isPinned?: boolean;
  publishedAt: string;
  author: string;
  rsvpUrl?: string;
}

export interface GeminiEventRequest {
  prompt: string;
  targetDate?: string;
  posterTheme?: 'festive' | 'neon' | 'royal' | 'minimal' | 'foodie' | 'sports';
  apiKey?: string;
}

export interface GeminiEventResponse {
  success: boolean;
  event?: Partial<EventPost>;
  error?: string;
}

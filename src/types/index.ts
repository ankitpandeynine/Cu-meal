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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  uid: string; // Student UID e.g. 21BCS...
  hostel: string; // e.g. "NC Boys (Hostel 1)", "Zakir Boys", "Girls Block A", "LC Wing"
  year?: string;
  department?: string;
  provider: 'google' | 'apple' | 'email' | 'guest';
  photoUrl?: string;
  joinedAt: string;
  lastLoginAt: string;
}

export interface BulkDayMenu {
  date: string;
  dayName?: string;
  meals: MealSlot[];
}

export interface BulkWeekMenuResponse {
  success: boolean;
  days: BulkDayMenu[];
  rawSummary?: string;
  error?: string;
}


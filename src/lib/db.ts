import fs from 'fs';
import path from 'path';
import { DayMenu, EventPost, UserProfile, MealSlot } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cumeal_store.json');

interface DatabaseStore {
  menus: Record<string, DayMenu>;
  events: EventPost[];
  users: UserProfile[];
}

const DEFAULT_MENUS: Record<string, DayMenu> = {
  // 2026-10-25 matches the user's uploaded screenshots exactly!
  '2026-10-25': {
    date: '2026-10-25',
    isAvailable: true,
    lastUpdated: new Date().toISOString(),
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Sweet Dalia, Banana, Bread, Boiled Egg, Fat Spread Jam, Tea',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Amritsari Chole, Khatta Meetha Pumpkin, Chapati, Sweet Lassi, Steamed Rice, Beet Cucumber Salad, Mix Pickle',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Samosa, Tea\nZakir: Namkeen, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Rusk, Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Dhaba Dal, Subz Jalfreji, Chapati, Steamed Rice, Green Salad, Mix Pickle, Green Chilli',
        category: 'dinner',
      },
    ],
  },
  '2026-10-26': {
    date: '2026-10-26',
    isAvailable: true,
    lastUpdated: new Date().toISOString(),
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Aloo Pyaz Paratha, Curd, Bread Butter, Tea, Fresh Fruits',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Rajma Masala, Aloo Jeera, Tawa Roti, Jeera Rice, Boondi Raita, Onion Salad',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Veg Cutlet, Tea\nZakir: Bread Pakora, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Veg Cutlet, Hot Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Shahi Paneer, Dal Tadka, Missi Roti, Steamed Rice, Gulab Jamun, Salad',
        category: 'dinner',
      },
    ],
  },
  '2026-10-27': {
    date: '2026-10-27',
    isAvailable: true,
    lastUpdated: new Date().toISOString(),
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Poha with Peanuts & Sev, Boiled Eggs / Sprouts, Toast, Coffee / Tea',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Kadhi Pakora, Aloo Methi, Chapati, Plain Basmati Rice, Mint Chutney, Papad',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Veg Spring Roll, Tea\nZakir: Patties, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Patties, Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Dal Makhani, Mix Veg, Naan & Roti, Peas Pulao, Fruit Custard',
        category: 'dinner',
      },
    ],
  },
  '2026-10-28': {
    date: '2026-10-28',
    isAvailable: false,
    unavailableMessage: 'The menu is currently being updated. Please check back shortly.',
    meals: [],
    lastUpdated: new Date().toISOString(),
  },
};

const DEFAULT_EVENTS: EventPost[] = [
  {
    id: 'event-diwali-grand-feast-2026',
    title: 'Diwali Grand Hostel Feast & Musical DJ Night',
    subtitle: 'Grand 7-course festive dinner with unlimited sweets and music',
    date: '2026-11-01',
    time: '07:00 PM - 10:30 PM',
    venue: 'Central Lawn & Block 3 Grand Dining Hall',
    category: 'festival',
    description: 'Celebrate the Festival of Lights with our biggest hostel feast of the year! Enjoy live tandoor stations, authentic Awadhi Dum Biryani, Shahi Paneer, Kesari Rasmalai, and an open DJ dance floor under the festive lighting.',
    highlights: [
      'Live Tandoor & Chaat Counters',
      'Awadhi Dum Biryani & Shahi Paneer',
      'Unlimited Kesari Rasmalai & Jalebi',
      'Live DJ Setup & Ethnic Dress Code Contest',
      'Free Entry for all CU Hostel Residents'
    ],
    posterUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    posterTheme: 'festive',
    isPinned: true,
    publishedAt: new Date().toISOString(),
    author: 'Ankit Pandey (Hostel Secretary)',
    rsvpUrl: 'https://cumeal.vercel.app/rsvp',
  },
  {
    id: 'event-sunday-biryani-fest',
    title: 'Mega Sunday Special Biryani & Ice Cream Gala',
    subtitle: 'Special weekend treat curated by the Student Mess Committee',
    date: '2026-11-08',
    time: '12:30 PM - 02:30 PM',
    venue: 'All Campus Mess Halls (NC, Zakir, LC & Girls Wing)',
    category: 'special-feast',
    description: 'Get ready for Sunday delight! Savor our slow-cooked aromatic Vegetable & Soy Dum Biryani paired with refreshing Burani Raita, Salan, and Chilled Choco-Chip Cones.',
    highlights: [
      'Hyderabadi Dum Cooking Technique',
      'Garlic Mint Burani Raita',
      'Double Ka Meetha & Choco-Chip Ice Cream',
      'Fast-track express counters for rush management'
    ],
    posterUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
    posterTheme: 'foodie',
    isPinned: false,
    publishedAt: new Date().toISOString(),
    author: 'CU Mess Welfare Council',
  },
  {
    id: 'event-hpl-snack-screenings',
    title: 'Hostel Premier League Finals Live Screening & Snacks',
    subtitle: 'Live match on giant LED screen with hot samosas & cold drinks',
    date: '2026-11-12',
    time: '06:00 PM - 09:30 PM',
    venue: 'Open Air Amphitheatre',
    category: 'sports',
    description: 'Cheer for your hostel team in the Grand Finals! Mess team will be serving piping hot paneer samosas, potato wedges, and cold drinks throughout the match.',
    highlights: [
      'Giant 4K LED Screen Broadcast',
      'Free Match-day Snack Combo',
      'Live Commentary & Face Painting',
      'Lucky draw coupons on entrance'
    ],
    posterUrl: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3b0?auto=format&fit=crop&w=1200&q=80',
    posterTheme: 'neon',
    isPinned: false,
    publishedAt: new Date().toISOString(),
    author: 'Sports & Mess Committee',
  }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-demo-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma21@cuchd.in',
    uid: '21BCS10892',
    hostel: 'NC Boys (Block 1)',
    year: '3rd Year',
    department: 'CSE',
    provider: 'google',
    joinedAt: '2026-10-24T10:15:00Z',
    lastLoginAt: '2026-10-26T08:30:00Z',
  },
  {
    id: 'user-demo-2',
    name: 'Diya Patel',
    email: 'diya.patel22@cuchd.in',
    uid: '22BCS14520',
    hostel: 'Girls Wing (Block C)',
    year: '2nd Year',
    department: 'AI & Data Science',
    provider: 'apple',
    joinedAt: '2026-10-25T14:20:00Z',
    lastLoginAt: '2026-10-26T09:12:00Z',
  },
];

// In-memory cache for serverless environments
let memoryStore: DatabaseStore = {
  menus: { ...DEFAULT_MENUS },
  events: [...DEFAULT_EVENTS],
  users: [...DEFAULT_USERS],
};

function readDb(): DatabaseStore {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryStore = {
        menus: { ...DEFAULT_MENUS, ...(parsed.menus || {}) },
        events: parsed.events || DEFAULT_EVENTS,
        users: parsed.users || DEFAULT_USERS,
      };
      return memoryStore;
    }
  } catch (err) {
    console.warn('[DB] Fallback to in-memory store:', err);
  }
  return memoryStore;
}

function writeDb(data: DatabaseStore) {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB] Unable to write to disk (likely serverless):', err);
  }
}

// ---------------- MENU OPERATIONS ----------------

// Standard cyclical Chandigarh University hostel mess meals by day of week (0=Sunday ... 6=Saturday)
const WEEKLY_CYCLICAL_MENUS: Record<number, { dayName: string; meals: MealSlot[] }> = {
  0: {
    // Sunday (Matching user screenshot 2 & 3)
    dayName: 'Sunday',
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Sweet Dalia, Banana, Bread, Boiled Egg, Fat Spread Jam, Tea',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Amritsari Chole, Khatta Meetha Pumpkin, Chapati, Sweet Lassi, Steamed Rice, Beet Cucumber Salad, Mix Pickle',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Samosa, Tea\nZakir: Namkeen, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Rusk, Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Dhaba Dal, Subz Jalfreji, Chapati, Steamed Rice, Green Salad, Mix Pickle, Green Chilli',
        category: 'dinner',
      },
    ],
  },
  1: {
    // Monday
    dayName: 'Monday',
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Aloo Pyaz Paratha, Fresh Curd, Toast, Mixed Jam, Tea',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Rajma Masala, Aloo Jeera, Tawa Roti, Jeera Rice, Boondi Raita, Onion Salad',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Veg Cutlet, Tea\nZakir: Bread Pakora, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Veg Cutlet, Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Shahi Paneer, Dal Tadka, Missi Roti, Steamed Rice, Gulab Jamun, Salad',
        category: 'dinner',
      },
    ],
  },
  2: {
    // Tuesday
    dayName: 'Tuesday',
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Poha with Peanuts & Sev, Boiled Eggs / Sprouts, Toast, Coffee / Tea',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Kadhi Pakora, Aloo Methi, Chapati, Plain Basmati Rice, Mint Chutney, Papad',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Veg Spring Roll, Tea\nZakir: Patties, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Patties, Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Dal Makhani, Mix Veg, Naan & Roti, Peas Pulao, Fruit Custard',
        category: 'dinner',
      },
    ],
  },
  3: {
    // Wednesday
    dayName: 'Wednesday',
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Idli Sambar, Coconut Chutney, Toast Butter, Boiled Eggs, Tea',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Chana Dal, Baingan Bharta, Tawa Roti, Lemon Rice, Green Salad, Pickle',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Bread Roll, Tea\nZakir: Samosa, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Bread Roll, Hot Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Matar Paneer, Yellow Dal Fry, Chapati, Jeera Rice, Rasgulla, Salad',
        category: 'dinner',
      },
    ],
  },
  4: {
    // Thursday
    dayName: 'Thursday',
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Paneer Kulcha, Curd, Bread Butter, Boiled Eggs, Tea',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Black Chana Masala, Lauki Kofta, Chapati, Steamed Rice, Boondi Raita',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Maggi, Tea\nZakir: Biscuits & Mathri, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Veg Maggi, Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Dal Tadka, Kadhai Veg, Butter Roti, Vegetable Biryani, Ice Cream',
        category: 'dinner',
      },
    ],
  },
  5: {
    // Friday
    dayName: 'Friday',
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Methi Paratha, Mixed Pickle, Curd, Boiled Egg, Coffee / Tea',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Amritsari Dal, Soyabean Aloo Curry, Chapati, Plain Rice, Kachumber Salad',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Bread Pakora, Tea\nZakir: Samosa, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Bread Pakora, Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Paneer Butter Masala, Kashmiri Dal, Garlic Naan, Peas Pulao, Kheer',
        category: 'dinner',
      },
    ],
  },
  6: {
    // Saturday
    dayName: 'Saturday',
    meals: [
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:30 AM - 09:00 AM',
        items: 'Pav Bhaji, Sprouts Salad, Toast, Hot Tea',
        category: 'breakfast',
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00 PM - 01:45 PM',
        items: 'Rajma Curry, Jeera Aloo, Chapati, Steamed Basmati Rice, Fresh Curd, Pickle',
        category: 'lunch',
      },
      {
        id: 'snacks-boys',
        name: 'Snacks (Boys)',
        time: '04:30 PM - 05:15 PM',
        items: 'NC: Samosa, Tea\nZakir: Namkeen, Tea',
        category: 'snacks',
      },
      {
        id: 'snacks-girls',
        name: 'Snacks (Girls)',
        time: '04:30 PM - 05:15 PM',
        items: 'Samosa, Tea',
        category: 'snacks',
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '07:30 PM - 09:00 PM',
        items: 'Dal Makhani, Dum Aloo, Missi Roti, Jeera Rice, Jalebi, Green Salad',
        category: 'dinner',
      },
    ],
  },
};

export function getMenuByDate(date: string): DayMenu {
  const db = readDb();
  if (db.menus[date]) {
    return db.menus[date];
  }

  // Generate realistic menu for date based on its day of week
  const parsed = new Date(date + 'T12:00:00Z');
  const dayOfWeek = isNaN(parsed.getTime()) ? new Date().getDay() : parsed.getUTCDay();
  const cyclical = WEEKLY_CYCLICAL_MENUS[dayOfWeek] || WEEKLY_CYCLICAL_MENUS[0];

  return {
    date,
    isAvailable: true,
    meals: cyclical.meals,
    lastUpdated: new Date().toISOString(),
  };
}

export function getAllMenus(): Record<string, DayMenu> {
  const db = readDb();
  const result: Record<string, DayMenu> = { ...db.menus };

  // Ensure next 14 days and past 7 days are always pre-populated so whole week offline cache has complete data!
  const today = new Date();
  for (let i = -7; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    if (!result[dateStr]) {
      result[dateStr] = getMenuByDate(dateStr);
    }
  }

  return result;
}

export function saveMenu(menu: DayMenu): DayMenu {
  const db = readDb();
  const updatedMenu: DayMenu = {
    ...menu,
    lastUpdated: new Date().toISOString(),
  };
  db.menus[menu.date] = updatedMenu;
  writeDb(db);
  return updatedMenu;
}

// ---------------- EVENT OPERATIONS ----------------

export function getAllEvents(): EventPost[] {
  const db = readDb();
  return [...db.events].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function getEventById(id: string): EventPost | null {
  const db = readDb();
  return db.events.find((e) => e.id === id) || null;
}

export function saveEvent(event: Omit<EventPost, 'id' | 'publishedAt'> & { id?: string; publishedAt?: string }): EventPost {
  const db = readDb();
  const id = event.id || `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const publishedAt = event.publishedAt || new Date().toISOString();

  const newEvent: EventPost = {
    ...event,
    id,
    publishedAt,
    author: event.author || 'Ankit Pandey (Admin)',
    highlights: event.highlights || [],
    category: event.category || 'general',
  };

  const existingIndex = db.events.findIndex((e) => e.id === id);
  if (existingIndex >= 0) {
    db.events[existingIndex] = newEvent;
  } else {
    db.events.unshift(newEvent);
  }

  writeDb(db);
  return newEvent;
}

export function deleteEvent(id: string): boolean {
  const db = readDb();
  const initialLength = db.events.length;
  db.events = db.events.filter((e) => e.id !== id);
  if (db.events.length !== initialLength) {
    writeDb(db);
    return true;
  }
  return false;
}

// ---------------- BULK MENU OPERATIONS ----------------

export function saveBulkMenus(dayMenus: DayMenu[]): DayMenu[] {
  const db = readDb();
  const saved: DayMenu[] = [];
  for (const m of dayMenus) {
    const updated: DayMenu = {
      ...m,
      isAvailable: m.isAvailable ?? true,
      lastUpdated: new Date().toISOString(),
    };
    db.menus[m.date] = updated;
    saved.push(updated);
  }
  writeDb(db);
  return saved;
}

// ---------------- USER OPERATIONS ----------------

export function getAllUsers(): UserProfile[] {
  const db = readDb();
  return [...(db.users || [])].sort(
    (a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
  );
}

export function saveUser(profile: Partial<UserProfile> & { email: string }): UserProfile {
  const db = readDb();
  if (!db.users) db.users = [];

  const existingIndex = db.users.findIndex(
    (u) => u.email.toLowerCase() === profile.email.toLowerCase() || (profile.uid && u.uid === profile.uid)
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const updated: UserProfile = {
      ...db.users[existingIndex],
      ...profile,
      lastLoginAt: now,
    };
    db.users[existingIndex] = updated;
    writeDb(db);
    return updated;
  }

  const newUser: UserProfile = {
    id: profile.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: profile.name || 'CU Hosteller',
    email: profile.email,
    uid: profile.uid || '',
    hostel: profile.hostel || 'NC Boys (Block 1)',
    year: profile.year || '1st Year',
    department: profile.department || 'General',
    provider: profile.provider || 'google',
    joinedAt: now,
    lastLoginAt: now,
    photoUrl: profile.photoUrl,
  };

  db.users.unshift(newUser);
  writeDb(db);
  return newUser;
}

export function deleteUser(id: string): boolean {
  const db = readDb();
  if (!db.users) return false;
  const initLen = db.users.length;
  db.users = db.users.filter((u) => u.id !== id);
  if (db.users.length !== initLen) {
    writeDb(db);
    return true;
  }
  return false;
}


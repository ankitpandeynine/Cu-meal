import fs from 'fs';
import path from 'path';
import { DayMenu, EventPost } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cumeal_store.json');

interface DatabaseStore {
  menus: Record<string, DayMenu>;
  events: EventPost[];
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

// In-memory cache for serverless environments
let memoryStore: DatabaseStore = {
  menus: { ...DEFAULT_MENUS },
  events: [...DEFAULT_EVENTS],
};

function readDb(): DatabaseStore {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryStore = {
        menus: { ...DEFAULT_MENUS, ...(parsed.menus || {}) },
        events: parsed.events || DEFAULT_EVENTS,
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

export function getMenuByDate(date: string): DayMenu {
  const db = readDb();
  if (db.menus[date]) {
    return db.menus[date];
  }
  // Return default unavailable status for days without registered menu
  return {
    date,
    isAvailable: false,
    unavailableMessage: 'The menu is currently being updated. Please check back shortly.',
    meals: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function getAllMenus(): Record<string, DayMenu> {
  const db = readDb();
  return db.menus;
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

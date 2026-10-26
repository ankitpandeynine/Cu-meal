'use client';

import React, { useState, useEffect } from 'react';
import CalendarBar from '@/components/CalendarBar';
import MealCard from '@/components/MealCard';
import MenuUnavailable from '@/components/MenuUnavailable';
import BottomNav, { NavTab } from '@/components/BottomNav';
import DesktopHeader from '@/components/DesktopHeader';
import ProfileView from '@/components/ProfileView';
import EventCard from '@/components/EventCard';
import EventModal from '@/components/EventModal';
import AuthModal from '@/components/AuthModal';
import { DayMenu, EventPost, UserProfile } from '@/types';
import { Sparkles, Utensils, RefreshCw, Filter, BellRing, WifiOff, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-25');
  const [activeTab, setActiveTab] = useState<NavTab>('meal');
  const [menuData, setMenuData] = useState<DayMenu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(true);
  const [events, setEvents] = useState<EventPost[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<EventPost | null>(null);
  const [hostelFilter, setHostelFilter] = useState<'all' | 'boys' | 'girls'>('all');

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Offline State
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Check login & trigger pop-up on launch if not signed in per request
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('cumeal_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        // Automatically default hostel filter if user has hostel saved
        if (parsed.hostel?.toLowerCase().includes('girl')) {
          setHostelFilter('girls');
        } else if (parsed.hostel?.toLowerCase().includes('boy')) {
          setHostelFilter('boys');
        }
      } else {
        // User requested: "keep giving login pop up everytime website open when not siged in"
        setShowAuthModal(true);
      }
    } catch {}

    // Listen to online / offline events
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Fetch Menu for Selected Date (with offline fallback cache)
  const fetchMenu = async (date: string) => {
    setLoadingMenu(true);
    try {
      const res = await fetch(`/api/menu?date=${date}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data.menu) {
        setMenuData(data.menu);
        // Cache to offline store
        try {
          const cacheRaw = localStorage.getItem('cumeal_offline_cache');
          const cache = cacheRaw ? JSON.parse(cacheRaw) : {};
          cache[date] = data.menu;
          localStorage.setItem('cumeal_offline_cache', JSON.stringify(cache));
        } catch {}
      }
    } catch (err) {
      // Offline fallback: check localStorage
      try {
        const cacheRaw = localStorage.getItem('cumeal_offline_cache');
        if (cacheRaw) {
          const cache = JSON.parse(cacheRaw);
          if (cache[date]) {
            setMenuData(cache[date]);
            setIsOffline(true);
            setLoadingMenu(false);
            return;
          }
        }
      } catch {}
      console.warn('Failed to load menu, using fallback data');
    } finally {
      setLoadingMenu(false);
    }
  };

  // Fetch Events
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchMenu(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cumeal_user');
    setCurrentUser(null);
    setShowAuthModal(true);
  };

  // Filter meals according to hostel selection
  const filteredMeals = (menuData?.meals || []).filter((meal) => {
    if (hostelFilter === 'boys') {
      return !meal.id.includes('girls');
    }
    if (hostelFilter === 'girls') {
      return !meal.id.includes('boys');
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#000000] text-[#09090b] dark:text-[#f4f4f5] transition-colors duration-300">
      {/* Desktop macOS-inspired Header (visible on tablets/desktops) */}
      <DesktopHeader
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        user={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        eventCount={events.length}
        isOffline={isOffline}
      />

      {/* Main Responsive Body Container */}
      <main className="w-full flex-1 flex flex-col">
        {/* ======================================================== */}
        {/* TAB 1: MEALS & CALENDAR                                  */}
        {/* ======================================================== */}
        {activeTab === 'meal' && (
          <div className="w-full flex-1 flex flex-col">
            {/* Mobile iOS Container vs Desktop macOS Multi-Column Layout */}
            <div className="w-full max-w-7xl mx-auto md:px-8 md:py-6 flex-1 flex flex-col md:flex-row gap-6">
              {/* Left Column on Desktop / Top bar on Mobile: Calendar & Filter */}
              <div className="w-full md:w-[360px] md:shrink-0 flex flex-col md:gap-4">
                {/* Expandable Calendar Header */}
                <div className="md:rounded-3xl md:overflow-hidden md:border md:border-black/[0.06] md:dark:border-white/[0.08] md:shadow-ios md:dark:shadow-ios-dark">
                  <CalendarBar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    isOffline={isOffline}
                  />
                </div>

                {/* Filter and Hostel Wing selector */}
                <div className="px-4 sm:px-6 md:px-0 pt-3 md:pt-0">
                  <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl p-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1">
                      Wing Filter:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setHostelFilter('all')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          hostelFilter === 'all'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setHostelFilter('boys')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          hostelFilter === 'boys'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        NC/Zakir Boys
                      </button>
                      <button
                        onClick={() => setHostelFilter('girls')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          hostelFilter === 'girls'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        Girls Wing
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop-only quick status card */}
                <div className="hidden md:block bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Mess Status
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Mess Open</span>
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    Hostel mess meals are prepared with strict hygiene standards under student committee supervision.
                  </p>
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Selected: {selectedDate}</span>
                    <Link href="/admin" className="text-rose-500 font-bold hover:underline">
                      Admin Edit ✏️
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column / Main Meal Area */}
              <div className="flex-1 px-4 sm:px-6 md:px-0 py-2 md:py-0 pb-24 md:pb-8">
                {loadingMenu ? (
                  <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
                    <p className="text-xs font-medium">Fetching mess schedule...</p>
                  </div>
                ) : !menuData?.isAvailable || filteredMeals.length === 0 ? (
                  <MenuUnavailable
                    message={menuData?.unavailableMessage}
                    onRefresh={() => fetchMenu(selectedDate)}
                  />
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredMeals.map((meal) => (
                      <MealCard key={meal.id} meal={meal} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CAMPUS EVENTS                                     */}
        {/* ======================================================== */}
        {activeTab === 'events' && (
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 animate-fade-in flex-1 pb-24 md:pb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
                  <span>Campus Feasts & Notices</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Festivals, DJ nights, and special dinners curated with Gemini AI
                </p>
              </div>

              <Link
                href="/admin"
                className="text-xs font-bold text-white bg-black dark:bg-white dark:text-black px-4 py-2 rounded-2xl shadow-sm hover:opacity-90 active:scale-95 transition"
              >
                + Add Event
              </Link>
            </div>

            {loadingEvents ? (
              <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
                <p className="text-xs font-medium">Loading campus announcements...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-zinc-500 font-medium">No upcoming events right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onOpenDetails={(ev) => setSelectedEvent(ev)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PROFILE & SETTINGS                                */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <ProfileView
            user={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Floating Bottom Nav for Mobile Phone View */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        eventCount={events.length}
      />

      {/* Event Details Dialog Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* User Login & Student UID Onboarding Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.hostel?.toLowerCase().includes('girl')) {
            setHostelFilter('girls');
          } else if (user.hostel?.toLowerCase().includes('boy')) {
            setHostelFilter('boys');
          }
        }}
      />
    </div>
  );
}

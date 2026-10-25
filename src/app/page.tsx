'use client';

import React, { useState, useEffect } from 'react';
import CalendarBar from '@/components/CalendarBar';
import MealCard from '@/components/MealCard';
import MenuUnavailable from '@/components/MenuUnavailable';
import BottomNav, { NavTab } from '@/components/BottomNav';
import ProfileView from '@/components/ProfileView';
import EventCard from '@/components/EventCard';
import EventModal from '@/components/EventModal';
import { DayMenu, EventPost } from '@/types';
import { Sparkles, Utensils, RefreshCw, Filter, BellRing } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  // Use 2026-10-25 as starting default date to showcase the exact data from user's screenshots!
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-25');
  const [activeTab, setActiveTab] = useState<NavTab>('meal');
  const [menuData, setMenuData] = useState<DayMenu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(true);
  const [events, setEvents] = useState<EventPost[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<EventPost | null>(null);
  const [hostelFilter, setHostelFilter] = useState<'all' | 'boys' | 'girls'>('all');

  // Fetch Menu for Selected Date
  const fetchMenu = async (date: string) => {
    setLoadingMenu(true);
    try {
      const res = await fetch(`/api/menu?date=${date}`);
      const data = await res.json();
      if (data.menu) {
        setMenuData(data.menu);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
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

  // Filter meals if user chose specific hostel filter
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
    <main className="w-full flex-1 flex flex-col">
      {/* ----------------- TAB: MEAL ----------------- */}
      {activeTab === 'meal' && (
        <div className="w-full animate-fade-in flex-1 flex flex-col">
          {/* Top Calendar Bar matching screenshots */}
          <CalendarBar
            selectedDate={selectedDate}
            onSelectDate={(newDate) => setSelectedDate(newDate)}
          />

          {/* Quick Hostel Filter & Status bar */}
          <div className="px-5 pt-3 pb-1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl">
              <button
                onClick={() => setHostelFilter('all')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  hostelFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Meals
              </button>
              <button
                onClick={() => setHostelFilter('boys')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  hostelFilter === 'boys'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Boys (NC/Zakir)
              </button>
              <button
                onClick={() => setHostelFilter('girls')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  hostelFilter === 'girls'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Girls Wing
              </button>
            </div>

            <Link
              href="/admin"
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl transition"
            >
              Admin Edit ✏️
            </Link>
          </div>

          {/* Main Content Area */}
          <div className="px-5 py-4 flex-1">
            {loadingMenu ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
                <p className="text-sm font-medium">Fetching today's mess menu...</p>
              </div>
            ) : !menuData?.isAvailable || filteredMeals.length === 0 ? (
              /* Menu Unavailable State matching Screenshot 1 */
              <MenuUnavailable
                message={menuData?.unavailableMessage}
                onRefresh={() => fetchMenu(selectedDate)}
              />
            ) : (
              /* Menu Available Cards matching Screenshot 2 & 3 */
              <div className="space-y-4">
                {filteredMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: EVENTS ----------------- */}
      {activeTab === 'events' && (
        <div className="w-full px-5 pt-6 animate-fade-in flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>Campus Events & Feasts</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Special feasts, DJ nights & hostel notices powered by Gemini AI
              </p>
            </div>

            <Link
              href="/admin"
              className="text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500 px-3.5 py-2 rounded-2xl shadow-sm hover:opacity-90 active:scale-95 transition"
            >
              + Add Event
            </Link>
          </div>

          {loadingEvents ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-sm font-medium">Loading campus announcements...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-500 font-medium">No upcoming events right now.</p>
              <Link
                href="/admin"
                className="mt-3 inline-block text-xs font-semibold text-rose-500 underline"
              >
                Go to Admin Portal to create one with Gemini
              </Link>
            </div>
          ) : (
            <div className="space-y-5 pb-6">
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

      {/* ----------------- TAB: PROFILE ----------------- */}
      {activeTab === 'profile' && <ProfileView />}

      {/* Floating Bottom Navigation Bar matching Screenshot 1 & 4 */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(t) => setActiveTab(t)}
        eventCount={events.length}
      />

      {/* Event Details Dialog Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </main>
  );
}

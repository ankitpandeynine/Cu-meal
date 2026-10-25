'use client';

import React from 'react';
import { UtensilsCrossed, CalendarDays, User } from 'lucide-react';

export type NavTab = 'meal' | 'events' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  eventCount?: number;
}

export default function BottomNav({ activeTab, onChangeTab, eventCount }: BottomNavProps) {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none px-4">
      <nav
        aria-label="Bottom Navigation"
        className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-full shadow-2xl shadow-sky-950/10"
      >
        {/* Meal Tab */}
        <button
          onClick={() => onChangeTab('meal')}
          className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
            activeTab === 'meal'
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 stroke-[2.2]" />
          <span>Meal</span>
        </button>

        {/* Events / Game Tab */}
        <button
          onClick={() => onChangeTab('events')}
          className={`relative flex items-center gap-2 py-2 px-5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
            activeTab === 'events'
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-4 h-4 stroke-[2.2]" />
          <span>Events</span>
          {eventCount !== undefined && eventCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
            activeTab === 'profile'
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4 stroke-[2.2]" />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

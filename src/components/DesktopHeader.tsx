'use client';

import React from 'react';
import Link from 'next/link';
import { NavTab } from './BottomNav';
import { UserProfile } from '@/types';
import {
  UtensilsCrossed,
  CalendarDays,
  User,
  Sun,
  Moon,
  Lock,
  CloudCheck,
  WifiOff,
} from 'lucide-react';

interface DesktopHeaderProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  eventCount: number;
  isOffline: boolean;
}

export default function DesktopHeader({
  activeTab,
  onChangeTab,
  user,
  onOpenAuth,
  eventCount,
  isOffline,
}: DesktopHeaderProps) {
  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('cumeal_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="hidden md:flex w-full sticky top-0 z-30 glass-nav border-b border-black/[0.06] dark:border-white/[0.08] px-8 py-3.5 items-center justify-between transition-all">
      {/* Brand & macOS Window Controls Aesthetic */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div
            onClick={() => onChangeTab('meal')}
            className="cursor-pointer flex items-center gap-2 group"
          >
            <span className="font-black text-lg text-zinc-950 dark:text-white tracking-tight">
              CU Meal
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
              Chandigarh University
            </span>
          </div>
        </div>

        {/* Tab Navigation items */}
        <nav className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => onChangeTab('meal')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition ${
              activeTab === 'meal'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Meals & Calendar</span>
          </button>

          <button
            onClick={() => onChangeTab('events')}
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl transition ${
              activeTab === 'events'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Campus Events</span>
            {eventCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => onChangeTab('profile')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Offline Chip */}
        {isOffline ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline Week Active</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Online</span>
          </span>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          title="Toggle Light / Dark mode"
          aria-label="Toggle theme"
        >
          <Sun className="w-4 h-4 dark:hidden" />
          <Moon className="w-4 h-4 hidden dark:block" />
        </button>

        {/* Admin Portal Gateway */}
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition border border-black/5 dark:border-white/10"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Admin</span>
        </Link>

        {/* User Pill or Sign In Button */}
        {user ? (
          <div
            onClick={() => onChangeTab('profile')}
            className="cursor-pointer flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 hover:opacity-90 transition"
          >
            <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="text-left text-xs">
              <span className="font-bold text-zinc-900 dark:text-white block leading-tight">
                {user.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {user.uid}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-4 py-1.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-sm hover:opacity-90 transition ios-active"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

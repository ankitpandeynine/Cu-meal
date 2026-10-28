'use client';

import React from 'react';
import Link from 'next/link';
import { NavTab } from './BottomNav';
import { UserProfile } from '@/types';
import {
  UtensilsCrossed,
  MessageSquare,
  User,
  Sun,
  Moon,
  Lock,
  WifiOff,
} from 'lucide-react';

interface DesktopHeaderProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  isOffline: boolean;
}

export default function DesktopHeader({
  activeTab,
  onChangeTab,
  user,
  onOpenAuth,
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
    <header className="hidden md:flex w-full sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] px-8 py-3.5 items-center justify-between transition-all">
      {/* Clean Brand (without the 3 mac dots) */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => onChangeTab('meal')}
          className="cursor-pointer flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm shadow-sm">
            CU
          </div>
          <span className="font-black text-lg text-zinc-950 dark:text-white tracking-tight">
            CU Meal
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
            Hostel Portal
          </span>
        </div>

        {/* Glass UI Tab Navigation Switcher */}
        <nav className="flex items-center gap-1.5 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.1] p-1.5 rounded-2xl shadow-sm text-xs font-bold">
          <button
            onClick={() => onChangeTab('meal')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all duration-200 ${
              activeTab === 'meal'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Meals & Calendar</span>
          </button>

          <button
            onClick={() => onChangeTab('chat')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mess Chat</span>
          </button>

          <button
            onClick={() => onChangeTab('profile')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
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

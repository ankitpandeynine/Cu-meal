'use client';

import React from 'react';
import { UtensilsCrossed, MessageSquare, User } from 'lucide-react';

export type NavTab = 'meal' | 'chat' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  messageCount?: number;
}

export default function BottomNav({ activeTab, onChangeTab, messageCount }: BottomNavProps) {
  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none px-4 md:hidden">
      <nav
        aria-label="Bottom Navigation"
        className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-3xl border border-black/[0.08] dark:border-white/[0.12] rounded-full shadow-2xl transition-all"
      >
        {/* Meal Tab */}
        <button
          onClick={() => onChangeTab('meal')}
          className={`flex items-center gap-2 py-2 px-5 rounded-full text-xs font-bold transition-all ios-active ${
            activeTab === 'meal'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 stroke-[2.2]" />
          <span>Meal</span>
        </button>

        {/* Chat Tab */}
        <button
          onClick={() => onChangeTab('chat')}
          className={`relative flex items-center gap-2 py-2 px-5 rounded-full text-xs font-bold transition-all ios-active ${
            activeTab === 'chat'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 stroke-[2.2]" />
          <span>Chat</span>
          {messageCount !== undefined && messageCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        {/* Profile / Settings Tab */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex items-center gap-2 py-2 px-5 rounded-full text-xs font-bold transition-all ios-active ${
            activeTab === 'profile'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4 stroke-[2.2]" />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}

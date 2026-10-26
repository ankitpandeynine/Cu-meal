'use client';

import React from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';

interface MenuUnavailableProps {
  message?: string;
  onRefresh?: () => void;
}

export default function MenuUnavailable({
  message = 'The menu is currently being updated. Please check back shortly.',
  onRefresh,
}: MenuUnavailableProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-3xl my-6">
      <div className="w-16 h-20 mb-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex flex-col items-center justify-center p-3 shadow-sm">
        <div className="w-6 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mb-3" />
        <ClipboardList className="w-8 h-8 text-zinc-400 dark:text-zinc-500 stroke-[1.5]" />
      </div>

      <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1.5">
        Menu Unavailable
      </h3>

      <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-xs leading-relaxed">
        {message}
      </p>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition ios-active"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check Again</span>
        </button>
      )}
    </div>
  );
}

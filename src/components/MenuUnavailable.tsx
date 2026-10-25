'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';

interface MenuUnavailableProps {
  message?: string;
  onRefresh?: () => void;
}

export default function MenuUnavailable({
  message = 'The menu is currently being updated. Please check back shortly.',
  onRefresh,
}: MenuUnavailableProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      {/* Icon matching Screenshot 1 */}
      <div className="w-20 h-24 mb-6 rounded-2xl border-2 border-slate-300 bg-white/80 flex flex-col items-center justify-center p-3 shadow-sm">
        <div className="w-8 h-2 bg-slate-200 rounded-full mb-3" />
        <ClipboardList className="w-10 h-10 text-slate-400 stroke-[1.5]" />
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Menu Unavailable
      </h3>

      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        {message}
      </p>

      {onRefresh && (
        <button
          onClick={onRefresh}
          className="mt-6 px-4 py-2 rounded-xl text-xs font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 transition active:scale-95"
        >
          Check Again
        </button>
      )}
    </div>
  );
}

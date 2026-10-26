'use client';

import React from 'react';
import { MealSlot } from '@/types';
import { Coffee, Utensils, Cookie, Moon, Sparkles, Clock } from 'lucide-react';

interface MealCardProps {
  meal: MealSlot;
  isServingNow?: boolean;
  isUpcomingNext?: boolean;
}

export default function MealCard({ meal, isServingNow = false, isUpcomingNext = false }: MealCardProps) {
  const getIcon = () => {
    const id = meal.id.toLowerCase();
    if (id.includes('breakfast')) return <Coffee className="w-5 h-5 text-amber-500" />;
    if (id.includes('lunch')) return <Utensils className="w-5 h-5 text-emerald-500" />;
    if (id.includes('snack')) return <Cookie className="w-5 h-5 text-orange-500" />;
    if (id.includes('dinner')) return <Moon className="w-5 h-5 text-indigo-400" />;
    return <Sparkles className="w-5 h-5 text-zinc-400" />;
  };

  const lines = meal.items.split('\n');

  return (
    <div
      className={`w-full bg-white/75 dark:bg-zinc-900/65 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-ios dark:shadow-ios-dark transition-all duration-300 ${
        isServingNow
          ? 'border-2 border-emerald-500/60 ring-4 ring-emerald-500/10'
          : isUpcomingNext
          ? 'border border-amber-500/30'
          : 'border border-black/[0.06] dark:border-white/[0.08] hover:shadow-md'
      }`}
    >
      {/* Header with Title and Time Capsule */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {meal.name}
            </h2>
            {isServingNow && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Serving Now</span>
              </span>
            )}
            {isUpcomingNext && !isServingNow && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Next Meal
              </span>
            )}
          </div>
          <div className="p-2.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80">
            {getIcon()}
          </div>
        </div>

        {/* Minimalist Time Pill */}
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>{meal.time}</span>
          </span>
        </div>
      </div>

      {/* Food Items content */}
      <div className="text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed mt-3 space-y-2">
        {lines.map((line, idx) => {
          const isHostelLabel = line.includes(':');
          if (isHostelLabel) {
            const [hostel, rest] = line.split(':');
            return (
              <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-bold text-xs uppercase px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-black/5 dark:border-white/10">
                  {hostel.trim()}
                </span>
                <span className="text-zinc-700 dark:text-zinc-300 font-normal">{rest.trim()}</span>
              </div>
            );
          }
          return (
            <p key={idx} className="font-normal text-zinc-800 dark:text-zinc-200">
              {line}
            </p>
          );
        })}
      </div>

      {meal.notes && (
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <span>💡</span>
          <span>{meal.notes}</span>
        </div>
      )}
    </div>
  );
}

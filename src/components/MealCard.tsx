'use client';

import React from 'react';
import { MealSlot } from '@/types';
import { Coffee, Utensils, Cookie, Moon, Sparkles } from 'lucide-react';

interface MealCardProps {
  meal: MealSlot;
}

export default function MealCard({ meal }: MealCardProps) {
  const getIcon = () => {
    const id = meal.id.toLowerCase();
    if (id.includes('breakfast')) return <Coffee className="w-5 h-5 text-amber-700" />;
    if (id.includes('lunch')) return <Utensils className="w-5 h-5 text-emerald-700" />;
    if (id.includes('snack')) return <Cookie className="w-5 h-5 text-orange-700" />;
    if (id.includes('dinner')) return <Moon className="w-5 h-5 text-indigo-700" />;
    return <Sparkles className="w-5 h-5 text-sky-700" />;
  };

  // Split lines if there are hostel distinctions (e.g., NC: ... / Zakir: ...)
  const lines = meal.items.split('\n');

  return (
    <div className="w-full bg-[#a3ecf5] hover:bg-[#97e8f3] border border-cyan-200/70 rounded-3xl p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Header with Title and Time Capsule */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {meal.name}
            </h2>
          </div>
          <div className="p-2 rounded-2xl bg-white/60 text-slate-700">
            {getIcon()}
          </div>
        </div>

        {/* Time slot pill matching screenshot */}
        <div>
          <span className="inline-block bg-white/70 backdrop-blur-sm text-slate-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {meal.time}
          </span>
        </div>
      </div>

      {/* Food Items content */}
      <div className="text-slate-800 text-[16px] leading-relaxed font-normal mt-2 space-y-1">
        {lines.map((line, idx) => {
          const isHostelLabel = line.includes(':');
          if (isHostelLabel) {
            const [hostel, rest] = line.split(':');
            return (
              <p key={idx} className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-semibold text-slate-900 bg-white/40 px-1.5 py-0.5 rounded text-sm">
                  {hostel}:
                </span>
                <span>{rest}</span>
              </p>
            );
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>

      {meal.notes && (
        <div className="mt-3 pt-2 border-t border-cyan-300/40 text-xs text-slate-600 italic">
          💡 {meal.notes}
        </div>
      )}
    </div>
  );
}

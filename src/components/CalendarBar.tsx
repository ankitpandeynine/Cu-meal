'use client';

import React from 'react';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarBarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export default function CalendarBar({ selectedDate, onSelectDate }: CalendarBarProps) {
  const parsedSelected = parseISO(selectedDate);
  const today = new Date();

  // Generate a 14-day window around selected date or today
  // Starting from 3 days before today to 10 days ahead
  const days = Array.from({ length: 14 }).map((_, index) => {
    return subDays(today, 2 + -index);
  });

  const isToday = isSameDay(parsedSelected, today);

  const handleNextDay = () => {
    const next = addDays(parsedSelected, 1);
    onSelectDate(format(next, 'yyyy-MM-dd'));
  };

  const handlePrevDay = () => {
    const prev = subDays(parsedSelected, 1);
    onSelectDate(format(prev, 'yyyy-MM-dd'));
  };

  return (
    <div className="w-full pt-4 pb-2 px-5 border-b border-sky-100/80 bg-white/60 backdrop-blur-md sticky top-0 z-20">
      {/* Top row with Title and Tomorrow shortcut */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {isToday ? 'Today' : format(parsedSelected, 'EEEE')}
          </h1>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
        </div>

        <button
          onClick={handleNextDay}
          className="flex items-center gap-0.5 text-rose-500 hover:text-rose-600 font-semibold text-sm transition-transform active:scale-95"
        >
          <span>Tomorrow</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Date Picker Carousel */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
        {days.map((day) => {
          const formattedIso = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, parsedSelected);
          const dayNumber = format(day, 'd');
          const dayName = format(day, 'EEE').slice(0, 2);

          return (
            <button
              key={formattedIso}
              onClick={() => onSelectDate(formattedIso)}
              className={`flex flex-col items-center justify-center min-w-[42px] py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-rose-50 border-2 border-rose-300 text-rose-500 shadow-sm shadow-rose-200 font-bold'
                  : 'hover:bg-slate-100/70 text-slate-500 font-medium'
              }`}
            >
              <span className={`text-base ${isSelected ? 'text-rose-600' : 'text-slate-800'}`}>
                {dayNumber}
              </span>
              <span className={`text-xs ${isSelected ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
                {dayName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary date subheader matching screenshot 2 */}
      <div className="flex items-center justify-between mt-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-sky-600 font-semibold text-lg">
            {format(parsedSelected, 'd MMMM yyyy')}
          </span>
          <span className="p-1 rounded-full bg-sky-100 text-sky-600">
            <CalendarIcon className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-lg hover:bg-slate-100 transition active:scale-90"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectDate(format(today, 'yyyy-MM-dd'))}
            className="px-2 py-0.5 rounded-md hover:bg-slate-100 font-medium text-slate-600 transition"
          >
            Today
          </button>
          <button
            onClick={handleNextDay}
            className="p-1 rounded-lg hover:bg-slate-100 transition active:scale-90"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import {
  format,
  addDays,
  subDays,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isToday as checkIsToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  WifiOff,
  CloudCheck,
} from 'lucide-react';

interface CalendarBarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  isOffline?: boolean;
}

export default function CalendarBar({ selectedDate, onSelectDate, isOffline }: CalendarBarProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => parseISO(selectedDate));
  const parsedSelected = parseISO(selectedDate);
  const today = new Date();

  // Touch handlers for swipe up/down gesture on mobile
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Swipe down to expand (if delta > 40px)
    if (deltaY > 40 && !isExpanded) {
      setIsExpanded(true);
    }
    // Swipe up to collapse (if delta < -40px)
    if (deltaY < -40 && isExpanded) {
      setIsExpanded(false);
    }
    touchStartY.current = null;
  };

  // 14-day sliding window for horizontal carousel
  const daysCarousel = Array.from({ length: 14 }).map((_, index) => {
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

  // Full Month Calendar Days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const allCalendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full pt-3 pb-2 px-4 sm:px-6 border-b border-black/5 dark:border-white/10 glass-surface sticky top-0 z-20 transition-all duration-300"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Clickable Date Title to toggle calendar */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 group text-left ios-active"
            title="Click to expand/collapse full calendar"
          >
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                {isToday ? "Today's Menu" : format(parsedSelected, 'EEEE')}
              </h1>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>

            <span className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </button>
        </div>

        {/* Right side controls: Tomorrow shortcut + Offline indicator */}
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <WifiOff className="w-3 h-3" />
              <span>Offline Cache</span>
            </span>
          )}

          <button
            onClick={handleNextDay}
            className="flex items-center gap-0.5 text-rose-500 hover:text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm transition ios-active px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/30"
          >
            <span>Tomorrow</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Date display subheader */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-semibold text-zinc-800 dark:text-zinc-200 hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1.5"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span>{format(parsedSelected, 'd MMMM yyyy')}</span>
          <span className="text-[10px] text-zinc-400">({isExpanded ? 'tap to close' : 'tap to expand'})</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectDate(format(today, 'yyyy-MM-dd'))}
            className="px-2 py-0.5 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 transition text-[11px]"
          >
            Today
          </button>
          <button
            onClick={handleNextDay}
            className="p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition"
            title="Next Day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* EXPANDED MONTH/GRID CALENDAR VIEW                        */}
      {/* ======================================================== */}
      {isExpanded ? (
        <div className="pt-2 pb-3 animate-fade-in space-y-3">
          {/* Month switcher */}
          <div className="flex items-center justify-between px-1">
            <span className="font-bold text-sm text-zinc-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(subDays(startOfMonth(currentMonth), 1))}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(addDays(endOfMonth(currentMonth), 1))}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1">
            {allCalendarDays.map((day) => {
              const dayIso = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, parsedSelected);
              const isCurrentDay = checkIsToday(day);

              return (
                <button
                  key={dayIso}
                  onClick={() => {
                    onSelectDate(dayIso);
                    setIsExpanded(false); // Collapse smoothly per request!
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl text-xs font-semibold transition-all ios-active ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-md'
                      : isCurrentDay
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span>{format(day, 'd')}</span>
                  {/* Menu indicator dot */}
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSelected
                        ? 'bg-white dark:bg-black'
                        : 'bg-zinc-300 dark:bg-zinc-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Swipe-up handle to close */}
          <div
            onClick={() => setIsExpanded(false)}
            className="flex flex-col items-center justify-center pt-2 cursor-pointer group"
          >
            <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full group-hover:bg-zinc-400 transition" />
            <span className="text-[10px] text-zinc-400 font-semibold mt-1">
              Swipe up to close calendar & view meals
            </span>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* COMPACT HORIZONTAL DATE CAROUSEL (Default View)         */
        /* ======================================================== */
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
          {daysCarousel.map((day) => {
            const formattedIso = format(day, 'yyyy-MM-dd');
            const isSelected = isSameDay(day, parsedSelected);
            const dayNumber = format(day, 'd');
            const dayName = format(day, 'EEE').slice(0, 2);

            return (
              <button
                key={formattedIso}
                onClick={() => onSelectDate(formattedIso)}
                className={`flex flex-col items-center justify-center min-w-[44px] py-2 px-1 rounded-2xl transition-all duration-200 ios-active ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md font-bold'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium'
                }`}
              >
                <span className={`text-base ${isSelected ? 'text-white dark:text-black font-black' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {dayNumber}
                </span>
                <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400'}`}>
                  {dayName}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Sparkles, Flame, Music, Trophy, Star } from 'lucide-react';
import { EventPost } from '@/types';

interface PosterGeneratorProps {
  event: Partial<EventPost>;
  compact?: boolean;
}

export default function PosterGenerator({ event, compact = false }: PosterGeneratorProps) {
  const theme = event.posterTheme || 'festive';

  const getThemeStyles = () => {
    const t = (theme || 'festive') as string;
    switch (t) {
      case 'festive':
        return {
          gradient: 'from-amber-600 via-rose-700 to-red-900',
          accent: 'bg-amber-400 text-amber-950',
          badgeBorder: 'border-amber-300/40',
          pattern: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.4), transparent 60%)',
          icon: <Flame className="w-4 h-4 text-amber-300" />,
        };
      case 'neon':
      case 'dj-night':
        return {
          gradient: 'from-indigo-900 via-purple-900 to-fuchsia-950',
          accent: 'bg-fuchsia-400 text-purple-950',
          badgeBorder: 'border-fuchsia-400/40',
          pattern: 'radial-gradient(circle at top right, rgba(232, 121, 249, 0.4), transparent 60%)',
          icon: <Music className="w-4 h-4 text-fuchsia-300" />,
        };
      case 'sports':
        return {
          gradient: 'from-blue-900 via-cyan-900 to-slate-950',
          accent: 'bg-cyan-400 text-slate-950',
          badgeBorder: 'border-cyan-300/40',
          pattern: 'radial-gradient(circle at top right, rgba(34, 211, 238, 0.4), transparent 60%)',
          icon: <Trophy className="w-4 h-4 text-cyan-300" />,
        };
      case 'royal':
        return {
          gradient: 'from-slate-900 via-purple-950 to-amber-950',
          accent: 'bg-amber-300 text-amber-950',
          badgeBorder: 'border-amber-400/40',
          pattern: 'radial-gradient(circle at top right, rgba(245, 158, 11, 0.35), transparent 60%)',
          icon: <Star className="w-4 h-4 text-amber-300" />,
        };
      case 'foodie':
      default:
        return {
          gradient: 'from-orange-700 via-amber-700 to-rose-900',
          accent: 'bg-orange-300 text-orange-950',
          badgeBorder: 'border-orange-300/40',
          pattern: 'radial-gradient(circle at top right, rgba(253, 186, 116, 0.4), transparent 60%)',
          icon: <Sparkles className="w-4 h-4 text-orange-300" />,
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-xl text-white bg-gradient-to-br ${styles.gradient} transition-all duration-300`}
      style={{ backgroundImage: styles.pattern }}
    >
      {/* Background image overlay if provided */}
      {event.posterUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url(${event.posterUrl})` }}
        />
      )}

      {/* Decorative glows & sparkles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-black/20 blur-2xl pointer-events-none" />

      {/* Poster Content */}
      <div className={`relative z-10 flex flex-col justify-between ${compact ? 'p-5' : 'p-7'}`}>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/15 backdrop-blur-md border border-white/20">
            {styles.icon}
            <span>{event.category?.replace('-', ' ') || 'CAMPUS EVENT'}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-white/70 block">
              CU Mess Portal
            </span>
            <span className="text-xs font-bold text-amber-300">Chandigarh University</span>
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="my-2">
          <h3
            className={`font-black tracking-tight drop-shadow-md text-white ${
              compact ? 'text-xl leading-tight' : 'text-3xl md:text-4xl leading-tight'
            }`}
          >
            {event.title || 'Special Campus Mess Gala'}
          </h3>

          {event.subtitle && (
            <p className="text-sm md:text-base text-white/90 font-medium mt-1.5 line-clamp-2">
              {event.subtitle}
            </p>
          )}
        </div>

        {/* Highlights Pills */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-3">
            {event.highlights.slice(0, compact ? 2 : 4).map((h, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-black/30 backdrop-blur-sm border border-white/15 px-2.5 py-1 rounded-full"
              >
                ✨ {h}
              </span>
            ))}
          </div>
        )}

        {/* Footer info: Date, Time, Venue */}
        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-white/70 text-[10px] block">DATE</span>
              <span className="font-semibold text-white">{event.date || 'Announcing Soon'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-white/70 text-[10px] block">TIMINGS</span>
              <span className="font-semibold text-white">{event.time || 'Evening'}</span>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-2 mt-1">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-white/70 text-[10px] block">VENUE</span>
              <span className="font-semibold text-white truncate max-w-[280px] block">
                {event.venue || 'Central Mess Ground'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

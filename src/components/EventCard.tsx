'use client';

import React from 'react';
import Link from 'next/link';
import { EventPost } from '@/types';
import { Calendar, Clock, MapPin, ChevronRight, Pin } from 'lucide-react';
import PosterGenerator from './PosterGenerator';

interface EventCardProps {
  event: EventPost;
  onOpenDetails?: (event: EventPost) => void;
}

export default function EventCard({ event, onOpenDetails }: EventCardProps) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/90 transition-all duration-200 hover:shadow-md">
      {/* Pinned Tag */}
      {event.isPinned && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mb-2 px-1">
          <Pin className="w-3.5 h-3.5 fill-rose-500 rotate-45" />
          <span>PINNED ANNOUNCEMENT</span>
        </div>
      )}

      {/* Dynamic Poster Banner */}
      <div className="mb-4 cursor-pointer" onClick={() => onOpenDetails?.(event)}>
        <PosterGenerator event={event} compact={true} />
      </div>

      {/* Description Snippet */}
      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed px-1">
        {event.description}
      </p>

      {/* Footer & Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between px-1">
        <span className="text-xs text-slate-400 font-medium">
          By {event.author}
        </span>

        <button
          onClick={() => onOpenDetails?.(event)}
          className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-full transition active:scale-95"
        >
          <span>View Details & Poster</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

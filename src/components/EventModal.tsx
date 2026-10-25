'use client';

import React, { useEffect, useRef } from 'react';
import { EventPost } from '@/types';
import PosterGenerator from './PosterGenerator';
import { X, Calendar, Clock, MapPin, Share2, CheckCircle2 } from 'lucide-react';

interface EventModalProps {
  event: EventPost | null;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (event) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }

    // Modern Web Guidance: Fallback for browsers without native `closedby` support
    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isInside =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInside) {
        onClose();
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => {
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [event, onClose]);

  if (!event) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `${event.title} at ${event.venue} on ${event.date}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  return (
    <dialog
      ref={dialogRef}
      // @ts-ignore - closedby is modern HTML standard per modern-web-guidance
      closedby="any"
      aria-labelledby="event-dialog-title"
      onClose={onClose}
      className="m-auto w-[92vw] max-w-lg rounded-3xl p-0 bg-white shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm overflow-hidden border border-slate-100"
    >
      <div className="relative max-h-[88vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition active:scale-90 backdrop-blur-md"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic Full Poster */}
        <div className="p-3">
          <PosterGenerator event={event} compact={false} />
        </div>

        {/* Details Content */}
        <div className="p-6 pt-2 space-y-5">
          <div>
            <h2 id="event-dialog-title" className="text-2xl font-black text-slate-900">
              {event.title}
            </h2>
            {event.subtitle && (
              <p className="text-sm font-medium text-slate-500 mt-1">
                {event.subtitle}
              </p>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{event.time || 'TBA'}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Highlights List */}
          {event.highlights && event.highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Special Highlights & Inclusions
              </h4>
              <ul className="space-y-2">
                {event.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              About This Event
            </h4>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Published info & actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Posted by <strong className="text-slate-600">{event.author}</strong>
            </span>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

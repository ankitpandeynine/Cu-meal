import React from 'react';
import Link from 'next/link';
import { getEventById, getAllEvents } from '@/lib/db';
import PosterGenerator from '@/components/PosterGenerator';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, Share2, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = getEventById(params.id);
  if (!event) return { title: 'Event Not Found | CU Meal' };
  return {
    title: `${event.title} | CU Meal & Events`,
    description: event.subtitle || event.description.slice(0, 150),
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.posterUrl ? [event.posterUrl] : [],
    },
  };
}

export default function EventDetailPage({ params }: Props) {
  const event = getEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen pb-16 animate-fade-in bg-white/80">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 px-5 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Menu</span>
        </Link>

        <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
          {event.category.replace('-', ' ')}
        </span>
      </div>

      <div className="px-5 pt-4 space-y-6">
        {/* Dynamic Full Poster Banner */}
        <PosterGenerator event={event} compact={false} />

        {/* Title & Metadata */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {event.title}
          </h1>
          {event.subtitle && (
            <p className="text-base font-medium text-slate-500 mt-2">
              {event.subtitle}
            </p>
          )}
        </div>

        {/* Quick Date/Time/Venue Grid */}
        <div className="bg-slate-50 rounded-3xl p-4 grid grid-cols-2 gap-3 text-xs border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DATE</span>
              <span className="font-semibold text-slate-800">{event.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">TIME</span>
              <span className="font-semibold text-slate-800">{event.time || 'TBA'}</span>
            </div>
          </div>

          <div className="col-span-2 flex items-center gap-2.5 pt-2 border-t border-slate-200/60">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">VENUE</span>
              <span className="font-semibold text-slate-800">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        {event.highlights && event.highlights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Event Highlights & Menu Inclusions</span>
            </h3>
            <ul className="space-y-2">
              {event.highlights.map((highlight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-slate-700 font-medium bg-slate-50 p-2.5 rounded-2xl border border-slate-100"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Details Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Description
          </h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-100">
            {event.description}
          </div>
        </div>

        {/* Author / Secretary badge */}
        <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-100 text-xs flex items-center justify-between text-slate-600">
          <span>
            Announced by: <strong className="text-slate-900">{event.author}</strong>
          </span>
          <span className="text-slate-400">
            CU Mess Portal
          </span>
        </div>
      </div>
    </div>
  );
}

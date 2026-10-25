'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Cake,
  Sun,
  Send,
  ShieldCheck,
  HelpCircle,
  Camera,
  LogOut,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function ProfileView() {
  const [appearance, setAppearance] = useState<'Light' | 'Dark'>('Light');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const toggleAppearance = () => {
    setAppearance((prev) => (prev === 'Light' ? 'Dark' : 'Light'));
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setShowFeedbackModal(false);
      setFeedbackText('');
    }, 1500);
  };

  return (
    <div className="w-full pb-10 animate-fade-in">
      {/* Mountain Banner Header matching Screenshot 4 */}
      <div className="relative h-44 w-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 overflow-hidden">
        {/* Mountain snowy texture simulated with SVG gradients */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65 mix-blend-overlay"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-50 via-transparent to-black/30" />

        <div className="absolute top-4 left-0 right-0 text-center">
          <h1 className="text-white font-bold text-lg drop-shadow-sm">Profile</h1>
        </div>

        <button
          className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white transition"
          title="Help & Support"
          onClick={() => alert('CU Meal & Events Portal v2.0\nFor hostel queries contact central mess desk.')}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Avatar Card */}
      <div className="relative px-6 -mt-16 flex flex-col items-center">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User className="w-16 h-16 text-slate-700 stroke-[1.5]" />
            </div>
          </div>
          <button
            className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md text-slate-600 hover:text-slate-900 transition border border-slate-100"
            title="Update photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* User Info from Screenshot 4 */}
        <h2 className="text-2xl font-bold text-slate-900 mt-3">Ankit Pandey</h2>
        <p className="text-sm text-slate-500 font-medium">25bda70210@gmail.com</p>

        {/* Admin Quick Jump Pill */}
        <div className="mt-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Open Admin Portal</span>
          </Link>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-5">
        {/* Basic Info Card matching Screenshot 4 */}
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 divide-y divide-slate-100">
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                <User className="w-5 h-5" />
              </div>
              <span className="text-slate-800 font-medium text-sm">Gender</span>
            </div>
            <span className="text-slate-500 font-medium text-sm">Male</span>
          </div>

          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                <Cake className="w-5 h-5" />
              </div>
              <span className="text-slate-800 font-medium text-sm">Birthday</span>
            </div>
            <span className="text-slate-500 font-medium text-sm">24 Jul, 1973</span>
          </div>
        </div>

        {/* Section: More matching Screenshot 4 */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
            More
          </h3>
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 divide-y divide-slate-100">
            {/* Appearance */}
            <button
              onClick={toggleAppearance}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/70 rounded-2xl transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Sun className="w-5 h-5" />
                </div>
                <span className="text-slate-800 font-medium text-sm">Appearance</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-sm">
                <span>{appearance}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>

            {/* Feedback */}
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/70 rounded-2xl transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-slate-800 font-medium text-sm">Feedback</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Privacy Policy */}
            <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 rounded-2xl transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-slate-800 font-medium text-sm">Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Admin Management Portal */}
            <Link
              href="/admin"
              className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/50 rounded-2xl transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-900 font-semibold text-sm block">Admin Portal</span>
                  <span className="text-xs text-slate-400">Manage menus & Gemini AI events</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-rose-500 font-semibold text-xs">
                <span>Login</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Mess Details / Hostel Badge */}
        <div className="p-4 rounded-3xl bg-cyan-100/60 border border-cyan-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">Hostel Mess Assigned</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">NC Boys / Zakir & Central Wing</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-200/80 text-sky-800">
            Active Meal Card
          </span>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-fade-in border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Send Meal Feedback</h3>
            <p className="text-xs text-slate-500 mb-4">
              Your feedback is directly routed to the Mess Committee & Secretary Ankit Pandey.
            </p>

            {feedbackSent ? (
              <div className="py-6 text-center text-emerald-600 font-semibold">
                ✓ Thank you! Your feedback has been submitted.
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-4">
                <textarea
                  rows={4}
                  required
                  placeholder="Share feedback on meal quality, hygiene, or request a dish..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full text-sm p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition shadow-sm"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

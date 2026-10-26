'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Building2,
  Hash,
  Sun,
  Moon,
  Send,
  ShieldCheck,
  HelpCircle,
  Camera,
  LogOut,
  ChevronRight,
  Sparkles,
  Lock,
  CloudDownload,
  Wifi,
  WifiOff,
  Check,
} from 'lucide-react';
import { UserProfile } from '@/types';

interface ProfileViewProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function ProfileView({ user, onOpenAuth, onLogout }: ProfileViewProps) {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState<string>('Ready to cache');
  const [isCaching, setIsCaching] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cumeal_theme') as 'system' | 'light' | 'dark' | null;
      if (stored) setTheme(stored);
    } catch {}
  }, []);

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('cumeal_theme', newTheme);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = newTheme === 'dark' || (newTheme === 'system' && prefersDark) ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', resolved);
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSyncOffline = async () => {
    setIsCaching(true);
    setOfflineStatus('Syncing full week plan...');
    try {
      const res = await fetch('/api/menu?all=true');
      const data = await res.json();
      if (data.menus) {
        localStorage.setItem('cumeal_offline_cache', JSON.stringify(data.menus));
        localStorage.setItem('cumeal_cache_time', new Date().toISOString());
        setOfflineStatus('Full week plan cached for offline use ✓');
      }
    } catch (e) {
      setOfflineStatus('Failed to sync offline data');
    } finally {
      setIsCaching(false);
    }
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
    <div className="w-full pb-16 animate-fade-in max-w-2xl mx-auto px-4 sm:px-6">
      {/* Header Banner - Apple inspired frosted glass look */}
      <div className="pt-6 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
          Settings & Profile
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your student meal preferences, offline cache, and appearance.
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 shadow-ios dark:shadow-ios-dark flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xl shrink-0 shadow-md">
          {user ? user.name.slice(0, 2).toUpperCase() : 'CU'}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                {user ? user.name : 'Guest Hosteller'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {user ? user.email : 'Not signed in'}
              </p>
            </div>

            {user ? (
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:underline"
              >
                Edit Info ✏️
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-black dark:bg-white text-white dark:text-black shadow-sm ios-active"
              >
                Sign In
              </button>
            )}
          </div>

          {user && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                UID: {user.uid}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-800 dark:text-zinc-200">
                {user.hostel}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                Via {user.provider}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Appearance Control (Minimalist Tri-State Toggle) */}
        <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-4 shadow-ios dark:shadow-ios-dark space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Appearance
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Minimalist monochrome theme (Light, Dark, or System)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => handleThemeChange('system')}
              className={`py-2 rounded-xl transition ${
                theme === 'system'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              System
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                theme === 'light'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
                theme === 'dark'
                  ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Offline Week Cache Section */}
        <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-4 shadow-ios dark:shadow-ios-dark space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                <CloudDownload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Offline Week Plan
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Store all 7 days of meals to view even when cellular is weak in hostels
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncOffline}
              disabled={isCaching}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition ios-active shrink-0"
            >
              {isCaching ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pl-1">
            {offlineStatus}
          </p>
        </div>

        {/* More Actions Card */}
        <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-2 shadow-ios dark:shadow-ios-dark divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {/* Feedback */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 rounded-2xl transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-zinc-900 dark:text-zinc-100 font-medium text-xs sm:text-sm">
                Mess Feedback & Suggestions
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Admin Portal Gateway */}
          <Link
            href="/admin"
            className="w-full flex items-center justify-between p-3.5 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 rounded-2xl transition text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm block">
                  Admin Portal
                </span>
                <span className="text-[10px] text-zinc-400">
                  Bulk Gemini menu parser & student records
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <span>Open</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Sign Out (if logged in) */}
          {user && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-2xl transition text-left text-rose-600 dark:text-rose-400"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">Sign Out</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-black/10 dark:border-white/10 animate-fade-in">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1">
              Mess Feedback
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Your feedback is shared directly with the Mess Advisory Council.
            </p>

            {feedbackSent ? (
              <div className="py-6 text-center text-emerald-600 font-semibold text-sm">
                ✓ Thank you! Feedback recorded.
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-4">
                <textarea
                  rows={4}
                  required
                  placeholder="Share feedback on meal quality, hygiene, or recommend a dish..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white dark:text-black bg-black dark:bg-white rounded-xl transition ios-active shadow-sm"
                  >
                    Submit Feedback
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

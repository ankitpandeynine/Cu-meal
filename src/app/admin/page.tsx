'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Sparkles,
  Utensils,
  Calendar,
  PlusCircle,
  Trash2,
  CheckCircle,
  AlertCircle,
  LogOut,
  ExternalLink,
  ChevronRight,
  Eye,
  RefreshCw,
  Send,
  Sliders,
  Key,
  Layers,
  Image as ImageIcon,
  Check,
  Pin,
} from 'lucide-react';
import { DayMenu, EventPost, MealSlot } from '@/types';
import PosterGenerator from '@/components/PosterGenerator';

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('ankit');
  const [password, setPassword] = useState<string>('ankitcu21');
  const [authError, setAuthError] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<'gemini-event' | 'menu-editor' | 'events-list' | 'pipeline'>('gemini-event');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ------------------ GEMINI EVENT STUDIO STATE ------------------
  const [geminiPrompt, setGeminiPrompt] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [selectedPosterTheme, setSelectedPosterTheme] = useState<EventPost['posterTheme']>('festive');
  const [isGeneratingEvent, setIsGeneratingEvent] = useState<boolean>(false);
  const [generatedEventPreview, setGeneratedEventPreview] = useState<Partial<EventPost> | null>(null);

  // ------------------ MENU EDITOR STATE ------------------
  const [menuDate, setMenuDate] = useState<string>('2026-10-25');
  const [isMenuAvailable, setIsMenuAvailable] = useState<boolean>(true);
  const [unavailableMessage, setUnavailableMessage] = useState<string>('The menu is currently being updated. Please check back shortly.');
  const [meals, setMeals] = useState<MealSlot[]>([]);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  const [savingMenu, setSavingMenu] = useState<boolean>(false);
  const [geminiMenuPrompt, setGeminiMenuPrompt] = useState<string>('');
  const [isGeneratingMenu, setIsGeneratingMenu] = useState<boolean>(false);

  // ------------------ EVENTS LIST STATE ------------------
  const [allEvents, setAllEvents] = useState<EventPost[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check initial authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch Events & Menu once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMenuForDate(menuDate);
      loadEvents();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Login failed');
      } else {
        setIsAuthenticated(true);
        showToast('Welcome back, Ankit! Admin mode unlocked.');
        loadMenuForDate(menuDate);
        loadEvents();
      }
    } catch (err: any) {
      setAuthError('Network error connecting to login API');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    showToast('Logged out successfully.');
  };

  const loadMenuForDate = async (date: string) => {
    setLoadingMenu(true);
    try {
      const res = await fetch(`/api/menu?date=${date}`);
      const data = await res.json();
      if (data.menu) {
        setIsMenuAvailable(data.menu.isAvailable);
        setUnavailableMessage(data.menu.unavailableMessage || 'The menu is currently being updated. Please check back shortly.');
        setMeals(data.menu.meals || []);
      }
    } catch (err) {
      showToast('Failed to load menu for selected date', 'error');
    } finally {
      setLoadingMenu(false);
    }
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.events) {
        setAllEvents(data.events);
      }
    } catch (err) {
      showToast('Failed to load events', 'error');
    } finally {
      setLoadingEvents(false);
    }
  };

  // ----------------- GEMINI EVENT GENERATION -----------------
  const handleGeminiGenerateEvent = async (autoPublish: boolean = false) => {
    if (!geminiPrompt.trim()) {
      showToast('Please type an event prompt for Gemini', 'error');
      return;
    }

    setIsGeneratingEvent(true);
    try {
      const res = await fetch('/api/gemini/generate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: geminiPrompt,
          apiKey: geminiApiKey,
          posterTheme: selectedPosterTheme,
          autoPublish,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gemini generation failed', 'error');
      } else {
        setGeneratedEventPreview(data.event);
        if (autoPublish) {
          showToast('🎉 Event & Poster published directly to live website!');
          loadEvents();
        } else {
          showToast('✨ Event preview created! Review and click publish below.');
        }
      }
    } catch (err: any) {
      showToast('Failed to connect to Gemini API', 'error');
    } finally {
      setIsGeneratingEvent(false);
    }
  };

  const handlePublishGeneratedEvent = async () => {
    if (!generatedEventPreview || !generatedEventPreview.title) {
      showToast('No generated event to publish', 'error');
      return;
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedEventPreview),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to publish event', 'error');
      } else {
        showToast('🚀 Event successfully published to website!');
        setGeneratedEventPreview(null);
        setGeminiPrompt('');
        loadEvents();
        setAdminTab('events-list');
      }
    } catch (err) {
      showToast('Network error publishing event', 'error');
    }
  };

  // ----------------- GEMINI MENU GENERATION -----------------
  const handleGeminiGenerateMenu = async () => {
    if (!geminiMenuPrompt.trim()) {
      showToast('Please enter a menu prompt for Gemini', 'error');
      return;
    }
    setIsGeneratingMenu(true);
    try {
      const res = await fetch('/api/gemini/generate-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: geminiMenuPrompt,
          targetDate: menuDate,
          apiKey: geminiApiKey,
          autoSave: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gemini menu generation failed', 'error');
      } else {
        setMeals(data.meals);
        setIsMenuAvailable(true);
        showToast('✨ Meals generated by Gemini! Review and click Save Menu.');
      }
    } catch (err) {
      showToast('Error generating menu with Gemini', 'error');
    } finally {
      setIsGeneratingMenu(false);
    }
  };

  // ----------------- SAVE MENU -----------------
  const handleSaveMenu = async () => {
    setSavingMenu(true);
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: menuDate,
          isAvailable: isMenuAvailable,
          unavailableMessage,
          meals,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to save menu', 'error');
      } else {
        showToast(`✓ Menu for ${menuDate} updated and live on website!`);
      }
    } catch (err) {
      showToast('Error saving menu', 'error');
    } finally {
      setSavingMenu(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Event deleted.');
        loadEvents();
      } else {
        showToast('Failed to delete event', 'error');
      }
    } catch (err) {
      showToast('Error deleting event', 'error');
    }
  };

  // ----------------- LOGIN SCREEN -----------------
  if (checkingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center px-6 py-12 animate-fade-in">
        <div className="max-w-sm w-full mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">CU Meal Admin</h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized access for Secretary Ankit Pandey
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                placeholder="ankit"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                placeholder="ankitcu21"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-95 transition flex items-center justify-center gap-2"
            >
              {loggingIn ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>Login to Admin Portal</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              ← Return to Public Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------- ADMIN DASHBOARD -----------------
  return (
    <div className="w-full min-h-screen pb-20 animate-fade-in bg-slate-50/70">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce border ${
            toastMessage.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-lg font-black text-slate-900">CU Meal Admin</h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Logged in as ankit</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
          >
            <span>View Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="px-5 pt-4">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setAdminTab('gemini-event')}
            className={`py-2 px-1 rounded-xl transition text-center truncate ${
              adminTab === 'gemini-event'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            ✨ Gemini Event
          </button>
          <button
            onClick={() => setAdminTab('menu-editor')}
            className={`py-2 px-1 rounded-xl transition text-center truncate ${
              adminTab === 'menu-editor'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            🍽️ Menu Editor
          </button>
          <button
            onClick={() => setAdminTab('events-list')}
            className={`py-2 px-1 rounded-xl transition text-center truncate ${
              adminTab === 'events-list'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            📋 Events ({allEvents.length})
          </button>
          <button
            onClick={() => setAdminTab('pipeline')}
            className={`py-2 px-1 rounded-xl transition text-center truncate ${
              adminTab === 'pipeline'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            🚀 Vercel Info
          </button>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* ======================================================== */}
        {/* TAB 1: GEMINI AI EVENT & POSTER STUDIO                   */}
        {/* ======================================================== */}
        {adminTab === 'gemini-event' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-2xl bg-rose-500 text-white shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Gemini AI Event & Poster Pipeline
                  </h2>
                  <p className="text-xs text-slate-600">
                    Just prompt Gemini to add any feast, DJ night, or mess event!
                  </p>
                </div>
              </div>

              {/* Natural language prompt box */}
              <div className="mt-4 space-y-3">
                <textarea
                  rows={3}
                  value={geminiPrompt}
                  onChange={(e) => setGeminiPrompt(e.target.value)}
                  placeholder="e.g. Add a Diwali Grand Feast & Musical DJ Night this Sunday 7 PM with live tandoori paneer, rasmalai, ethnic dress contest, and festive poster..."
                  className="w-full text-sm p-3.5 rounded-2xl bg-white border border-amber-200 focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder:text-slate-400 shadow-inner"
                />

                {/* Preset Prompt Pills */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Quick Prompt Ideas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Diwali Grand Feast with DJ night & sweets',
                      'Sunday Special Dum Biryani & Ice Cream',
                      'Hostel Premier League live match snacks',
                      'Chole Bhature & Sweet Lassi Brunch',
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGeminiPrompt(preset)}
                        className="text-xs bg-white/90 hover:bg-white border border-amber-200/70 text-slate-700 px-2.5 py-1 rounded-xl transition active:scale-95"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Poster Theme Selector */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Poster Theme Style
                  </span>
                  <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold">
                    {(['festive', 'foodie', 'neon', 'sports', 'royal'] as const).map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => setSelectedPosterTheme(theme)}
                        className={`py-1.5 px-1 rounded-xl capitalize transition text-center ${
                          selectedPosterTheme === theme
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Gemini API Key */}
                <div className="pt-2">
                  <details className="text-xs text-slate-500">
                    <summary className="cursor-pointer font-semibold text-rose-600 hover:underline">
                      🔑 Custom Gemini API Key (Optional)
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <p className="text-[11px] text-slate-500">
                        If omitted, uses <code>GEMINI_API_KEY</code> environment variable or the intelligent fallback AI engine.
                      </p>
                      <input
                        type="password"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </details>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={isGeneratingEvent}
                    onClick={() => handleGeminiGenerateEvent(false)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-95 transition"
                  >
                    {isGeneratingEvent ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-600" />
                    )}
                    <span>Generate & Preview First</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingEvent}
                    onClick={() => handleGeminiGenerateEvent(true)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-bold text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-2 active:scale-95 transition"
                  >
                    {isGeneratingEvent ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                    <span>Ask Gemini & Publish Live 🚀</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Event Preview Card */}
            {generatedEventPreview && (
              <div className="bg-white rounded-3xl p-5 shadow-lg border border-rose-200 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Gemini Event Ready For Review</span>
                  </span>
                  <button
                    onClick={() => setGeneratedEventPreview(null)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Discard
                  </button>
                </div>

                {/* Poster Live Canvas */}
                <PosterGenerator event={generatedEventPreview} compact={false} />

                {/* Editable Preview Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Title</label>
                    <input
                      type="text"
                      value={generatedEventPreview.title || ''}
                      onChange={(e) =>
                        setGeneratedEventPreview({ ...generatedEventPreview, title: e.target.value })
                      }
                      className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Date</label>
                      <input
                        type="date"
                        value={generatedEventPreview.date || ''}
                        onChange={(e) =>
                          setGeneratedEventPreview({ ...generatedEventPreview, date: e.target.value })
                        }
                        className="w-full text-sm p-2 rounded-xl border border-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Timings</label>
                      <input
                        type="text"
                        value={generatedEventPreview.time || ''}
                        onChange={(e) =>
                          setGeneratedEventPreview({ ...generatedEventPreview, time: e.target.value })
                        }
                        className="w-full text-sm p-2 rounded-xl border border-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Venue</label>
                    <input
                      type="text"
                      value={generatedEventPreview.venue || ''}
                      onChange={(e) =>
                        setGeneratedEventPreview({ ...generatedEventPreview, venue: e.target.value })
                      }
                      className="w-full text-sm p-2 rounded-xl border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">
                      Poster Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={generatedEventPreview.posterUrl || ''}
                      onChange={(e) =>
                        setGeneratedEventPreview({ ...generatedEventPreview, posterUrl: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={generatedEventPreview.description || ''}
                      onChange={(e) =>
                        setGeneratedEventPreview({ ...generatedEventPreview, description: e.target.value })
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handlePublishGeneratedEvent}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Confirm & Publish to Website</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DAILY MENU MANAGER                                */}
        {/* ======================================================== */}
        {adminTab === 'menu-editor' && (
          <div className="space-y-6">
            {/* Date and Status Bar */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Select Menu Date
                  </label>
                  <input
                    type="date"
                    value={menuDate}
                    onChange={(e) => {
                      setMenuDate(e.target.value);
                      loadMenuForDate(e.target.value);
                    }}
                    className="text-base font-bold text-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-700">
                    Menu Status:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMenuAvailable(!isMenuAvailable)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      isMenuAvailable
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isMenuAvailable ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                    <span>{isMenuAvailable ? 'Menu Available' : 'Menu Unavailable (Show Placeholder)'}</span>
                  </button>
                </div>
              </div>

              {!isMenuAvailable && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                  <label className="text-xs font-semibold text-rose-800 block mb-1">
                    Unavailable Message (shown to users):
                  </label>
                  <input
                    type="text"
                    value={unavailableMessage}
                    onChange={(e) => setUnavailableMessage(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-rose-300 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Gemini Menu Assistant */}
            <div className="bg-sky-50 border border-sky-200 rounded-3xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                  Generate Menu with Gemini AI
                </h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={geminiMenuPrompt}
                  onChange={(e) => setGeminiMenuPrompt(e.target.value)}
                  placeholder="e.g. Punjabi Sunday Special with Chole Bhature, Rajma Chawal, Samosa, Dal Makhani..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-sky-300 focus:outline-none bg-white"
                />
                <button
                  type="button"
                  disabled={isGeneratingMenu}
                  onClick={handleGeminiGenerateMenu}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition active:scale-95 shrink-0 flex items-center gap-1.5"
                >
                  {isGeneratingMenu ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate</span>
                </button>
              </div>
            </div>

            {/* Meal Slots Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Meal Timings & Dishes ({meals.length} slots)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setMeals([
                      ...meals,
                      {
                        id: `custom-meal-${Date.now()}`,
                        name: 'Special Refreshment',
                        time: '10:00 PM - 11:00 PM',
                        items: 'Hot Milk, Cookies',
                        category: 'snacks',
                      },
                    ]);
                  }}
                  className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Meal Slot</span>
                </button>
              </div>

              {meals.map((meal, index) => (
                <div
                  key={meal.id}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={meal.name}
                      onChange={(e) => {
                        const updated = [...meals];
                        updated[index].name = e.target.value;
                        setMeals(updated);
                      }}
                      className="font-bold text-slate-900 text-base border-b border-dashed border-slate-300 pb-0.5 focus:outline-none focus:border-rose-500"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setMeals(meals.filter((_, i) => i !== index));
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        TIMINGS
                      </label>
                      <input
                        type="text"
                        value={meal.time}
                        onChange={(e) => {
                          const updated = [...meals];
                          updated[index].time = e.target.value;
                          setMeals(updated);
                        }}
                        className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">
                        CATEGORY
                      </label>
                      <select
                        value={meal.category || 'lunch'}
                        onChange={(e) => {
                          const updated = [...meals];
                          updated[index].category = e.target.value as any;
                          setMeals(updated);
                        }}
                        className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none text-xs"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="snacks">Snacks</option>
                        <option value="dinner">Dinner</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      ITEMS (Use line breaks for NC/Zakir hostel breakdown)
                    </label>
                    <textarea
                      rows={2}
                      value={meal.items}
                      onChange={(e) => {
                        const updated = [...meals];
                        updated[index].items = e.target.value;
                        setMeals(updated);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ))}

              {/* Save Menu Bar */}
              <div className="sticky bottom-6 pt-4">
                <button
                  type="button"
                  disabled={savingMenu}
                  onClick={handleSaveMenu}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-sm shadow-xl shadow-sky-500/20 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  {savingMenu ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span>Save & Publish Menu for {menuDate}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: EVENTS MANAGEMENT LIST                            */}
        {/* ======================================================== */}
        {adminTab === 'events-list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-black text-slate-900">
                Published Campus Events ({allEvents.length})
              </h2>
              <button
                type="button"
                onClick={() => setAdminTab('gemini-event')}
                className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl hover:bg-rose-100 transition"
              >
                + Add with Gemini
              </button>
            </div>

            {loadingEvents ? (
              <div className="py-12 flex justify-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : allEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No events currently on the website.
              </div>
            ) : (
              allEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {event.isPinned && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            PINNED
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {event.category}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {event.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {event.date} • {event.time} • {event.venue}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-400">Author: {event.author}</span>
                    <Link
                      href={`/events/${event.id}`}
                      target="_blank"
                      className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: VERCEL PIPELINE & DEPLOYMENT GUIDE               */}
        {/* ======================================================== */}
        {adminTab === 'pipeline' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-black text-white">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Vercel Hosting & Production Pipeline
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step-by-step instructions to deploy this project to Vercel
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">
                    1. Git & GitHub Setup
                  </h4>
                  <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-xl overflow-x-auto text-[11px] font-mono">
                    git add .{"\n"}
                    git commit -m "Complete CU Meal & Gemini Event Portal"{"\n"}
                    git branch -M main{"\n"}
                    # Link your GitHub repository:{"\n"}
                    git remote add origin https://github.com/&lt;your-username&gt;/cumeal.git{"\n"}
                    git push -u origin main
                  </pre>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">
                    2. Deploy to Vercel
                  </h4>
                  <p className="mb-2">
                    Connect your GitHub repo to{' '}
                    <a
                      href="https://vercel.com"
                      target="_blank"
                      className="text-sky-600 font-semibold underline"
                    >
                      Vercel Dashboard
                    </a>{' '}
                    or run Vercel CLI:
                  </p>
                  <pre className="bg-slate-900 text-slate-200 p-2 rounded-xl text-[11px] font-mono">
                    npx vercel
                  </pre>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                  <h4 className="font-bold mb-1">
                    3. Environment Variables in Vercel
                  </h4>
                  <p className="mb-2">
                    In your Vercel Project Settings → Environment Variables:
                  </p>
                  <ul className="space-y-1 list-disc list-inside font-mono text-[11px]">
                    <li>
                      <strong>GEMINI_API_KEY</strong>: Your Google Gemini API Key
                    </li>
                    <li>
                      <strong>ADMIN_USER</strong>: ankit (default)
                    </li>
                    <li>
                      <strong>ADMIN_PASSWORD</strong>: ankitcu21 (default)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

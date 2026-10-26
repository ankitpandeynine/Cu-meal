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
  Users,
  Search,
  Download,
  FileSpreadsheet,
  CalendarRange,
} from 'lucide-react';
import { DayMenu, EventPost, MealSlot, UserProfile } from '@/types';
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
  const [adminTab, setAdminTab] = useState<
    'bulk-gemini' | 'gemini-event' | 'menu-editor' | 'events-list' | 'users' | 'pipeline'
  >('bulk-gemini');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ------------------ GEMINI BULK WEEKLY MENU STATE ------------------
  const [rawWeekText, setRawWeekText] = useState<string>(
`Monday:
Breakfast: Sweet Dalia, Banana, Bread, Boiled Egg, Tea
Lunch: Amritsari Chole, Chapati, Sweet Lassi, Steamed Rice, Beet Cucumber Salad
Snacks: NC: Samosa, Tea / Zakir: Namkeen, Tea
Dinner: Dhaba Dal, Subz Jalfreji, Chapati, Steamed Rice, Mix Pickle

Tuesday:
Breakfast: Aloo Pyaz Paratha, Fresh Curd, Toast, Tea
Lunch: Rajma Masala, Aloo Jeera, Tawa Roti, Jeera Rice, Boondi Raita
Snacks: NC: Veg Cutlet, Tea / Zakir: Bread Pakora, Tea
Dinner: Shahi Paneer, Dal Tadka, Missi Roti, Steamed Rice, Gulab Jamun

Wednesday:
Breakfast: Poha with Peanuts, Boiled Eggs / Sprouts, Toast, Coffee / Tea
Lunch: Kadhi Pakora, Aloo Methi, Chapati, Plain Basmati Rice, Mint Chutney
Snacks: NC: Spring Roll, Tea / Zakir: Patties, Tea
Dinner: Dal Makhani, Mix Veg, Naan & Roti, Peas Pulao, Fruit Custard`
  );
  const [bulkStartDate, setBulkStartDate] = useState<string>('2026-10-25');
  const [isParsingBulk, setIsParsingBulk] = useState<boolean>(false);
  const [parsedBulkDays, setParsedBulkDays] = useState<any[]>([]);

  // ------------------ GEMINI EVENT STUDIO STATE ------------------
  const [geminiPrompt, setGeminiPrompt] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [selectedPosterTheme, setSelectedPosterTheme] = useState<EventPost['posterTheme']>('festive');
  const [isGeneratingEvent, setIsGeneratingEvent] = useState<boolean>(false);
  const [generatedEventPreview, setGeneratedEventPreview] = useState<Partial<EventPost> | null>(null);

  // ------------------ MENU EDITOR STATE (SINGLE DAY) ------------------
  const [menuDate, setMenuDate] = useState<string>('2026-10-25');
  const [isMenuAvailable, setIsMenuAvailable] = useState<boolean>(true);
  const [unavailableMessage, setUnavailableMessage] = useState<string>(
    'The menu is currently being updated. Please check back shortly.'
  );
  const [meals, setMeals] = useState<MealSlot[]>([]);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  const [savingMenu, setSavingMenu] = useState<boolean>(false);
  const [geminiMenuPrompt, setGeminiMenuPrompt] = useState<string>('');
  const [isGeneratingMenu, setIsGeneratingMenu] = useState<boolean>(false);

  // ------------------ EVENTS LIST STATE ------------------
  const [allEvents, setAllEvents] = useState<EventPost[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);

  // ------------------ REGISTERED USERS STATE ------------------
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

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

  // Fetch initial data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMenuForDate(menuDate);
      loadEvents();
      loadUsers();
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
        loadUsers();
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
        setUnavailableMessage(
          data.menu.unavailableMessage ||
            'The menu is currently being updated. Please check back shortly.'
        );
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

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.warn('Failed to load users list');
    } finally {
      setLoadingUsers(false);
    }
  };

  // ----------------- GEMINI BULK WEEK MENU PARSER -----------------
  const handleParseBulkMenu = async (autoSave: boolean = false) => {
    if (!rawWeekText.trim()) {
      showToast('Please paste the weekly menu schedule text', 'error');
      return;
    }

    setIsParsingBulk(true);
    try {
      const res = await fetch('/api/gemini/bulk-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawWeekText,
          startDate: bulkStartDate,
          apiKey: geminiApiKey,
          autoSave,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to parse menu text', 'error');
      } else {
        setParsedBulkDays(data.days || []);
        showToast(data.message || 'Menu schedule parsed successfully!');
      }
    } catch (err) {
      showToast('Error connecting to bulk menu parser', 'error');
    } finally {
      setIsParsingBulk(false);
    }
  };

  const handleSaveBulkParsedDays = async () => {
    if (!parsedBulkDays || parsedBulkDays.length === 0) {
      showToast('No parsed days to save', 'error');
      return;
    }

    try {
      for (const day of parsedBulkDays) {
        await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: day.date,
            isAvailable: true,
            meals: day.meals,
          }),
        });
      }
      showToast(`✓ All ${parsedBulkDays.length} days published live to the website!`);
      loadMenuForDate(menuDate);
    } catch (err) {
      showToast('Error saving days to live database', 'error');
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

  // ----------------- GEMINI SINGLE-DAY MENU GENERATION -----------------
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

  // ----------------- SAVE SINGLE-DAY MENU -----------------
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

  // Export Users CSV
  const handleExportUsersCSV = () => {
    if (usersList.length === 0) return;
    const headers = ['UID', 'Name', 'Email', 'Hostel', 'Year', 'Department', 'Provider', 'JoinedAt'];
    const rows = usersList.map((u) => [
      u.uid,
      `"${u.name}"`,
      u.email,
      `"${u.hostel}"`,
      u.year || '',
      `"${u.department || ''}"`,
      u.provider,
      u.joinedAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cumeal_registered_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered users for search
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.uid.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.hostel.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // ----------------- LOGIN SCREEN -----------------
  if (checkingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center px-6 py-12 animate-fade-in bg-[#f8fafc] dark:bg-[#000000]">
        <div className="max-w-sm w-full mx-auto bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-black/10 dark:border-white/10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-3 shadow-lg font-black text-xl">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white">
              CU Meal Admin
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Authorized access for Mess Secretary Ankit
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium"
                placeholder="ankit"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white font-medium"
                placeholder="ankitcu21"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm shadow-md transition ios-active flex items-center justify-center gap-2"
            >
              {loggingIn ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>Login to Admin Portal</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
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
    <div className="w-full min-h-screen pb-20 animate-fade-in bg-[#f8fafc] dark:bg-[#000000] text-[#09090b] dark:text-[#f4f4f5]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-fade-in ${
            toastMessage.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/80 dark:text-red-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300'
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
      <header className="sticky top-0 z-30 glass-nav border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-lg font-black text-zinc-950 dark:text-white">
              CU Meal Admin Studio
            </h1>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            Secretary Ankit • Full Control
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl transition"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1 p-1 bg-zinc-200/70 dark:bg-zinc-800/80 rounded-2xl text-xs font-bold text-zinc-600 dark:text-zinc-400">
          <button
            onClick={() => setAdminTab('bulk-gemini')}
            className={`py-2 px-2 rounded-xl transition text-center truncate ${
              adminTab === 'bulk-gemini'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            ✨ Bulk Gemini Week
          </button>
          <button
            onClick={() => setAdminTab('menu-editor')}
            className={`py-2 px-2 rounded-xl transition text-center truncate ${
              adminTab === 'menu-editor'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            🍽️ Day Menu Editor
          </button>
          <button
            onClick={() => setAdminTab('gemini-event')}
            className={`py-2 px-2 rounded-xl transition text-center truncate ${
              adminTab === 'gemini-event'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            🎉 Gemini Event & Poster
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`py-2 px-2 rounded-xl transition text-center truncate ${
              adminTab === 'users'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            👥 Students ({usersList.length})
          </button>
          <button
            onClick={() => setAdminTab('events-list')}
            className={`py-2 px-2 rounded-xl transition text-center truncate ${
              adminTab === 'events-list'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            📋 Events ({allEvents.length})
          </button>
          <button
            onClick={() => setAdminTab('pipeline')}
            className={`py-2 px-2 rounded-xl transition text-center truncate ${
              adminTab === 'pipeline'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            🚀 Vercel Info
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        {/* ======================================================== */}
        {/* TAB 1: GEMINI BULK WEEKLY MENU PARSER (User Requested)  */}
        {/* ======================================================== */}
        {adminTab === 'bulk-gemini' && (
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black">
                  <CalendarRange className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                    Gemini Bulk Multi-Day / Week Menu Importer
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Paste raw unformatted text (from WhatsApp notices, circulars, or PDFs) and Gemini will parse every single day and all meal slots automatically!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Week Starting Date
                  </label>
                  <input
                    type="date"
                    value={bulkStartDate}
                    onChange={(e) => setBulkStartDate(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Optional Gemini API Key (or uses GEMINI_API_KEY env)
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy... (leave blank to use system key)"
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Raw Weekly Schedule Text
                </label>
                <textarea
                  rows={9}
                  value={rawWeekText}
                  onChange={(e) => setRawWeekText(e.target.value)}
                  placeholder="Paste Monday through Sunday meal items here..."
                  className="w-full p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-y shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={isParsingBulk}
                  onClick={() => handleParseBulkMenu(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs transition ios-active flex items-center justify-center gap-2"
                >
                  {isParsingBulk ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Parse with Gemini AI & Preview</span>
                </button>

                <button
                  type="button"
                  disabled={isParsingBulk}
                  onClick={() => handleParseBulkMenu(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs transition ios-active shadow-md flex items-center justify-center gap-2"
                >
                  {isParsingBulk ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Parse & Publish All Days Directly 🚀</span>
                </button>
              </div>
            </div>

            {/* Parsed Days Review Panel */}
            {parsedBulkDays.length > 0 && (
              <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-base font-black text-zinc-950 dark:text-white">
                      Parsed Schedule Review ({parsedBulkDays.length} days found)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Verify each day before publishing to the live website.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveBulkParsedDays}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition ios-active shadow-sm flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save All {parsedBulkDays.length} Days Live</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {parsedBulkDays.map((day, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-zinc-900 dark:text-white">
                          📅 {day.dayName} ({day.date})
                        </span>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">
                          {day.meals?.length || 0} meal slots
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {day.meals?.map((m: any, mIdx: number) => (
                          <div
                            key={mIdx}
                            className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5"
                          >
                            <span className="font-bold text-[11px] text-zinc-900 dark:text-white block">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 block mb-1">
                              {m.time}
                            </span>
                            <p className="text-zinc-600 dark:text-zinc-300 text-[11px] line-clamp-2">
                              {m.items}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DAY MENU EDITOR (Single Day Modifier)              */}
        {/* ======================================================== */}
        {adminTab === 'menu-editor' && (
          <div className="space-y-6">
            {/* Date and Status Bar */}
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 shadow-ios dark:shadow-ios-dark space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Select Day to Modify
                  </label>
                  <input
                    type="date"
                    value={menuDate}
                    onChange={(e) => {
                      setMenuDate(e.target.value);
                      loadMenuForDate(e.target.value);
                    }}
                    className="text-base font-bold text-zinc-900 dark:text-white px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    Status:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMenuAvailable(!isMenuAvailable)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      isMenuAvailable
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
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
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                  <label className="text-xs font-semibold text-rose-800 dark:text-rose-300 block mb-1">
                    Unavailable Message (shown to students):
                  </label>
                  <input
                    type="text"
                    value={unavailableMessage}
                    onChange={(e) => setUnavailableMessage(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800 focus:outline-none text-zinc-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Gemini AI Single-Day Assistant */}
            <div className="bg-zinc-100/80 dark:bg-zinc-900/80 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Update This Single Day with Gemini AI
                </h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={geminiMenuPrompt}
                  onChange={(e) => setGeminiMenuPrompt(e.target.value)}
                  placeholder="e.g. Change lunch to Chole Bhature with Sweet Lassi, and dinner to Dal Makhani with Naan..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isGeneratingMenu}
                  onClick={handleGeminiGenerateMenu}
                  className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs transition ios-active shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  {isGeneratingMenu ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Ask Gemini</span>
                </button>
              </div>
            </div>

            {/* Meal Slots List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
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
                        items: 'Hot Bournvita Milk, Biscuits',
                        category: 'snacks',
                      },
                    ]);
                  }}
                  className="text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Meal Slot</span>
                </button>
              </div>

              {meals.map((meal, index) => (
                <div
                  key={meal.id}
                  className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-3xl p-4 shadow-sm border border-black/[0.06] dark:border-white/[0.08] space-y-3"
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
                      className="font-bold text-zinc-900 dark:text-white text-base border-b border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent pb-0.5 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setMeals(meals.filter((_, i) => i !== index));
                      }}
                      className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 transition"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">
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
                        className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                        CATEGORY
                      </label>
                      <select
                        value={meal.category || 'lunch'}
                        onChange={(e) => {
                          const updated = [...meals];
                          updated[index].category = e.target.value as any;
                          setMeals(updated);
                        }}
                        className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none text-xs"
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
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">
                      ITEMS (Use line breaks for NC / Zakir / Girls breakdown)
                    </label>
                    <textarea
                      rows={2}
                      value={meal.items}
                      onChange={(e) => {
                        const updated = [...meals];
                        updated[index].items = e.target.value;
                        setMeals(updated);
                      }}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none text-xs leading-relaxed"
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
                  className="w-full py-3.5 px-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-sm shadow-xl transition ios-active flex items-center justify-center gap-2"
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
        {/* TAB 3: REGISTERED STUDENTS DIRECTORY (User Requested)    */}
        {/* ======================================================== */}
        {adminTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                      Registered Students Directory
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Live records of all students who signed in with Google or Apple ID
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportUsersCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition ios-active"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={loadUsers}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    title="Refresh list"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search students by Name, UID, Hostel, or Email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                />
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100/70 dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">UID</th>
                      <th className="py-3 px-4">Hostel Wing</th>
                      <th className="py-3 px-4">Dept / Year</th>
                      <th className="py-3 px-4">Sign-in</th>
                      <th className="py-3 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400">
                          No student records found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition"
                        >
                          <td className="py-3 px-4">
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {u.email}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {u.uid || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                              {u.hostel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">
                            {u.department} • {u.year}
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize font-semibold text-zinc-600 dark:text-zinc-300">
                              {u.provider}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 text-[11px]">
                            {new Date(u.joinedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: GEMINI EVENT & POSTER STUDIO                      */}
        {/* ======================================================== */}
        {adminTab === 'gemini-event' && (
          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                    Gemini AI Event & Poster Pipeline
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Prompt Gemini to add campus feasts, DJ nights, or sports screening announcements.
                  </p>
                </div>
              </div>

              <textarea
                rows={3}
                value={geminiPrompt}
                onChange={(e) => setGeminiPrompt(e.target.value)}
                placeholder="e.g. Add a Diwali Grand Feast & Musical DJ Night this Sunday 7 PM with live tandoori paneer, sweets, ethnic dress contest, and festive poster..."
                className="w-full text-sm p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />

              {/* Poster Theme Selector */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
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
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={isGeneratingEvent}
                  onClick={() => handleGeminiGenerateEvent(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs transition ios-active flex items-center justify-center gap-2"
                >
                  {isGeneratingEvent ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>Generate & Preview First</span>
                </button>

                <button
                  type="button"
                  disabled={isGeneratingEvent}
                  onClick={() => handleGeminiGenerateEvent(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs transition ios-active shadow-md flex items-center justify-center gap-2"
                >
                  {isGeneratingEvent ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Ask Gemini & Publish Live 🚀</span>
                </button>
              </div>
            </div>

            {/* Generated Event Preview Card */}
            {generatedEventPreview && (
              <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-3xl p-5 shadow-lg border border-black/[0.06] dark:border-white/[0.08] space-y-4 animate-fade-in">
                <PosterGenerator event={generatedEventPreview} compact={false} />

                <button
                  type="button"
                  onClick={handlePublishGeneratedEvent}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition ios-active flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Confirm & Publish to Website</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: EVENTS LIST                                       */}
        {/* ======================================================== */}
        {adminTab === 'events-list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                Published Campus Announcements ({allEvents.length})
              </h2>
              <button
                type="button"
                onClick={() => setAdminTab('gemini-event')}
                className="text-xs font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl hover:bg-zinc-200 transition"
              >
                + Add with Gemini
              </button>
            </div>

            {allEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-3xl p-4 shadow-sm border border-black/[0.06] dark:border-white/[0.08] flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                      {event.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {event.date} • {event.time} • {event.venue}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-zinc-400 hover:text-rose-600 transition"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: VERCEL PIPELINE INFO                              */}
        {/* ======================================================== */}
        {adminTab === 'pipeline' && (
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-3xl p-6 shadow-ios dark:shadow-ios-dark border border-black/[0.06] dark:border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-black dark:bg-white text-white dark:text-black">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Vercel Hosting & Production Pipeline
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The project is 100% cloud serverless ready. Git push to <code>main</code> branch automatically builds and deploys to Vercel with continuous integration.
            </p>
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300">
              Repository: https://github.com/ankitpandeynine/Cu-meal.git
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

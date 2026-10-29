'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  Users,
  Search,
  Download,
  FileSpreadsheet,
  Camera,
  UploadCloud,
  X,
  Zap,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DayMenu, MealSlot, UserProfile, ChatMessage } from '@/types';
import { format, addDays, startOfWeek } from 'date-fns';

interface ParsedDay {
  date: string;
  dayName: string;
  meals: MealSlot[];
}

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  // Active Admin Tab (Streamlined to 4 essential tabs with ZERO duplicates or waste)
  const [adminTab, setAdminTab] = useState<'menu-hub' | 'users' | 'admins' | 'chat'>('menu-hub');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Gemini API Key (optional override)
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  // ------------------ PHOTO SCHEDULE ANALYSIS & BIFURCATION STATE ------------------
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [weekStartDate, setWeekStartDate] = useState<string>(() => {
    return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  });
  const [autoPublishVision, setAutoPublishVision] = useState<boolean>(true);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [parsedWeekDays, setParsedWeekDays] = useState<ParsedDay[]>([]);
  const [detectedDateRange, setDetectedDateRange] = useState<string | null>(null);
  const [visionMessage, setVisionMessage] = useState<string | null>(null);
  const [showRawTextFallback, setShowRawTextFallback] = useState<boolean>(false);
  const [rawWeekText, setRawWeekText] = useState<string>('');
  const [isParsingText, setIsParsingText] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ------------------ SINGLE DAY MENU TWEAKER & AI MODIFIER STATE ------------------
  const [menuDate, setMenuDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [isMenuAvailable, setIsMenuAvailable] = useState<boolean>(true);
  const [unavailableMessage, setUnavailableMessage] = useState<string>(
    'The menu is currently being updated. Please check back shortly.'
  );
  const [meals, setMeals] = useState<MealSlot[]>([]);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  const [savingMenu, setSavingMenu] = useState<boolean>(false);
  const [geminiMenuPrompt, setGeminiMenuPrompt] = useState<string>('');
  const [isGeneratingMenu, setIsGeneratingMenu] = useState<boolean>(false);

  // ------------------ REGISTERED USERS STATE ------------------
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // ------------------ ADMIN TEAM STATE ------------------
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState<boolean>(false);
  const [newAdminUsername, setNewAdminUsername] = useState<string>('');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [newAdminName, setNewAdminName] = useState<string>('');

  // ------------------ COMMUNITY BROADCAST STATE ------------------
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [broadcastContent, setBroadcastContent] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

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
      loadUsers();
      loadAdmins();
      loadChat();
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
        setAuthError(data.error || 'Invalid credentials');
      } else {
        setIsAuthenticated(true);
        showToast(`Welcome back, ${data.user || 'Admin'}!`);
        loadMenuForDate(menuDate);
        loadUsers();
        loadAdmins();
        loadChat();
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

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch('/api/admin/accounts');
      const data = await res.json();
      if (data.admins) {
        setAdminsList(data.admins);
      }
    } catch (err) {
      console.warn('Failed to load admin accounts');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadChat = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.messages) {
        setChatMessages(data.messages);
      }
    } catch (err) {
      console.warn('Failed to load chat');
    }
  };

  // ----------------- PHOTO ANALYSIS & AUTO-BIFURCATION -----------------
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    setImageMime(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setVisionMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setSelectedImage(null);
    setImageFileName('');
    setParsedWeekDays([]);
    setDetectedDateRange(null);
    setVisionMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedImage) {
      showToast('Please attach or snap a photo of the mess schedule first.', 'error');
      return;
    }

    setIsAnalyzingImage(true);
    setVisionMessage(null);

    try {
      const res = await fetch('/api/gemini/menu-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse-image',
          imageBase64: selectedImage,
          mimeType: imageMime,
          startDate: weekStartDate,
          autoSave: autoPublishVision,
          apiKey: geminiApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze schedule photo');
      }

      setParsedWeekDays(data.days || []);
      setDetectedDateRange(data.detectedDateRange || null);
      setVisionMessage(data.message || `✓ Parsed and bifurcated ${data.days?.length || 0} days!`);
      showToast(data.message || '✓ Schedule analyzed & bifurcated successfully!');

      if (data.isSaved) {
        loadMenuForDate(menuDate);
      }
    } catch (err: any) {
      showToast(err.message || 'Gemini Vision analysis failed', 'error');
      setVisionMessage(`Error: ${err.message || 'Failed to analyze schedule'}`);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handlePublishAllParsedDays = async () => {
    if (!parsedWeekDays.length) return;
    try {
      for (const day of parsedWeekDays) {
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
      showToast(`✓ All ${parsedWeekDays.length} days published live to website & offline cache!`);
      loadMenuForDate(menuDate);
    } catch (err) {
      showToast('Error saving days to database', 'error');
    }
  };

  // Text-based fallback parser
  const handleParseTextSchedule = async () => {
    if (!rawWeekText.trim()) {
      showToast('Please paste the weekly schedule text', 'error');
      return;
    }
    setIsParsingText(true);
    try {
      const res = await fetch('/api/gemini/bulk-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawWeekText,
          startDate: weekStartDate,
          apiKey: geminiApiKey,
          autoSave: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setParsedWeekDays(data.days || []);
        showToast('✓ Weekly schedule parsed and saved directly!');
        loadMenuForDate(menuDate);
      } else {
        showToast(data.error || 'Failed to parse text', 'error');
      }
    } catch {
      showToast('Failed to connect to parser API', 'error');
    } finally {
      setIsParsingText(false);
    }
  };

  // ----------------- SINGLE DAY GEMINI AI MODIFIER -----------------
  const handleModifyDayWithAI = async (customText?: string) => {
    const textToUse = customText || geminiMenuPrompt;
    if (!textToUse.trim()) {
      showToast('Please write what you want Gemini to change on this day', 'error');
      return;
    }

    setIsGeneratingMenu(true);
    try {
      const res = await fetch('/api/gemini/menu-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'modify-day',
          date: menuDate,
          instruction: textToUse,
          autoSave: true,
          apiKey: geminiApiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gemini modification failed', 'error');
      } else {
        showToast(`✓ Menu for ${menuDate} updated with Gemini!`);
        if (!customText) setGeminiMenuPrompt('');
        loadMenuForDate(menuDate);
      }
    } catch (err) {
      showToast('Error modifying day with Gemini', 'error');
    } finally {
      setIsGeneratingMenu(false);
    }
  };

  // ----------------- SAVE SINGLE DAY MENU DIRECTLY -----------------
  const handleSaveSingleDay = async () => {
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
      if (res.ok) {
        showToast(`✓ Menu for ${menuDate} published live!`);
      } else {
        showToast('Failed to save menu', 'error');
      }
    } catch {
      showToast('Network error saving menu', 'error');
    } finally {
      setSavingMenu(false);
    }
  };

  // ----------------- ADMIN TEAM HANDLERS -----------------
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUsername.trim() || !newAdminPassword.trim()) {
      showToast('Username and password are required', 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newAdminUsername,
          password: newAdminPassword,
          name: newAdminName || newAdminUsername,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create admin', 'error');
      } else {
        showToast(`✓ Admin "${newAdminUsername}" created successfully!`);
        setNewAdminUsername('');
        setNewAdminPassword('');
        setNewAdminName('');
        loadAdmins();
      }
    } catch {
      showToast('Network error creating admin', 'error');
    }
  };

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove admin access for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/accounts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(`Admin ${name} removed.`);
        loadAdmins();
      } else {
        showToast(data.error || 'Failed to delete admin', 'error');
      }
    } catch {
      showToast('Error deleting admin', 'error');
    }
  };

  // ----------------- COMMUNITY BROADCAST HANDLER -----------------
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim()) return;

    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: 'Mess Advisory Council',
          senderHostel: 'Official Admin Broadcast',
          content: broadcastContent.trim(),
          isSecretary: true,
        }),
      });

      if (res.ok) {
        showToast('✓ Council notice broadcast live to all students!');
        setBroadcastContent('');
        loadChat();
      } else {
        showToast('Failed to send broadcast', 'error');
      }
    } catch {
      showToast('Network error sending announcement', 'error');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // ----------------- EXPORT USERS CSV -----------------
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
    link.setAttribute('download', `cumeal_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="w-full min-h-screen flex items-center justify-center text-zinc-500 bg-[#f8fafc] dark:bg-[#000000]">
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
              Authorized Hostel Mess Administration
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
                placeholder="Enter admin username"
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
                placeholder="••••••••"
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
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-lg font-black text-zinc-950 dark:text-white">
              CU Meal Admin Studio
            </h1>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">
            Hostel Mess Administration • Full Control
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

      {/* Streamlined Tab Switcher (Zero Waste, 4 Essential Sections) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-zinc-200/70 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl text-xs font-bold text-zinc-600 dark:text-zinc-400">
          <button
            onClick={() => setAdminTab('menu-hub')}
            className={`py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-2 ${
              adminTab === 'menu-hub'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-black'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>AI Menu & Schedule</span>
          </button>

          <button
            onClick={() => setAdminTab('users')}
            className={`py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-2 ${
              adminTab === 'users'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-black'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students ({usersList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('admins')}
            className={`py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-2 ${
              adminTab === 'admins'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-black'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Admin Team ({adminsList.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('chat')}
            className={`py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-2 ${
              adminTab === 'chat'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-black'
                : 'hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Broadcast Notice</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        {/* ======================================================== */}
        {/* TAB 1: UNIFIED AI MENU & SCHEDULE HUB (Photo + Day Tweaks) */}
        {/* ======================================================== */}
        {adminTab === 'menu-hub' && (
          <div className="space-y-8 animate-fade-in">
            {/* FEATURE A: CLICKED PHOTO ANALYSIS & AUTO-BIFURCATION */}
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black shadow-md">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                        Photo Schedule Analysis & Auto-Bifurcation
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        Gemini Vision
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Upload or snap a photo of any printed or handwritten mess schedule. Gemini auto-detects dates and bifurcates all meals for the week.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="password"
                    placeholder="Optional API key (uses server default)"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white w-full sm:w-56"
                  />
                </div>
              </div>

              {/* Upload Dropzone & Live Preview */}
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-zinc-50/50 dark:bg-zinc-800/30 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-black dark:group-hover:text-white flex items-center justify-center mb-3 transition">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 text-center">
                    Click to browse or take photo of mess timetable
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Supports JPG, PNG, WebP mess circulars & clicked phone photos
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/60 p-4 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-full sm:w-52 h-44 rounded-2xl overflow-hidden bg-black shrink-0 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedImage}
                      alt="Schedule to analyze"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleClearPhoto}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-black transition"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                          {imageFileName || 'clicked_schedule.jpg'}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Photo ready for date detection & bifurcation</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline"
                      >
                        Change photo
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                          Week Start Date Reference
                        </label>
                        <input
                          type="date"
                          value={weekStartDate}
                          onChange={(e) => setWeekStartDate(e.target.value)}
                          className="w-full text-xs font-bold p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="autoPublishVision"
                          checked={autoPublishVision}
                          onChange={(e) => setAutoPublishVision(e.target.checked)}
                          className="w-4 h-4 rounded text-black dark:text-white accent-black dark:accent-white"
                        />
                        <label htmlFor="autoPublishVision" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Auto-publish bifurcated days directly to live site
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAnalyzingImage}
                      onClick={handleAnalyzePhoto}
                      className="w-full mt-2 py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-md transition ios-active flex items-center justify-center gap-2"
                    >
                      {isAnalyzingImage ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Gemini Vision reading dates & bifurcating meals...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Analyze Photo & Auto-Bifurcate Schedule 🚀</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Status / Success Message */}
              {visionMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{visionMessage}</span>
                  </div>
                  {detectedDateRange && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-200/50 dark:bg-emerald-900/60">
                      Dates: {detectedDateRange}
                    </span>
                  )}
                </div>
              )}

              {/* Bifurcated Days Schedule Grid */}
              {parsedWeekDays.length > 0 && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Bifurcated Schedule ({parsedWeekDays.length} Days)
                      </span>
                      {detectedDateRange && (
                        <span className="text-[11px] font-semibold text-zinc-400">
                          • {detectedDateRange}
                        </span>
                      )}
                    </div>

                    {!autoPublishVision && (
                      <button
                        type="button"
                        onClick={handlePublishAllParsedDays}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                      >
                        Publish All Days Live
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {parsedWeekDays.map((day) => (
                      <div
                        key={day.date}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2.5 text-xs shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60 dark:border-zinc-700/60">
                          <span className="font-black text-sm text-zinc-900 dark:text-white">
                            {day.dayName}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400 font-bold bg-zinc-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md">
                            {day.date}
                          </span>
                        </div>

                        <div className="space-y-2 text-[11px]">
                          {day.meals.map((meal) => (
                            <div key={meal.id} className="flex flex-col">
                              <span className="font-bold text-zinc-500 uppercase text-[9px] tracking-wider">
                                {meal.name} ({meal.time})
                              </span>
                              <span className="text-zinc-900 dark:text-zinc-100 font-medium whitespace-pre-line leading-relaxed">
                                {meal.items}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Text-Based Schedule Parser */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowRawTextFallback(!showRawTextFallback)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                >
                  {showRawTextFallback ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span>Prefer pasting raw text schedule instead?</span>
                </button>

                {showRawTextFallback && (
                  <div className="pt-3 space-y-3 animate-fade-in">
                    <textarea
                      rows={5}
                      value={rawWeekText}
                      onChange={(e) => setRawWeekText(e.target.value)}
                      placeholder="Paste Monday through Sunday meal items here..."
                      className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={isParsingText}
                        onClick={handleParseTextSchedule}
                        className="py-2 px-4 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black flex items-center gap-1.5"
                      >
                        {isParsingText ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Parse Text Schedule & Save</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FEATURE B: DAY MENU TWEAKER & SINGLE DAY AI MODIFIER */}
            <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-950 dark:text-white">
                      Single Day Menu Tweaker & AI Modifier
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Select any date to inspect, instruct Gemini to tweak dishes, or edit items directly.
                    </p>
                  </div>
                </div>

                {/* Date Quick Pickers */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const today = format(new Date(), 'yyyy-MM-dd');
                      setMenuDate(today);
                      loadMenuForDate(today);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      menuDate === format(new Date(), 'yyyy-MM-dd')
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Today
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const tmrw = format(addDays(new Date(), 1), 'yyyy-MM-dd');
                      setMenuDate(tmrw);
                      loadMenuForDate(tmrw);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      menuDate === format(addDays(new Date(), 1), 'yyyy-MM-dd')
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Tomorrow
                  </button>

                  <input
                    type="date"
                    value={menuDate}
                    onChange={(e) => {
                      setMenuDate(e.target.value);
                      loadMenuForDate(e.target.value);
                    }}
                    className="text-xs font-bold p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Pill Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Status for {menuDate}:
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuAvailable(!isMenuAvailable)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                    isMenuAvailable
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isMenuAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>{isMenuAvailable ? 'Menu Available' : 'Menu Unavailable'}</span>
                </button>
              </div>

              {/* Tell Gemini AI Modifier Bar */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Tell Gemini to update this day:</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={geminiMenuPrompt}
                    onChange={(e) => setGeminiMenuPrompt(e.target.value)}
                    placeholder="e.g. Change lunch to Amritsari Chole with Sweet Lassi, and add Gulab Jamun to dinner"
                    className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isGeneratingMenu}
                    onClick={() => handleModifyDayWithAI()}
                    className="py-2.5 px-5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {isGeneratingMenu ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    <span>Ask Gemini</span>
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    '🍛 Lunch: Chole Bhature & Lassi',
                    '🍮 Dinner: Add Hot Gulab Jamun',
                    '🥪 NC: Samosa / Zakir: Bread Pakora',
                    '🥞 Breakfast: Paneer Paratha & Curd',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleModifyDayWithAI(sug)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Meal Slots Cards */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Meal Timings & Dishes ({meals.length} Slots)
                </span>

                {loadingMenu ? (
                  <div className="py-12 flex justify-center text-zinc-400">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meals.map((meal, index) => (
                      <div
                        key={meal.id}
                        className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-zinc-900 dark:text-white capitalize">
                            {meal.name}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            {meal.time}
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                            Dishes & Items:
                          </label>
                          <textarea
                            rows={2}
                            value={meal.items}
                            onChange={(e) => {
                              const updated = [...meals];
                              updated[index] = { ...updated[index], items: e.target.value };
                              setMeals(updated);
                            }}
                            className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Day Button */}
              <button
                type="button"
                disabled={savingMenu}
                onClick={handleSaveSingleDay}
                className="w-full py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-md transition ios-active flex items-center justify-center gap-2"
              >
                {savingMenu ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save & Publish Menu for {menuDate}</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: REGISTERED STUDENTS                               */}
        {/* ======================================================== */}
        {adminTab === 'users' && (
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                  Registered Hostel Residents ({usersList.length})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Student profiles saved via onboarding modal, Google sign-in or manual entry.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportUsersCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by student name, UID, hostel, or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs focus:outline-none"
              />
            </div>

            {/* Table */}
            {loadingUsers ? (
              <div className="py-12 flex justify-center text-zinc-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-xs text-zinc-400 py-8 text-center">No students matched your search.</p>
            ) : (
              <div className="border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100/70 dark:bg-zinc-800/70 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-3">UID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Hostel Wing</th>
                      <th className="p-3">Year / Dept</th>
                      <th className="p-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">
                          {u.uid}
                        </td>
                        <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200">
                          {u.name}
                        </td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">
                          {u.hostel}
                        </td>
                        <td className="p-3 text-zinc-500 dark:text-zinc-400">
                          {u.year || '—'} {u.department ? `• ${u.department}` : ''}
                        </td>
                        <td className="p-3 text-zinc-400 text-[11px]">
                          {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ADMIN TEAM MANAGEMENT                             */}
        {/* ======================================================== */}
        {adminTab === 'admins' && (
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                  Hostel Mess Admin Team ({adminsList.length})
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Manage administrators. Any admin created here has full permission to modify menus and review data.
                </p>
              </div>

              <button
                type="button"
                onClick={loadAdmins}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                title="Refresh admin list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Admin Form */}
            <form onSubmit={handleAddAdmin} className="bg-zinc-50/80 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                Add New Administrator Account
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rahul_council"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    Display Name / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul (Mess Secretary)"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Admin Account</span>
                </button>
              </div>
            </form>

            {/* Admins List */}
            {loadingAdmins ? (
              <div className="py-8 flex justify-center text-zinc-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white/60 dark:bg-zinc-900/40">
                {adminsList.map((adm) => (
                  <div key={adm.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300">
                        {adm.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {adm.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            @{adm.username}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            adm.role === 'master'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {adm.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          Added: {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'System Default'}
                        </span>
                      </div>
                    </div>

                    {adm.role !== 'master' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAdmin(adm.id, adm.name)}
                        className="p-2 text-zinc-400 hover:text-rose-600 transition"
                        title="Remove Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: OFFICIAL COMMUNITY BROADCAST                      */}
        {/* ======================================================== */}
        {adminTab === 'chat' && (
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
                  <span>Mess Advisory Council Broadcast</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Verified Council
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Post official notices, dining hall announcements, or special event alerts directly into the student community live chat.
                </p>
              </div>

              <button
                type="button"
                onClick={loadChat}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Broadcast Form */}
            <form onSubmit={handleSendBroadcast} className="space-y-3 bg-zinc-50/80 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                Council Announcement Message:
              </label>

              <textarea
                rows={3}
                required
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                placeholder="e.g. Notice: Special Diwali Dinner will be served tonight from 7:30 PM onwards across all dining halls. Please carry your student ID card."
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="py-2.5 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-md transition ios-active flex items-center gap-2"
                >
                  {isBroadcasting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Broadcast to Students Chat</span>
                </button>
              </div>
            </form>

            {/* Recent Community Messages */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Recent Student Messages ({chatMessages.length})
              </span>

              <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                      msg.isSecretary
                        ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/30'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {msg.senderName}
                        </span>
                        {msg.isSecretary && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
                            👑 Council Notice
                          </span>
                        )}
                        {msg.senderHostel && !msg.isSecretary && (
                          <span className="text-[10px] text-zinc-400">
                            • {msg.senderHostel}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-line">
                        {msg.content}
                      </p>
                    </div>

                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

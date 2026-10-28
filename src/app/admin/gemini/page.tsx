'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ExternalLink, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import GeminiMenuStudio from '@/components/GeminiMenuStudio';

export default function GeminiAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

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
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

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
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white">
              Gemini Menu Studio
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Hostel Admin Login Required
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
              <span>Unlock Gemini Studio</span>
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

  return (
    <div className="w-full min-h-screen pb-20 animate-fade-in bg-[#f8fafc] dark:bg-[#000000] text-[#09090b] dark:text-[#f4f4f5]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
            title="Back to Admin Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-black text-zinc-950 dark:text-white flex items-center gap-2">
              <span>Gemini AI Menu Studio</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[10px] text-zinc-400 font-medium">
              Multimodal Vision & Date Modifier
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl transition"
          >
            Full Admin Panel
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl transition"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
        <GeminiMenuStudio
          apiKey={customApiKey}
          onApiKeyChange={setCustomApiKey}
        />
      </main>
    </div>
  );
}

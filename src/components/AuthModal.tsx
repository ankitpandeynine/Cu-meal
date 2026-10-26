'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types';
import { X, Sparkles, Building2, User, Mail, Hash, ChevronRight, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'login' | 'onboarding'>('login');
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'apple' | 'email'>('google');
  const [loading, setLoading] = useState<boolean>(false);

  // Form Fields for onboarding
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [uid, setUid] = useState<string>('');
  const [hostel, setHostel] = useState<string>('NC Boys (Block 1)');
  const [year, setYear] = useState<string>('2nd Year');
  const [department, setDepartment] = useState<string>('Computer Science & Engg');

  if (!isOpen) return null;

  const handleProviderSelect = (provider: 'google' | 'apple') => {
    setSelectedProvider(provider);
    if (provider === 'google') {
      setEmail('student@cuchd.in');
      setName('Chandigarh University Student');
    } else {
      setEmail('apple.user@icloud.com');
      setName('CU Student');
    }
    setStep('onboarding');
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !uid.trim()) return;

    setLoading(true);
    try {
      const payload: Partial<UserProfile> & { email: string } = {
        name: name.trim(),
        email: email.trim() || `${uid.toLowerCase()}@cuchd.in`,
        uid: uid.trim().toUpperCase(),
        hostel,
        year,
        department,
        provider: selectedProvider,
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.user) {
        localStorage.setItem('cumeal_user', JSON.stringify(data.user));
        onSuccess(data.user);
        onClose();
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 relative">
        {/* Close / Skip button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Skip login"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'login' ? (
          <div className="text-center space-y-6 pt-2">
            {/* Logo / Badge */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg font-black text-xl">
              CU
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                Sign in to CU Meal
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Connect your account to access your hostel's customized mess menu, dietary preferences, and campus notices.
              </p>
            </div>

            {/* Login Providers */}
            <div className="space-y-3 pt-2">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleProviderSelect('google')}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 font-semibold text-sm transition ios-active shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => handleProviderSelect('apple')}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm transition ios-active shadow-sm"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.79-11.89-14.24-7.23-11.09-12.83-23.81-16.79-38.16-3.96-14.35-5.94-27.56-5.94-39.63 0-14.57 3.38-26.69 10.14-36.37 6.76-9.68 15.42-14.61 25.99-14.79 5.01 0 10.66 1.34 16.96 4.02 6.29 2.68 10.45 4.08 12.47 4.21 2.51-.34 6.88-1.84 13.11-4.5 6.23-2.67 11.75-3.88 16.56-3.63 12.28.66 22.14 4.87 29.58 12.63-10.79 6.53-16.08 15.63-15.86 27.31.22 9.25 3.86 17.06 10.92 23.43 7.07 6.38 15.46 10.02 25.18 10.93-2.4 7.42-5.46 14.81-9.18 22.18zM119.22 33.52c0-7.39 2.65-14.28 7.94-20.67 5.29-6.39 11.89-10.67 19.8-12.85.22 1.31.33 2.5.33 3.59 0 7.39-2.83 14.52-8.5 21.39-5.66 6.87-12.19 10.94-19.57 12.2-.21-1.31-.32-2.52-.32-3.66z" />
                </svg>
                <span>Sign in with Apple</span>
              </button>
            </div>

            {/* Skip / Continue as guest */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition py-1"
              >
                Skip for now & Continue as Guest →
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Student Details Form */
          <form onSubmit={handleSubmitProfile} className="space-y-4 pt-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Step 2 of 2 • Student Profile
              </span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">
                Complete Your Profile
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Enter your details so your hostel mess menu and notifications match your wing.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Student UID
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                    placeholder="e.g. 21BCS10892"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white uppercase font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@cuchd.in"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                  Hostel Block / Wing
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <select
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  >
                    <option value="NC Boys (Block 1)">NC Boys (Block 1 & 2)</option>
                    <option value="Zakir Boys (Block 3)">Zakir Boys (Block 3)</option>
                    <option value="LC Boys Wing">LC Boys Wing</option>
                    <option value="Girls Wing (Block A/B)">Girls Wing (Block A & B)</option>
                    <option value="Girls Wing (Block C/D)">Girls Wing (Block C & D)</option>
                    <option value="Day Scholar">Day Scholar / Off-Campus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                    Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">PG / Masters</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="CSE, ECE, MBA..."
                    className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-md transition ios-active flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Saving Profile...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile & Enter App</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

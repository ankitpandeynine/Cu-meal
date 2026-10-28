'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types';
import { X, Sparkles, Building2, User, Mail, Hash, Check, Dices } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

const SAMPLE_STUDENTS = [
  { name: 'Gurpreet Singh', hostel: 'NC Boys (Block 1)', dept: 'Computer Science & Engg', prefix: '23BCS' },
  { name: 'Ananya Sharma', hostel: 'Girls Wing (Block A/B)', dept: 'AI & Data Science', prefix: '24BAI' },
  { name: 'Harpreet Kaur', hostel: 'Girls Wing (Block C/D)', dept: 'Electronics & Comm', prefix: '23ECE' },
  { name: 'Aryan Verma', hostel: 'Zakir Boys (Block 3)', dept: 'Information Technology', prefix: '24BIT' },
  { name: 'Sneha Gupta', hostel: 'Girls Wing (Block A/B)', dept: 'MBA Logistics', prefix: '24MBA' },
  { name: 'Vikram Batra', hostel: 'LC Boys Wing', dept: 'Mechanical Engineering', prefix: '22BME' },
];

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [loading, setLoading] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('Gurpreet Singh');
  const [uid, setUid] = useState<string>(() => `23BCS${Math.floor(1000 + Math.random() * 9000)}`);
  const [email, setEmail] = useState<string>('student@cuchd.in');
  const [hostel, setHostel] = useState<string>('NC Boys (Block 1)');
  const [year, setYear] = useState<string>('2nd Year');
  const [department, setDepartment] = useState<string>('Computer Science & Engg');

  if (!isOpen) return null;

  const handleFillRandom = () => {
    const randomPick = SAMPLE_STUDENTS[Math.floor(Math.random() * SAMPLE_STUDENTS.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newUid = `${randomPick.prefix}${randomNum}`;
    setName(randomPick.name);
    setUid(newUid);
    setEmail(`${randomPick.name.toLowerCase().replace(/\s+/g, '.')}.${randomNum}@cuchd.in`);
    setHostel(randomPick.hostel);
    setDepartment(randomPick.dept);
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const payload: Partial<UserProfile> & { email: string } = {
        name: name.trim(),
        email: email.trim() || `${uid.toLowerCase()}@cuchd.in`,
        uid: uid.trim().toUpperCase(),
        hostel,
        year,
        department,
        provider: 'google',
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
      // Fallback local save even if offline!
      const fallbackUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim() || `${uid.toLowerCase()}@cuchd.in`,
        uid: uid.trim().toUpperCase(),
        hostel,
        year,
        department,
        provider: 'google',
        joinedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      localStorage.setItem('cumeal_user', JSON.stringify(fallbackUser));
      onSuccess(fallbackUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white/90 dark:bg-[#121214]/90 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 relative">
        {/* Skip Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Skip login"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Quick Fill Option */}
        <div className="flex items-start justify-between pr-8 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black mb-1">
              Student Profile
            </div>
            <h2 className="text-xl font-black text-zinc-950 dark:text-white">
              Set Your Hostel & UID
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Personalizes your mess menu, NC/Zakir filter & community chat.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillRandom}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95 shrink-0"
            title="Auto-fill with random student credentials"
          >
            <Dices className="w-3.5 h-3.5 text-rose-500" />
            <span>Random</span>
          </button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmitProfile} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gurpreet Singh"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Student UID
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="24BCS10892"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-white uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Hostel Wing
              </label>
              <select
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                className="w-full px-2.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none"
              >
                <option value="NC Boys (Block 1)">NC Boys (Block 1)</option>
                <option value="Zakir Boys (Block 3)">Zakir Boys (Block 3)</option>
                <option value="LC Boys Wing">LC Boys Wing</option>
                <option value="Girls Wing (Block A/B)">Girls Wing (Block A/B)</option>
                <option value="Girls Wing (Block C/D)">Girls Wing (Block C/D)</option>
                <option value="Day Scholar">Day Scholar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@cuchd.in"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="CSE / IT"
                className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-md transition ios-active flex items-center justify-center gap-2"
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

          <div className="pt-2 text-center border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
            >
              Skip & Continue as Guest →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

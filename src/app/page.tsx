'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import CalendarBar from '@/components/CalendarBar';
import MealCard from '@/components/MealCard';
import MenuUnavailable from '@/components/MenuUnavailable';
import BottomNav, { NavTab } from '@/components/BottomNav';
import DesktopHeader from '@/components/DesktopHeader';
import ProfileView from '@/components/ProfileView';
import CommunityChat from '@/components/CommunityChat';
import AuthModal from '@/components/AuthModal';
import { DayMenu, UserProfile } from '@/types';
import { RefreshCw, WifiOff, Clock, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  // Adapt to the actual current date on the device!
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return format(new Date(), 'yyyy-MM-dd');
  });

  const [activeTab, setActiveTab] = useState<NavTab>('meal');
  const [menuData, setMenuData] = useState<DayMenu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(true);
  const [hostelFilter, setHostelFilter] = useState<'all' | 'boys' | 'girls'>('all');

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Offline State & Status
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineCacheReady, setOfflineCacheReady] = useState<boolean>(false);

  // Device Current Time tracking (updates every 30s)
  const [deviceTime, setDeviceTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDeviceTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Determine which meal is actively being served on device time
  const mealTimingStatus = useMemo(() => {
    const hours = deviceTime.getHours();
    const minutes = deviceTime.getMinutes();
    const currentMins = hours * 60 + minutes;

    // Breakfast: 07:30 AM (450m) to 09:30 AM (570m)
    if (currentMins >= 450 && currentMins <= 570) {
      return { activeCategory: 'breakfast', activeName: 'Breakfast', nextText: 'Lunch at 12:00 PM' };
    }
    // Lunch: 12:00 PM (720m) to 02:00 PM (840m)
    if (currentMins >= 720 && currentMins <= 840) {
      return { activeCategory: 'lunch', activeName: 'Lunch', nextText: 'Snacks at 04:30 PM' };
    }
    // Snacks: 04:30 PM (990m) to 05:30 PM (1050m)
    if (currentMins >= 990 && currentMins <= 1050) {
      return { activeCategory: 'snacks', activeName: 'Snacks', nextText: 'Dinner at 07:30 PM' };
    }
    // Dinner: 07:30 PM (1170m) to 09:30 PM (1290m)
    if (currentMins >= 1170 && currentMins <= 1290) {
      return { activeCategory: 'dinner', activeName: 'Dinner', nextText: 'Breakfast tomorrow at 07:30 AM' };
    }

    // Between slots
    if (currentMins < 450) return { activeCategory: null, activeName: null, nextText: 'Breakfast at 07:30 AM' };
    if (currentMins < 720) return { activeCategory: null, activeName: null, nextText: 'Lunch at 12:00 PM' };
    if (currentMins < 990) return { activeCategory: null, activeName: null, nextText: 'Evening Snacks at 04:30 PM' };
    if (currentMins < 1170) return { activeCategory: null, activeName: null, nextText: 'Dinner at 07:30 PM' };
    return { activeCategory: null, activeName: null, nextText: 'Breakfast tomorrow at 07:30 AM' };
  }, [deviceTime]);

  const isViewingToday = useMemo(() => {
    try {
      return isSameDay(parseISO(selectedDate), new Date());
    } catch {
      return false;
    }
  }, [selectedDate]);

  // Initial Load: Check offline cache, auth, and preload whole week to browser
  useEffect(() => {
    // 1. Immediately check if offline cache has today's menu to display with 0ms delay!
    const todayIso = format(new Date(), 'yyyy-MM-dd');
    try {
      const cacheRaw = localStorage.getItem('cumeal_offline_week_cache');
      if (cacheRaw) {
        const cache = JSON.parse(cacheRaw);
        if (cache[todayIso]) {
          setMenuData(cache[todayIso]);
          setLoadingMenu(false);
          setOfflineCacheReady(true);
        }
      }
    } catch {}

    // 2. Check user auth
    try {
      const storedUser = localStorage.getItem('cumeal_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        if (parsed.hostel?.toLowerCase().includes('girl')) {
          setHostelFilter('girls');
        } else if (parsed.hostel?.toLowerCase().includes('boy')) {
          setHostelFilter('boys');
        }
      } else {
        // Prompt login modal per user request
        setShowAuthModal(true);
      }
    } catch {}

    // 3. Listen to online / offline events
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    setIsOffline(!navigator.onLine);

    // 4. Preload and store WHOLE WEEK plan on browser
    preloadAndCacheWholeWeek();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Preload and store all 7 days of the week in browser storage
  const preloadAndCacheWholeWeek = async () => {
    try {
      const res = await fetch('/api/menu?all=true');
      if (res.ok) {
        const data = await res.json();
        if (data.menus) {
          localStorage.setItem('cumeal_offline_week_cache', JSON.stringify(data.menus));
          localStorage.setItem('cumeal_last_sync_time', new Date().toISOString());
          setOfflineCacheReady(true);
        }
      }
    } catch (e) {
      console.warn('Could not sync full week over network, continuing with offline cache.');
    }
  };

  // Fetch Menu for Selected Date (Instant offline cache + network refresh)
  const fetchMenu = async (date: string) => {
    // Check local cache first
    try {
      const cacheRaw = localStorage.getItem('cumeal_offline_week_cache');
      if (cacheRaw) {
        const cache = JSON.parse(cacheRaw);
        if (cache[date]) {
          setMenuData(cache[date]);
          setLoadingMenu(false);
        }
      }
    } catch {}

    try {
      const res = await fetch(`/api/menu?date=${date}`);
      if (!res.ok) throw new Error('Offline or Network Error');
      const data = await res.json();
      if (data.menu) {
        setMenuData(data.menu);
        // Update local cache
        try {
          const cacheRaw = localStorage.getItem('cumeal_offline_week_cache');
          const cache = cacheRaw ? JSON.parse(cacheRaw) : {};
          cache[date] = data.menu;
          localStorage.setItem('cumeal_offline_week_cache', JSON.stringify(cache));
        } catch {}
      }
    } catch (err) {
      // If network fails, verify offline cache
      try {
        const cacheRaw = localStorage.getItem('cumeal_offline_week_cache');
        if (cacheRaw) {
          const cache = JSON.parse(cacheRaw);
          if (cache[date]) {
            setMenuData(cache[date]);
            setIsOffline(true);
          }
        }
      } catch {}
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    fetchMenu(selectedDate);
  }, [selectedDate]);

  const handleLogout = () => {
    localStorage.removeItem('cumeal_user');
    setCurrentUser(null);
    setShowAuthModal(true);
  };

  // Filter meals according to hostel selection
  const filteredMeals = (menuData?.meals || []).filter((meal) => {
    if (hostelFilter === 'boys') {
      return !meal.id.includes('girls');
    }
    if (hostelFilter === 'girls') {
      return !meal.id.includes('boys');
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#000000] text-[#09090b] dark:text-[#f4f4f5] transition-colors duration-300">
      {/* Desktop Header */}
      <DesktopHeader
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        user={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        isOffline={isOffline}
      />

      <main className="w-full flex-1 flex flex-col">
        {/* ======================================================== */}
        {/* TAB 1: MEALS & CALENDAR                                  */}
        {/* ======================================================== */}
        {activeTab === 'meal' && (
          <div className="w-full flex-1 flex flex-col">
            <div className="w-full max-w-7xl mx-auto md:px-8 md:py-6 flex-1 flex flex-col md:flex-row gap-6">
              {/* Left Column (Desktop) / Top Section (Mobile) */}
              <div className="w-full md:w-[360px] md:shrink-0 flex flex-col md:gap-4">
                {/* Desktop Version: Always show full complete calendar on left */}
                <div className="hidden md:block md:rounded-3xl md:overflow-hidden md:border md:border-black/[0.08] md:dark:border-white/[0.1] md:shadow-ios md:dark:shadow-ios-dark">
                  <CalendarBar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    isOffline={isOffline}
                    alwaysShowFullCalendar={true}
                  />
                </div>

                {/* Mobile Version: Top expandable calendar bar (auto-closes on scroll) */}
                <div className="block md:hidden">
                  <CalendarBar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    isOffline={isOffline}
                    alwaysShowFullCalendar={false}
                  />
                </div>

                {/* Device Time Live Status Banner */}
                {isViewingToday && (
                  <div className="px-4 sm:px-6 md:px-0 pt-2 md:pt-0">
                    <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-3 shadow-sm flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {mealTimingStatus.activeName ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-zinc-900 dark:text-white">
                              Serving Now: {mealTimingStatus.activeName}
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {mealTimingStatus.nextText}
                            </span>
                          </>
                        )}
                      </div>

                      <span className="text-[10px] font-mono font-bold text-zinc-400">
                        {format(deviceTime, 'hh:mm a')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Hostel Wing Glass Switcher */}
                <div className="px-4 sm:px-6 md:px-0 pt-2 md:pt-0">
                  <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-2xl p-2.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-sm flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1">
                      Hostel Wing:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setHostelFilter('all')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          hostelFilter === 'all'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setHostelFilter('boys')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          hostelFilter === 'boys'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        NC/Zakir
                      </button>
                      <button
                        onClick={() => setHostelFilter('girls')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          hostelFilter === 'girls'
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        Girls Wing
                      </button>
                    </div>
                  </div>
                </div>

                {/* Offline Cache Status Chip */}
                <div className="px-4 sm:px-6 md:px-0 pt-2 md:pt-0">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                    <span className="flex items-center gap-1">
                      {isOffline ? (
                        <>
                          <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            Offline: 7-day plan ready
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Week stored on browser</span>
                        </>
                      )}
                    </span>

                    <button
                      onClick={preloadAndCacheWholeWeek}
                      className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-semibold underline text-[10px]"
                    >
                      Sync Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column / Meals Grid */}
              <div className="flex-1 px-4 sm:px-6 md:px-0 py-2 md:py-0 pb-24 md:pb-8">
                {loadingMenu ? (
                  <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
                    <p className="text-xs font-medium">Loading mess schedule...</p>
                  </div>
                ) : !menuData?.isAvailable || filteredMeals.length === 0 ? (
                  <MenuUnavailable
                    message={menuData?.unavailableMessage}
                    onRefresh={() => fetchMenu(selectedDate)}
                  />
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredMeals.map((meal) => {
                      const isServing =
                        isViewingToday &&
                        Boolean(
                          mealTimingStatus.activeCategory &&
                            meal.id.toLowerCase().includes(mealTimingStatus.activeCategory)
                        );
                      const isUpcoming =
                        isViewingToday &&
                        Boolean(
                          mealTimingStatus.nextText &&
                            mealTimingStatus.nextText.toLowerCase().includes(meal.name.toLowerCase().split(' ')[0])
                        );

                      return (
                        <MealCard
                          key={meal.id}
                          meal={meal}
                          isServingNow={isServing}
                          isUpcomingNext={isUpcoming}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: COMMUNITY LIVE MESS CHAT                          */}
        {/* ======================================================== */}
        {activeTab === 'chat' && (
          <CommunityChat
            currentUser={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 3: PROFILE & SETTINGS                                */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <ProfileView
            user={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Floating Bottom Nav for Mobile Phone */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* User Login & Student UID Onboarding Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (user.hostel?.toLowerCase().includes('girl')) {
            setHostelFilter('girls');
          } else if (user.hostel?.toLowerCase().includes('boy')) {
            setHostelFilter('boys');
          }
        }}
      />
    </div>
  );
}

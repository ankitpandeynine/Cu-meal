'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  UploadCloud,
  X,
  Check,
  RefreshCw,
  Calendar,
  Utensils,
  ArrowRight,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Zap,
} from 'lucide-react';
import { MealSlot, DayMenu } from '@/types';
import { format, addDays, startOfWeek } from 'date-fns';

interface ParsedDay {
  date: string;
  dayName: string;
  meals: MealSlot[];
}

interface GeminiMenuStudioProps {
  apiKey?: string;
  onApiKeyChange?: (key: string) => void;
  onMenuUpdated?: () => void;
}

export default function GeminiMenuStudio({
  apiKey = '',
  onApiKeyChange,
  onMenuUpdated,
}: GeminiMenuStudioProps) {
  // ---------------- STATE: VISION IMAGE TO WEEK ----------------
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [weekStartDate, setWeekStartDate] = useState<string>(() => {
    return format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  });
  const [autoPublishVision, setAutoPublishVision] = useState<boolean>(true);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [parsedWeekDays, setParsedWeekDays] = useState<ParsedDay[]>([]);
  const [visionMessage, setVisionMessage] = useState<string | null>(null);

  // ---------------- STATE: DATE-SPECIFIC MODIFIER ----------------
  const [targetDate, setTargetDate] = useState<string>(() => {
    return format(new Date(), 'yyyy-MM-dd');
  });
  const [instruction, setInstruction] = useState<string>('');
  const [isModifyingDay, setIsModifyingDay] = useState<boolean>(false);
  const [currentDayMenu, setCurrentDayMenu] = useState<DayMenu | null>(null);
  const [loadingCurrentDay, setLoadingCurrentDay] = useState<boolean>(false);
  const [modifySuccessMessage, setModifySuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing menu whenever targetDate changes
  const fetchCurrentDayMenu = async (date: string) => {
    setLoadingCurrentDay(true);
    try {
      const res = await fetch(`/api/menu?date=${date}`);
      const data = await res.json();
      if (data.menu) {
        setCurrentDayMenu(data.menu);
      }
    } catch (err) {
      console.warn('Failed to fetch menu for target date');
    } finally {
      setLoadingCurrentDay(false);
    }
  };

  useEffect(() => {
    fetchCurrentDayMenu(targetDate);
  }, [targetDate]);

  // Handle File Input for Picture Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    setImageMime(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      setVisionMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Trigger Gemini Vision to parse the image
  const handleAnalyzePicture = async () => {
    if (!selectedImage) {
      alert('Please attach or drop a picture of the menu first.');
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
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze menu picture');
      }

      setParsedWeekDays(data.days || []);
      setVisionMessage(data.message || `✓ Parsed ${data.days?.length || 0} days successfully!`);
      if (data.isSaved && onMenuUpdated) {
        onMenuUpdated();
      }
    } catch (err: any) {
      setVisionMessage(`Error: ${err.message || 'Gemini vision processing failed'}`);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Manual save for parsed week days
  const handleSaveAllParsedDays = async () => {
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
      setVisionMessage(`✓ All ${parsedWeekDays.length} days published live to website!`);
      if (onMenuUpdated) onMenuUpdated();
    } catch (err) {
      alert('Error saving days to database');
    }
  };

  // Trigger Gemini to modify a specific date
  const handleModifyDay = async (customInstruction?: string) => {
    const textToUse = customInstruction || instruction;
    if (!textToUse.trim()) {
      alert('Please write an instruction for Gemini (e.g., "Change lunch to Rajma Chawal with Boondi Raita")');
      return;
    }

    setIsModifyingDay(true);
    setModifySuccessMessage(null);

    try {
      const res = await fetch('/api/gemini/menu-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'modify-day',
          date: targetDate,
          instruction: textToUse,
          autoSave: true,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to modify day menu');
      }

      setCurrentDayMenu(data.menu);
      setModifySuccessMessage(data.message || `✓ Updated menu for ${targetDate}!`);
      if (!customInstruction) {
        setInstruction('');
      }
      if (onMenuUpdated) {
        onMenuUpdated();
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with Gemini');
    } finally {
      setIsModifyingDay(false);
    }
  };

  const sampleIdeaPills = [
    '🍛 Change Lunch to Amritsari Chole, Sweet Lassi & Salad',
    '🍮 Add Hot Gulab Jamun to dinner',
    '🥪 Set NC snacks to Veg Samosa & Zakir to Bread Pakora',
    '🥞 Replace breakfast with Paneer Paratha & Curd',
    '🍨 Add Vanilla Ice Cream Cone to tonight\'s dinner',
    '🍲 Change Dinner to Dal Makhani, Shahi Paneer & Missi Roti',
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Studio Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-purple-500/10 dark:from-amber-950/40 dark:via-rose-950/40 dark:to-purple-950/40 border border-amber-500/30 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-zinc-950 dark:text-white">
                  Gemini AI Menu Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Multimodal Vision 1.5
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Snap or attach any mess timetable picture to auto-populate the full week, or instruct Gemini to update any specific date.
              </p>
            </div>
          </div>

          {onApiKeyChange && (
            <div className="w-full sm:w-auto">
              <input
                type="password"
                placeholder="Optional Gemini API key (or uses server default)"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none w-full sm:w-64"
              />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: VISION - ATTACH PICTURE FOR WHOLE WEEK SCHEDULE      */}
      {/* ============================================================== */}
      <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-950 dark:text-white">
                1. Attach Picture of Menu (Full Week Importer)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Upload or take a photo of the mess notice board, paper menu, or circular. Gemini Vision reads every day and slot.
              </p>
            </div>
          </div>
        </div>

        {/* Dropzone & Preview */}
        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-zinc-50/50 dark:bg-zinc-800/30 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-black dark:group-hover:text-white flex items-center justify-center mb-3 transition">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 text-center">
              Click to browse or take photo of menu timetable
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Supports JPG, PNG, WebP mess circulars & photos
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800 p-3 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-48 h-40 rounded-2xl overflow-hidden bg-black shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt="Uploaded Mess Menu"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                    {imageFileName || 'menu_photo.jpg'}
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Picture ready for Gemini Vision</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline"
                >
                  Change picture
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                    Week Starting Date
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
                    id="autoPublishCheck"
                    checked={autoPublishVision}
                    onChange={(e) => setAutoPublishVision(e.target.checked)}
                    className="w-4 h-4 rounded text-black dark:text-white accent-black dark:accent-white"
                  />
                  <label htmlFor="autoPublishCheck" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Auto-publish all 7 days live to app
                  </label>
                </div>
              </div>

              <button
                type="button"
                disabled={isAnalyzingImage}
                onClick={handleAnalyzePicture}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-md transition ios-active flex items-center justify-center gap-2"
              >
                {isAnalyzingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini Vision reading menu picture & days...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Analyze Picture & Add All Days for Whole Week 🚀</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Vision Status Message */}
        {visionMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{visionMessage}</span>
          </div>
        )}

        {/* Parsed Week Cards Review Grid */}
        {parsedWeekDays.length > 0 && (
          <div className="pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Extracted Week Schedule ({parsedWeekDays.length} Days)
              </span>

              {!autoPublishVision && (
                <button
                  type="button"
                  onClick={handleSaveAllParsedDays}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                >
                  Publish All {parsedWeekDays.length} Days Now
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {parsedWeekDays.map((day) => (
                <div
                  key={day.date}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="font-black text-zinc-900 dark:text-white">
                      {day.dayName}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {day.date}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    {day.meals.map((meal) => (
                      <div key={meal.id} className="flex flex-col">
                        <span className="font-bold text-zinc-600 dark:text-zinc-400">
                          {meal.name}:
                        </span>
                        <span className="text-zinc-800 dark:text-zinc-200 line-clamp-2">
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
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: DATE-SPECIFIC MODIFIER ("Tell Gemini to Change...") */}
      {/* ============================================================== */}
      <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 shadow-ios dark:shadow-ios-dark space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-950 dark:text-white">
                2. Change Any Particular Date with Gemini
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pick a date and tell Gemini in plain English what to change. Gemini will immediately update that day&apos;s menu.
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1">
            Target Date:
          </span>

          <button
            type="button"
            onClick={() => setTargetDate(format(new Date(), 'yyyy-MM-dd'))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              targetDate === format(new Date(), 'yyyy-MM-dd')
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Today ({format(new Date(), 'EEE d')})
          </button>

          <button
            type="button"
            onClick={() => setTargetDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              targetDate === format(addDays(new Date(), 1), 'yyyy-MM-dd')
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Tomorrow ({format(addDays(new Date(), 1), 'EEE d')})
          </button>

          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="text-xs font-bold p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
          />
        </div>

        {/* Live Current Dishes for Date */}
        <div className="bg-zinc-50/80 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Current Menu for {targetDate}:</span>
            </span>

            {loadingCurrentDay && (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            {['breakfast', 'lunch', 'snacks-boys', 'dinner'].map((slotId) => {
              const meal = currentDayMenu?.meals?.find((m) => m.id.includes(slotId));
              return (
                <div key={slotId} className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
                    {slotId.replace('-boys', '')}
                  </span>
                  <p className="text-zinc-800 dark:text-zinc-200 text-[11px] font-medium line-clamp-2">
                    {meal?.items || 'Not scheduled'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instruction Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
            Tell Gemini What to Change:
          </label>

          <div className="relative">
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Change lunch to Amritsari Chole with Sweet Lassi, and add Hot Gulab Jamun to dinner..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
            />

            <button
              type="button"
              disabled={isModifyingDay}
              onClick={() => handleModifyDay()}
              className="absolute right-3 bottom-3 py-2 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs shadow-md transition ios-active flex items-center gap-1.5"
            >
              {isModifyingDay ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Tell Gemini & Update</span>
            </button>
          </div>

          {/* Quick Idea Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleIdeaPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handleModifyDay(pill)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition text-left"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modification Feedback */}
        {modifySuccessMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{modifySuccessMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

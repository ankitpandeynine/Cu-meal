'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile } from '@/types';
import { Send, Heart, Sparkles, User, RefreshCw, MessageSquare, ThumbsUp, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityChatProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export default function CommunityChat({ currentUser, onOpenAuth }: CommunityChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputContent, setInputContent] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.warn('Failed to fetch chat messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000); // Polling for new community messages
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    setSending(true);
    try {
      const senderName = currentUser ? currentUser.name : 'Hostel Resident';
      const senderUid = currentUser ? currentUser.uid : undefined;
      const senderHostel = currentUser ? currentUser.hostel : 'CU Campus Hostel';
      const isSecretary = senderName.toLowerCase().includes('secretary') || senderName.toLowerCase().includes('ankit');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderUid,
          senderHostel,
          content: inputContent,
          isSecretary,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputContent('');
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return;
    setLikedIds((prev) => new Set(prev).add(id));

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes: (m.likes || 0) + 1 } : m))
    );

    try {
      await fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  const quickReactions = ['😋 Yummy today', '🍛 Need more rice', '🔥 Chole Bhature OP', '🍦 Is dessert available?', '☕ Tea was great'];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] px-4 sm:px-6 py-4 animate-fade-in">
      {/* Chat Room Top Bar */}
      <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-4 shadow-sm flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-zinc-950 dark:text-white flex items-center gap-2">
              <span>Hostel Mess Community</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Live feedback, dish requests & official mess updates
            </p>
          </div>
        </div>

        <button
          onClick={fetchMessages}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          title="Refresh Messages"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-3.5 no-scrollbar">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-zinc-900 dark:text-white" />
            <p className="text-xs">Connecting to mess community...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center text-zinc-400 text-xs">
            No messages yet. Be the first to start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = currentUser && currentUser.uid === msg.senderUid;
            const hasLiked = likedIds.has(msg.id);

            return (
              <div
                key={msg.id}
                style={{
                  animation: `bounceIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${Math.min(index * 0.03, 0.3)}s both`,
                }}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-transform`}
              >
                {/* Sender Header */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {msg.senderName}
                  </span>
                  {msg.isSecretary && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      👑 Mess Council
                    </span>
                  )}
                  {msg.senderHostel && !msg.isSecretary && (
                    <span className="px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400">
                      {msg.senderHostel}
                    </span>
                  )}
                </div>

                {/* Message Bubble with Glass Styling */}
                <div
                  className={`relative max-w-[85%] sm:max-w-md rounded-3xl p-3.5 shadow-sm transition-all duration-200 hover:shadow-md ${
                    msg.isSecretary
                      ? 'bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-amber-500/5 dark:from-amber-950/40 dark:to-rose-950/40 border border-amber-500/30 text-zinc-900 dark:text-zinc-50'
                      : isMe
                      ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none'
                      : 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] text-zinc-900 dark:text-zinc-100 rounded-tl-none'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                    {msg.content}
                  </p>

                  {/* Bubble footer with timestamp and like button */}
                  <div
                    className={`flex items-center justify-between gap-3 mt-2 pt-1 border-t text-[10px] ${
                      isMe
                        ? 'border-white/15 text-zinc-300 dark:text-zinc-700'
                        : 'border-black/5 dark:border-white/5 text-zinc-400'
                    }`}
                  >
                    <span>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>

                    <button
                      onClick={() => handleLike(msg.id)}
                      className={`flex items-center gap-1 font-bold transition-transform active:scale-125 ${
                        hasLiked ? 'text-rose-500' : 'hover:opacity-80'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${hasLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                      <span>{msg.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0">
        {quickReactions.map((chip, i) => (
          <button
            key={i}
            onClick={() => setInputContent(chip)}
            className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-300 hover:border-black/20 dark:hover:border-white/20 transition whitespace-nowrap active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Input Box with Frosted Glass UI */}
      <div className="shrink-0 pt-2">
        <form
          onSubmit={handleSendMessage}
          className="bg-white/85 dark:bg-zinc-900/75 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] rounded-3xl p-2 shadow-ios dark:shadow-ios-dark flex items-center gap-2"
        >
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={
              currentUser
                ? `Message as ${currentUser.name.split(' ')[0]}...`
                : 'Share mess feedback or ask question...'
            }
            className="flex-1 px-4 py-2 bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
          />

          {!currentUser && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white px-2 py-1"
            >
              Set Profile
            </button>
          )}

          <button
            type="submit"
            disabled={sending || !inputContent.trim()}
            className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-all duration-200 active:scale-90 disabled:opacity-40 shadow-sm shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Global CSS keyframes for bounceIn animation */}
      <style jsx global>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(12px);
          }
          60% {
            opacity: 1;
            transform: scale(1.03) translateY(-2px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

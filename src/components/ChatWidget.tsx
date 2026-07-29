import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
}

interface ChatApiResponse {
  success: boolean;
  message: string;
  data?: { reply: string; conversationId: string };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:5229/api';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  az: 'Azerbaijani',
  tr: 'Turkish',
  ru: 'Russian',
};

/** Fallback error messages per language when the backend call fails entirely. */
const ERROR_MESSAGES: Record<string, string> = {
  en: "I'm sorry, I couldn't connect to the assistant right now. Please try again in a moment.",
  az: 'Bağlantı xətası baş verdi. Bir az sonra yenidən cəhd edin.',
  tr: 'Asistana bağlanılamadı. Lütfen bir süre sonra tekrar deneyin.',
  ru: 'Не удалось подключиться к ассистенту. Пожалуйста, повторите попытку позже.',
};

const RATE_LIMIT_MESSAGES: Record<string, string> = {
  en: "You're sending messages too quickly. Please wait a moment.",
  az: 'Çox tez mesaj göndərirsiniz. Bir az gözləyin.',
  tr: 'Çok hızlı mesaj gönderiyorsunuz. Lütfen bekleyin.',
  ru: 'Вы отправляете сообщения слишком быстро. Подождите немного.',
};

const WELCOME_MESSAGES: Record<string, string> = {
  en: "Hi! 👋 I'm the TradeHub assistant. Ask me anything about our products, prices, stock, or shipping!",
  az: 'Salam! 👋 Mən TradeHub köməkçisiyəm. Məhsullarımız, qiymətlər, stok vəziyyəti və ya çatdırılma haqqında istənilən sualı verin!',
  tr: 'Merhaba! 👋 Ben TradeHub asistanıyım. Ürünlerimiz, fiyatlar, stok durumu veya kargo hakkında her şeyi sorabilirsiniz!',
  ru: 'Привет! 👋 Я ассистент TradeHub. Спрашивайте о наших продуктах, ценах, наличии или доставке!',
};

// ── Chat Widget Component ─────────────────────────────────────────────────────

export const ChatWidget: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] || 'en';

  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue]   = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [hasUnread, setHasUnread]     = useState(false);

  // Generate a stable conversationId for the lifetime of this widget mount
  const conversationIdRef = useRef<string>(crypto.randomUUID());
  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLTextAreaElement>(null);
  const wasOpenRef        = useRef(false);

  // ── Initialize welcome message when widget first opens ─────────────────────
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id:        crypto.randomUUID(),
        role:      'assistant',
        content:   WELCOME_MESSAGES[currentLanguage] || WELCOME_MESSAGES.en,
        timestamp: new Date(),
      }]);
    }

    if (isOpen) {
      wasOpenRef.current = true;
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, currentLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll to newest message ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id:        crypto.randomUUID(),
      role:      'user',
      content:   text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:        text,
          conversationId: conversationIdRef.current,
          language:       currentLanguage,
        }),
      });

      const data: ChatApiResponse = await response.json();

      if (response.status === 429) {
        setMessages(prev => [...prev, {
          id:        crypto.randomUUID(),
          role:      'error',
          content:   RATE_LIMIT_MESSAGES[currentLanguage] || RATE_LIMIT_MESSAGES.en,
          timestamp: new Date(),
        }]);
        return;
      }

      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || 'Request failed');
      }

      // Update conversationId with what the server echoes back
      conversationIdRef.current = data.data.conversationId;

      setMessages(prev => [...prev, {
        id:        crypto.randomUUID(),
        role:      'assistant',
        content:   data.data!.reply,
        timestamp: new Date(),
      }]);

      // Show unread badge if widget is closed
      if (!isOpen) setHasUnread(true);

    } catch (err) {
      console.error('[ChatWidget] Error calling chat API:', err);
      setMessages(prev => [...prev, {
        id:        crypto.randomUUID(),
        role:      'error',
        content:   ERROR_MESSAGES[currentLanguage] || ERROR_MESSAGES.en,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [inputValue, isLoading, currentLanguage, isOpen]);

  // ── Handle Enter key (Shift+Enter = newline) ──────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Format timestamp ──────────────────────────────────────────────────────
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating Trigger Button ─────────────────────────────────────────── */}
      <button
        id="chat-widget-trigger"
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 z-[9000] w-14 h-14 rounded-full flex items-center justify-center
          shadow-2xl shadow-purple-900/50 transition-all duration-300 cursor-pointer
          ${isOpen
            ? 'bg-slate-800 border border-slate-700 rotate-0 scale-95'
            : 'bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:scale-110 hover:shadow-purple-600/50'
          }`}
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-slate-300" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse" />
        )}
      </button>

      {/* ── Chat Panel ──────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="chat-widget-panel"
          className="fixed bottom-24 right-6 z-[8999] w-[360px] max-h-[560px] flex flex-col
            bg-[#0D1117] border border-purple-500/20 rounded-2xl overflow-hidden
            shadow-2xl shadow-purple-900/30 animate-scaleUp"
          role="dialog"
          aria-label="TradeHub AI Assistant"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border-b border-purple-500/20 flex-shrink-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0D1117]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">TradeHub Assistant</p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI-powered · {LANGUAGE_LABELS[currentLanguage] || 'English'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-0.5">
                  {msg.role === 'user' ? (
                    <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  ) : msg.role === 'error' ? (
                    <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-sm'
                        : msg.role === 'error'
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-tl-sm'
                        : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-600 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 flex-row">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 p-3 border-t border-slate-800/80 bg-[#0D1117]">
            <div className="flex gap-2 items-end bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 focus-within:border-purple-500/50 transition-colors">
              <textarea
                ref={inputRef}
                id="chat-input"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentLanguage === 'az' ? 'Sualınızı yazın...' :
                  currentLanguage === 'tr' ? 'Sorunuzu yazın...' :
                  currentLanguage === 'ru' ? 'Задайте вопрос...' :
                  'Ask about products, prices, stock...'
                }
                rows={1}
                maxLength={1000}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 resize-none outline-none leading-relaxed max-h-24 overflow-y-auto disabled:opacity-50"
                style={{ minHeight: '24px' }}
                aria-label="Chat message input"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-1.5">
              AI assistant · Only answers TradeHub questions
            </p>
          </div>
        </div>
      )}
    </>
  );
};

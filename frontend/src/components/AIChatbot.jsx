import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const STORAGE_KEY = 'plotcrm_chat_history';

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, typing]);

  const send = async (customText) => {
    const text = (typeof customText === 'string' ? customText : input).trim();
    if (!text || loading) return;
    if (typeof customText !== 'string') setInput('');
    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    setTyping(true);
    try {
      const history = [...messages, userMsg].slice(0, -1).map(({ role, content }) => ({ role, content }));
      const res = await axios.post('/api/chat', { message: text, history });
      const assistantMsg = {
        role: 'assistant',
        content: res.data.reply,
        plotIds: res.data.recommended_plots || [],
        id: Date.now() + 1,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch {
      toast.error('Chat failed. Check GROQ_API_KEY or GEMINI_API_KEY in backend .env');
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Sorry, I could not respond. Ensure GROQ_API_KEY or GEMINI_API_KEY is set in backend/.env and restart the server.',
          id: Date.now() + 1,
        },
      ]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform lg:bottom-8 lg:right-8"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative flex h-[85vh] sm:h-[600px] w-full sm:max-w-md flex-col rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-gradient-to-r from-violet-600 to-primary-600 text-white rounded-t-2xl sm:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <p className="font-bold text-sm">PlotCRM AI</p>
                  <p className="text-[10px] text-white/80">Plots · pricing · recommendations</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={clearChat} className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30">Clear</button>
                <button type="button" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/20"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6 px-2 space-y-4">
                  <div className="text-slate-500 dark:text-slate-400">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Ask me anything</p>
                    <p className="text-xs">I can recommend plots, check Vastu facings, explain pricing, or navigate the app.</p>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-2">
                    {[
                      "Show me plots under 40 lakhs",
                      "Which plots are East facing?",
                      "Explain DTCP approved plots",
                      "Which plot is best for investment?"
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-xs text-left font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shadow-sm"
                      >
                        💡 {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === 'user'
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    {m.plotIds?.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-slate-200/50 dark:border-slate-700 pt-2">
                        {m.plotIds.map((p) => (
                          <Link
                            key={p.id}
                            to={`/plots/${p.id}`}
                            onClick={() => setOpen(false)}
                            className="block text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            → {p.name} ({p.formatted_price})
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3 flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask about plots..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm dark:text-white focus:border-primary-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading}
                className="rounded-xl bg-primary-600 p-2.5 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;

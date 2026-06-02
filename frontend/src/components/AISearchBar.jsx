import React, { useEffect, useState } from 'react';
import { Sparkles, Search, History, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { aiSearch, getSearchSuggestions } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

const HISTORY_KEY = 'plotcrm_search_history';

const AISearchBar = ({ onResults }) => {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    getSearchSuggestions().then((r) => setSuggestions(r.data.suggestions || [])).catch(() => {});
    try {
      setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'));
    } catch {
      setHistory([]);
    }
  }, []);

  const saveHistory = (q) => {
    const next = [q, ...history.filter((h) => h !== q)].slice(0, 8);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const runSearch = async (q) => {
    const text = (q || query).trim();
    if (!text) return;
    setLoading(true);
    setShowPanel(false);
    try {
      const res = await aiSearch(text, lang);
      saveHistory(text);
      setQuery(text);
      onResults?.(res.data.results, res.data.interpreted_filters, text);
      toast.success(`Found ${res.data.results.length} matching plot(s)`);
    } catch {
      toast.error('AI search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-violet-200 dark:border-violet-800/50 bg-gradient-to-r from-violet-50/90 via-white to-primary-50/50 dark:from-violet-950/40 dark:via-slate-900 dark:to-primary-950/20 p-3 sm:p-4 shadow-md">
        <div className="relative flex-1">
          <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowPanel(true)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder={t('aiSearch')}
            className="w-full rounded-xl border-0 bg-white/80 dark:bg-slate-800/80 py-3.5 sm:py-4 pl-12 pr-4 text-base text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-violet-400 dark:text-white dark:placeholder-slate-500 shadow-inner"
          />
        </div>
        <button
          type="button"
          onClick={() => runSearch()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50 shrink-0"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
          <span className="hidden sm:inline">AI Search</span>
        </button>
      </div>

      {showPanel && (suggestions.length > 0 || history.length > 0) && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase">Suggestions</span>
            <button type="button" onClick={() => setShowPanel(false)}><X className="h-4 w-4 text-slate-400" /></button>
          </div>
          {history.length > 0 && (
            <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><History className="h-3 w-3" /> Recent</p>
              {history.map((h) => (
                <button key={h} type="button" onClick={() => runSearch(h)} className="block w-full text-left text-sm py-1.5 text-slate-600 hover:text-violet-600 dark:text-slate-300 truncate">
                  {h}
                </button>
              ))}
            </div>
          )}
          <div className="p-2">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => runSearch(s)} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50 dark:text-slate-300 dark:hover:bg-violet-950/30">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISearchBar;

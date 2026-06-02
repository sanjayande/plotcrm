import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, GitCompare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
const PlotCompareModal = ({ plots, onClose }) => {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        toast.error('Maximum 3 plots');
        return prev;
      }
      return [...prev, id];
    });
  };

  const runCompare = async () => {
    if (selected.length < 2) {
      toast.error('Select at least 2 plots');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/plots/compare', { plot_ids: selected });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Compare failed');
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    name: 'Plot Name',
    location: 'Location',
    formatted_price: 'Price',
    sq_yards: 'Size (Sq Yd)',
    facing: 'Facing',
    amenities: 'Amenities',
    status: 'Status',
    price_per_sq_yard: 'Per Sq Yd',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-slate-800">
          <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary-600" /> Compare Plots
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex-1">
          {!result ? (
            <>
              <p className="text-sm text-slate-500 mb-4">Select 2–3 plots to compare side by side.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {plots.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      selected.includes(p.id)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggle(p.id)}
                      className="rounded border-slate-300 text-primary-600"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate">{p.location}</p>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={runCompare}
                disabled={loading || selected.length < 2}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
                Compare Selected
              </button>
            </>
          ) : (
            <div className="space-y-6">
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl shadow-inner bg-slate-50/20 dark:bg-slate-900/20">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left py-4 px-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">Compare Parameters</th>
                      {result.plots.map((p) => (
                        <th key={p.id} className="text-left py-4 px-4 font-bold text-slate-900 dark:text-white">
                          <Link to={`/plots/${p.id}`} onClick={onClose} className="hover:text-primary-600 dark:hover:text-primary-400 underline decoration-dotted decoration-slate-400">
                            {p.name}
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.fields.map((field) => (
                      <tr key={field} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-900/30">
                          {labels[field] || field}
                        </td>
                        {result.plots.map((p) => {
                          const val = p[field] ?? '—';
                          const isBestPrice = p.highlights?.includes('best_price') && field === 'formatted_price';
                          const isLargest = p.highlights?.includes('largest_plot') && field === 'sq_yards';
                          
                          return (
                            <td
                              key={`${p.id}-${field}`}
                              className={`py-3.5 px-4 text-sm text-slate-700 dark:text-slate-300 font-medium ${
                                isBestPrice || isLargest ? 'bg-emerald-50/70 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-400' : ''
                              }`}
                            >
                              {val}
                              {isBestPrice && <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">★ Best Price</span>}
                              {isLargest && <span className="ml-1.5 inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-850 dark:bg-violet-950/30 dark:text-violet-400">★ Largest</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="md:hidden space-y-4">
                <p className="text-xs text-slate-450 italic font-medium px-1">Scroll vertically or swipe cards to compare side by side.</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {result.plots.map((p) => {
                    const hasBestPrice = p.highlights?.includes('best_price');
                    const hasLargest = p.highlights?.includes('largest_plot');
                    
                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl border p-5 space-y-4 shadow-sm relative overflow-hidden bg-white dark:bg-slate-900 transition-all ${
                          hasBestPrice
                            ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                            : hasLargest
                            ? 'border-violet-500 ring-2 ring-violet-500/10'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Decorative Top Accent Tag */}
                        {hasBestPrice && (
                          <span className="absolute top-0 right-0 rounded-bl-xl bg-emerald-500 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                            Best Value
                          </span>
                        )}
                        {hasLargest && !hasBestPrice && (
                          <span className="absolute top-0 right-0 rounded-bl-xl bg-violet-500 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                            Largest Plot
                          </span>
                        )}

                        <div>
                          <Link
                            to={`/plots/${p.id}`}
                            onClick={onClose}
                            className="font-bold text-base text-slate-800 dark:text-white hover:text-primary-600 block line-clamp-1"
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">📍 {p.location}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <div className="space-y-0.5">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Price Valuation</p>
                            <p className={`font-extrabold text-sm ${hasBestPrice ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                              {p.formatted_price}
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Total Area Size</p>
                            <p className="font-extrabold text-sm text-slate-800 dark:text-white">
                              {p.sq_yards} Sq Yds
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Facing Direction</p>
                            <p className="font-bold text-slate-700 dark:text-slate-350">{p.facing || '—'}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Per Sq Yard Rate</p>
                            <p className="font-bold text-slate-700 dark:text-slate-350">{p.price_per_sq_yard}</p>
                          </div>
                        </div>

                        <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Infrastructure & Amenities</p>
                          <p className="text-slate-750 dark:text-slate-300 font-medium line-clamp-2">{p.amenities || 'None listed'}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <span className={`inline-flex rounded-full px-2 py-0.5 font-bold ${
                            p.status === 'Available' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-650'
                          }`}>
                            {p.status}
                          </span>
                          <Link to={`/plots/${p.id}`} onClick={onClose} className="text-primary-600 font-bold hover:underline">View Plot →</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  ← Change Plot Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlotCompareModal;

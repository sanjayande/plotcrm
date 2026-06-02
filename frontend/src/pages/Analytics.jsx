import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { TrendingUp, Users, MapPin, IndianRupee, Target } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { CardSkeleton } from '../components/Skeleton';
import { getAnalytics } from '../services/api';
import { formatPrice } from '../utils/format';

const Bar = ({ label, value, max }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-slate-600 dark:text-slate-400 truncate">{label}</span>
      <span className="font-bold text-slate-800 dark:text-white">{value}</span>
    </div>
    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
      <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  </div>
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AppHeader title="Analytics" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}</div>
      </div>
    );
  }

  if (!data) return null;

  const maxLoc = Math.max(...(data.top_locations?.map((l) => l.count) || [1]), 1);
  const lb = data.lead_breakdown || {};

  return (
    <div className="space-y-8 pb-10">
      <AppHeader title="Analytics Dashboard" subtitle="Sales, leads, and location insights" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: IndianRupee, label: 'Est. Revenue (Sold)', value: formatPrice(data.total_revenue), color: 'text-emerald-600' },
          { icon: Target, label: 'Conversion Rate', value: `${data.conversion_rate}%`, color: 'text-primary-600' },
          { icon: Users, label: 'Active Leads', value: data.active_leads, color: 'text-amber-600' },
          { icon: TrendingUp, label: 'Plots Sold', value: data.total_sales, color: 'text-rose-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5">
            <Icon className={`h-5 w-5 ${color} mb-2`} />
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary-600" /> Lead Priority
          </h3>
          <div className="space-y-3">
            <Bar label="Hot Leads" value={lb.hot || 0} max={data.active_leads || 1} />
            <Bar label="Warm Leads" value={lb.warm || 0} max={data.active_leads || 1} />
            <Bar label="Cold Leads" value={lb.cold || 0} max={data.active_leads || 1} />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary-600" /> Top Locations
          </h3>
          <div className="space-y-3">
            {(data.top_locations || []).length === 0 ? (
              <p className="text-sm text-slate-500">No location data yet</p>
            ) : (
              data.top_locations.map((l) => (
                <Bar key={l.location} label={l.location} value={l.count} max={maxLoc} />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Plot Inventory</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div><p className="text-2xl font-bold text-slate-800 dark:text-white">{data.available_plots}</p><p className="text-xs text-slate-500">Available</p></div>
          <div><p className="text-2xl font-bold text-slate-800 dark:text-white">{data.total_sales}</p><p className="text-xs text-slate-500">Sold</p></div>
          <div><p className="text-2xl font-bold text-slate-800 dark:text-white">{formatPrice(data.avg_plot_price)}</p><p className="text-xs text-slate-500">Avg Price</p></div>
          <div><p className="text-2xl font-bold text-slate-800 dark:text-white">{data.visits_scheduled}</p><p className="text-xs text-slate-500">Visits Scheduled</p></div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

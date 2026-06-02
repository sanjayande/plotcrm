import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Users, 
  Layers, 
  CheckCircle, 
  Clock, 
  Plus, 
  Phone, 
  FileText,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import AppHeader from '../components/AppHeader';
import ActivityTimeline from '../components/ActivityTimeline';
import LeadPriorityBadge from '../components/LeadPriorityBadge';
import { formatPrice } from '../utils/format';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('/api/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const {
    stats, upcoming_follow_ups, recent_activities, upcoming_visits = [], analytics_summary = {},
  } = data || {
    stats: { total_plots: 0, available_plots: 0, sold_plots: 0, reserved_plots: 0, total_customers: 0, hot_leads: 0 },
    upcoming_follow_ups: [],
    upcoming_visits: [],
    recent_activities: [],
    analytics_summary: {},
  };

  const statCards = [
    {
      title: 'Total Plots',
      value: stats.total_plots,
      icon: Layers,
      color: 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400',
      description: 'Land assets listed'
    },
    {
      title: 'Available',
      value: stats.available_plots,
      icon: MapPin,
      color: 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400',
      description: 'Ready to sell'
    },
    {
      title: 'Sold Plots',
      value: stats.sold_plots,
      icon: CheckCircle,
      color: 'bg-rose-500/10 text-rose-650 dark:text-rose-400',
      description: 'Completed deals'
    },
    {
      title: 'Active Customers',
      value: stats.total_customers,
      icon: Users,
      color: 'bg-amber-500/10 text-amber-650 dark:text-amber-400',
      description: 'Buyers in directory'
    },
    {
      title: 'Hot Leads',
      value: stats.hot_leads || 0,
      icon: TrendingUp,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      description: 'Priority follow-ups'
    },
  ];

  return (
    <div className="space-y-8 p-1 sm:p-2">
      <AppHeader title="Dashboard" subtitle="Real-time metrics, visits, and activity feed" />
      <div className="flex flex-wrap gap-2.5 -mt-4 mb-2">
          <Link
            to="/plots"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/15 hover:bg-primary-700 transition-all duration-150 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Plot
          </Link>
          <Link
            to="/customers"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all duration-155 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Register Customer
          </Link>
      </div>

      {analytics_summary?.conversion_rate != null && (
        <div className="rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/30 px-4 py-3 text-sm">
          <span className="font-bold text-primary-800 dark:text-primary-300">Revenue (sold): </span>
          {formatPrice(analytics_summary.total_revenue)} ·
          <span className="font-bold text-primary-800 dark:text-primary-300 ml-2">Conversion: </span>
          {analytics_summary.conversion_rate}%
          <Link to="/analytics" className="ml-3 font-bold text-primary-600 hover:underline">View analytics →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800/80 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-550 dark:text-slate-400">{card.title}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-905 dark:text-white leading-none">{card.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Reminders and Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Follow-ups column */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800/80">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-850 dark:text-white">
              <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              Follow-Up Calendar Reminders
            </h3>
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-750 dark:bg-primary-950/50 dark:text-primary-450">
              {upcoming_follow_ups.length} scheduled
            </span>
          </div>

          {upcoming_follow_ups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">No pending client reminders.</p>
              <Link to="/customers" className="mt-1 text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors">
                Schedule a follow-up date
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {upcoming_follow_ups.map((c) => (
                <div key={c.id} className="flex flex-col gap-3 py-4.5 sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/customers/${c.id}`} className="font-bold text-slate-800 dark:text-white hover:text-primary-600">{c.name}</Link>
                      {c.lead_priority && <LeadPriorityBadge priority={c.lead_priority} />}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {c.interested_location || 'General'}
                      </span>
                    </div>
                    {c.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md line-clamp-1">{c.notes}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-primary-650 dark:text-primary-400 font-bold">
                      <Clock className="h-3.5 w-3.5" />
                      Follow-up: {new Date(c.follow_up_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${c.phone_number}`}
                      className="flex h-9 items-center justify-center gap-2 rounded-xl bg-slate-50 px-3.5 text-xs font-bold text-slate-700 border border-slate-200/70 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850 transition-colors duration-150"
                    >
                      <Phone className="h-3.5 w-3.5" /> {c.phone_number}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800/80">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-850 dark:text-white">
            <MapPin className="h-5 w-5 text-emerald-500" />
            Upcoming Site Visits
          </h3>
          {upcoming_visits.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No visits scheduled</p>
          ) : (
            <div className="space-y-3">
              {upcoming_visits.map((v) => (
                <div key={v.id} className="rounded-lg border border-slate-100 dark:border-slate-800 p-3">
                  <p className="font-bold text-sm dark:text-white">{v.customer_name}</p>
                  <p className="text-xs text-slate-500">{v.visit_date} {v.visit_time} · {v.plot_name || 'TBD'}</p>
                </div>
              ))}
            </div>
          )}
          <Link to="/site-visits" className="mt-3 inline-block text-xs font-bold text-primary-600">Manage visits →</Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800/80">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-850 dark:text-white">
          <Activity className="h-5 w-5 text-indigo-500" />
          Recent Activity Feed
        </h3>
        <ActivityTimeline activities={recent_activities} />
      </div>
    </div>
  );
};

export default Dashboard;

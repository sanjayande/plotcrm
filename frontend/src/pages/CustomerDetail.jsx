import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Phone, Calendar, Sparkles, MapPin } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import LeadPriorityBadge from '../components/LeadPriorityBadge';
import { getCustomerDetail, suggestLeadPriority } from '../services/api';
import { formatPrice } from '../utils/format';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getCustomerDetail(id);
      setData(res.data);
    } catch {
      toast.error('Customer not found');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSuggest = async () => {
    try {
      const res = await suggestLeadPriority(id);
      toast.success(`Suggested: ${res.data.suggested_priority} — ${res.data.reason}`);
    } catch {
      toast.error('Could not get AI suggestion');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  const c = data?.customer;
  if (!c) return null;

  return (
    <div className="space-y-6 pb-10">
      <button onClick={() => navigate('/customers')} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back to CRM
      </button>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{c.name}</h1>
              <LeadPriorityBadge priority={c.lead_priority} />
            </div>
            <a href={`tel:${c.phone_number}`} className="mt-2 inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="h-4 w-4" /> {c.phone_number}
            </a>
          </div>
          <button onClick={handleSuggest} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700">
            <Sparkles className="h-4 w-4" /> AI Priority Suggestion
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500">Budget</p>
            <p className="font-bold text-slate-800 dark:text-white">{formatPrice(c.budget)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500">Interested Location</p>
            <p className="font-bold text-slate-800 dark:text-white">{c.interested_location || '—'}</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
            <p className="text-xs text-slate-500">Follow-Up</p>
            <p className="font-bold text-primary-600">{c.follow_up_date || '—'}</p>
          </div>
        </div>

        {c.notes && (
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Notes</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{c.notes}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="font-bold text-lg dark:text-white mb-4">Interested Plots</h2>
        {(data.interested_plots || []).length === 0 ? (
          <p className="text-sm text-slate-500">No linked plots</p>
        ) : (
          <div className="space-y-2">
            {data.interested_plots.map((p) => (
              <Link key={p.id} to={`/plots/${p.id}`} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="font-semibold text-slate-800 dark:text-white">{p.name}</span>
                <span className="text-sm text-primary-600">{formatPrice(p.price)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2"><Calendar className="h-5 w-5" /> Site Visits</h2>
        {(data.site_visits || []).length === 0 ? (
          <p className="text-sm text-slate-500">No visits recorded</p>
        ) : (
          <div className="space-y-2">
            {data.site_visits.map((v) => (
              <div key={v.id} className="rounded-lg border border-slate-100 dark:border-slate-800 p-3 text-sm">
                <p className="font-semibold dark:text-white">{v.visit_date} {v.visit_time} — {v.status}</p>
                <p className="text-slate-500">{v.plot_name || 'General visit'}</p>
              </div>
            ))}
          </div>
        )}
        <Link to="/site-visits" className="mt-3 inline-block text-sm font-bold text-primary-600">Schedule a visit →</Link>
      </div>
    </div>
  );
};

export default CustomerDetail;

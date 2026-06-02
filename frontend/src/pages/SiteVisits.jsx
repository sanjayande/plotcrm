import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, X, Pencil, Trash2 } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const inputCls = 'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm dark:text-white focus:border-primary-500 focus:outline-none';

const SiteVisits = () => {
  const [visits, setVisits] = useState([]);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [v, p] = await Promise.all([
        axios.get('/api/site-visits'),
        axios.get('/api/plots'),
      ]);
      setVisits(v.data);
      setPlots(p.data);
    } catch {
      toast.error('Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const VisitModal = ({ visit, onClose }) => {
    const [form, setForm] = useState({
      customer_name: visit?.customer_name || '',
      phone_number: visit?.phone_number || '',
      plot_id: visit?.plot_id || '',
      visit_date: visit?.visit_date || '',
      visit_time: visit?.visit_time || '',
      notes: visit?.notes || '',
      status: visit?.status || 'Scheduled',
    });
    const [saving, setSaving] = useState(false);

    const submit = async (e) => {
      e.preventDefault();
      setSaving(true);
      const payload = { ...form, plot_id: form.plot_id ? parseInt(form.plot_id, 10) : null };
      try {
        if (visit?.id) {
          await axios.put(`/api/site-visits/${visit.id}`, payload);
          toast.success('Visit updated');
        } else {
          await axios.post('/api/site-visits', payload);
          toast.success('Visit scheduled');
        }
        onClose();
        fetchAll();
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Save failed');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-5 border-b dark:border-slate-800">
            <h3 className="font-bold text-lg dark:text-white">{visit ? 'Edit Visit' : 'Schedule Visit'}</h3>
            <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
          </div>
          <form onSubmit={submit} className="p-5 space-y-3">
            <input required placeholder="Customer name" className={inputCls} value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            <input required placeholder="Phone" className={inputCls} value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            <select className={inputCls} value={form.plot_id} onChange={(e) => setForm({ ...form, plot_id: e.target.value })}>
              <option value="">Select plot (optional)</option>
              {plots.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input required type="date" className={inputCls} value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} />
            <input placeholder="Time e.g. 10:30 AM" className={inputCls} value={form.visit_time} onChange={(e) => setForm({ ...form, visit_time: e.target.value })} />
            <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <textarea placeholder="Notes" rows={2} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-primary-600 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Visit'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const cancelVisit = async (id) => {
    if (!confirm('Cancel this visit?')) return;
    try {
      await axios.delete(`/api/site-visits/${id}`);
      toast.success('Visit cancelled');
      fetchAll();
    } catch {
      toast.error('Failed to cancel');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <AppHeader title="Site Visit Scheduler" subtitle="Manage property site visits and reminders" />
      <div className="flex justify-end">
        <button onClick={() => setModal({})} className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700">
          <Plus className="h-4 w-4" /> Schedule Visit
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : visits.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-16 text-center">
          <Calendar className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-500">No visits scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <div key={v.id} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{v.customer_name}</p>
                <p className="text-sm text-slate-500">{v.phone_number} · {v.plot_name || 'No plot'}</p>
                <p className="text-xs font-semibold text-primary-600 mt-1">
                  {v.visit_date} {v.visit_time} · {v.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModal(v)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" /></button>
                {v.status === 'Scheduled' && (
                  <button onClick={() => cancelVisit(v.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && <VisitModal visit={modal.id ? modal : null} onClose={() => setModal(null)} />}
    </div>
  );
};

export default SiteVisits;

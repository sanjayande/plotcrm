import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  Plus, Search, X, Pencil, Trash2, Phone, Calendar,
  MapPin, Users as UsersIcon, Clock, AlertCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import AppHeader from '../components/AppHeader';
import LeadPriorityBadge from '../components/LeadPriorityBadge';
import { formatPrice, toTitleCase } from '../utils/format';

const LEAD_OPTIONS = ['Hot Lead', 'Warm Lead', 'Cold Lead'];

const formatBudget = formatPrice;

const isFollowUpOverdue = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

const isFollowUpToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr).toDateString();
  return d === new Date().toDateString();
};

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 transition-shadow';

const CustomerModal = ({ customer, onClose, onSaved }) => {
  const isEdit = !!customer?.id;
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone_number: customer?.phone_number || '',
    interested_location: customer?.interested_location || '',
    budget: customer?.budget || '',
    notes: customer?.notes || '',
    follow_up_date: customer?.follow_up_date || '',
    lead_priority: customer?.lead_priority || 'Warm Lead',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone_number) {
      toast.error('Name and phone are required');
      return;
    }
    const payload = {
      ...form,
      name: toTitleCase(form.name.trim()),
      interested_location: form.interested_location
        ? toTitleCase(form.interested_location.trim())
        : null,
      budget: form.budget ? parseFloat(form.budget) : null,
      follow_up_date: form.follow_up_date || null,
    };
    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(`/api/customers/${customer.id}`, payload);
        toast.success('Customer updated!');
      } else {
        await axios.post('/api/customers', payload);
        toast.success('Customer added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
            {isEdit ? 'Edit Customer' : 'Add Customer'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 sm:px-6 py-5 space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g., Rajesh Kumar" className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Phone *</label>
            <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="+91 98765 43210" className={inputCls} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Interested Location</label>
            <input name="interested_location" value={form.interested_location} onChange={handleChange} placeholder="e.g., Hyderabad" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Budget (₹)</label>
            <input name="budget" type="number" value={form.budget} onChange={handleChange} placeholder="e.g., 3000000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Lead Priority</label>
            <select name="lead_priority" value={form.lead_priority} onChange={handleChange} className={inputCls}>
              {LEAD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Follow-Up Date</label>
            <input name="follow_up_date" type="date" value={form.follow_up_date} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Preferences, visit history, requirements..." className={`${inputCls} resize-none`} />
          </div>
        </form>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} disabled={loading} className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50">
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (isEdit ? 'Save Changes' : 'Add Customer')}
          </button>
        </div>
      </div>
    </div>
  );
};

const FollowUpBadge = ({ dateStr }) => {
  if (!dateStr) return <span className="text-slate-400 dark:text-slate-600">—</span>;
  const formatted = new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  if (isFollowUpOverdue(dateStr)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
        <AlertCircle className="h-3.5 w-3.5" /> {formatted}
      </span>
    );
  }
  if (isFollowUpToday(dateStr)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
        <Clock className="h-3.5 w-3.5" /> Today
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400">
      <Calendar className="h-3.5 w-3.5" /> {formatted}
    </span>
  );
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const res = await axios.get('/api/customers', { params });
      setCustomers(res.data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this customer from your CRM?')) return;
    try {
      await axios.delete(`/api/customers/${id}`);
      toast.success('Customer removed');
      fetchCustomers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <AppHeader
        title="Customer CRM"
        subtitle={`${customers.length} lead${customers.length !== 1 ? 's' : ''} — track budget, priority, and follow-ups`}
      />
      <div className="flex justify-end -mt-2">
        <button
          onClick={() => { setEditingCustomer(null); setModalOpen(true); }}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Add Customer
        </button>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, location, notes..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 px-4 text-center">
          <UsersIcon className="h-12 w-12 text-slate-300 dark:text-slate-700" />
          <p className="mt-4 text-lg font-bold text-slate-500">No Customers Yet</p>
          <p className="mt-1 text-sm text-slate-400 max-w-sm">
            {search ? 'Try a different search' : 'Add leads with budget, location, and follow-up dates'}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    {['Name', 'Phone', 'Interested Location', 'Budget', 'Follow-Up', 'Notes', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-5 py-4">
                        <Link to={`/customers/${c.id}`} className="font-bold text-slate-800 dark:text-white hover:text-primary-600">{c.name}</Link>
                        <div className="mt-1"><LeadPriorityBadge priority={c.lead_priority} /></div>
                      </td>
                      <td className="px-5 py-4">
                        <a href={`tel:${c.phone_number}`} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600">
                          <Phone className="h-3.5 w-3.5" /> {c.phone_number}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                        {c.interested_location ? (
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{c.interested_location}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4 font-semibold">{formatBudget(c.budget)}</td>
                      <td className="px-5 py-4"><FollowUpBadge dateStr={c.follow_up_date} /></td>
                      <td className="px-5 py-4 max-w-[180px] truncate text-slate-500 text-xs">{c.notes || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditingCustomer(c); setModalOpen(true); }} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {customers.map((c) => (
              <div key={c.id} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/customers/${c.id}`} className="font-bold text-slate-800 dark:text-white hover:text-primary-600 truncate block">{c.name}</Link>
                    <LeadPriorityBadge priority={c.lead_priority} />
                    <a href={`tel:${c.phone_number}`} className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {c.phone_number}
                    </a>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditingCustomer(c); setModalOpen(true); }} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400">Location</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{c.interested_location || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Budget</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{formatBudget(c.budget)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400 mb-0.5">Follow-Up</p>
                    <FollowUpBadge dateStr={c.follow_up_date} />
                  </div>
                </div>
                {c.notes && <p className="mt-3 text-xs text-slate-500 line-clamp-3 border-t border-slate-100 dark:border-slate-800 pt-3">{c.notes}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => setModalOpen(false)}
          onSaved={fetchCustomers}
        />
      )}
    </div>
  );
};

export default Customers;

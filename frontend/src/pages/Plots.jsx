import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Search, MapPin, Filter, X, Eye, Pencil, Trash2,
  Sparkles, MessageCircle, Upload, Image as ImageIcon, GitCompare,
} from 'lucide-react';
import PlotCompareModal from '../components/PlotCompareModal';
import BrochureButton from '../components/BrochureButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { CardSkeleton } from '../components/Skeleton';
import AISearchBar from '../components/AISearchBar';
import AppHeader from '../components/AppHeader';
import WhatsAppShareModal from '../components/WhatsAppShareModal';
import { formatPrice, statusBadgeClass, parseImageList, uploadImageUrl, toTitleCase } from '../utils/format';

const FACING_OPTIONS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];
const STATUS_OPTIONS = ['Available', 'Reserved', 'Sold'];

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 transition-shadow';

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────
const PlotModal = ({ plot, onClose, onSaved }) => {
  const { user } = useAuth();
  const isEdit = !!plot?.id;
  const [form, setForm] = useState({
    name: plot?.name || '',
    location: plot?.location || '',
    price: plot?.price || '',
    sq_yards: plot?.sq_yards || '',
    facing: plot?.facing || 'East',
    amenities: plot?.amenities || '',
    description: plot?.description || '',
    google_maps_link: plot?.google_maps_link || '',
    status: plot?.status || 'Available',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState(
    plot?.images ? parseImageList(plot.images) : []
  );

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...urls]);
    e.target.value = '';
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToPlot = async (plotId) => {
    if (!imageFiles.length) return;
    const formData = new FormData();
    imageFiles.forEach((f) => formData.append('files', f));
    await axios.post(`/api/plots/${plotId}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  const handleGenerateAI = async () => {
    if (!form.name || !form.location || !form.price || !form.sq_yards) {
      toast.error('Fill in name, location, price, and size before generating');
      return;
    }
    setAiLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        sq_yards: parseFloat(form.sq_yards),
      };
      const res = isEdit
        ? await axios.post(`/api/plots/${plot.id}/generate-ai-description`)
        : await axios.post('/api/plots/preview/generate-ai-description', payload);
      const desc = res.data.description;
      setForm((f) => ({ ...f, description: desc }));
      toast.success('AI description generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate description');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.price || !form.sq_yards) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        name: toTitleCase(form.name.trim()),
        location: toTitleCase(form.location.trim()),
        price: parseFloat(form.price),
        sq_yards: parseFloat(form.sq_yards),
      };
      let savedId = plot?.id;
      if (isEdit) {
        await axios.put(`/api/plots/${plot.id}`, payload);
        toast.success('Plot updated successfully!');
      } else {
        const res = await axios.post('/api/plots', payload);
        savedId = res.data.id;
        toast.success('Plot added successfully!');
      }
      if (imageFiles.length && savedId) {
        await uploadImagesToPlot(savedId);
        toast.success(`${imageFiles.length} image(s) uploaded`);
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save plot');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => previewUrls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full max-w-2xl rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">
            {isEdit ? 'Edit Plot' : 'Add New Plot'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 sm:px-6 py-5 space-y-5 flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Plot Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g., Green Valley Plot 12" className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Location *</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g., Hyderabad, Telangana" className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Price (₹) *</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g., 2500000" className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Size (Sq Yards) *</label>
              <input name="sq_yards" type="number" value={form.sq_yards} onChange={handleChange} placeholder="e.g., 200" className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Facing</label>
              <select name="facing" value={form.facing} onChange={handleChange} className={inputCls}>
                {FACING_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Amenities (Comma-Separated)</label>
            <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="e.g., Water, Power, Gated, Tar Road" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Google Maps Link</label>
            <input name="google_maps_link" value={form.google_maps_link} onChange={handleChange} placeholder="https://maps.google.com/..." className={inputCls} />
          </div>

          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all"
              >
                {aiLoading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Generate AI Description
              </button>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Professional plot description (or use AI generator)..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Multiple image upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Plot Images
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-colors">
              <Upload className="h-4 w-4" />
              Choose Images (JPG, PNG, WEBP)
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
            </label>

            {(existingImages.length > 0 || previewUrls.length > 0) && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {existingImages.map((img, i) => (
                  <div key={`ex-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={uploadImageUrl(img)} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 text-[9px] font-bold text-white">Saved</span>
                  </div>
                ))}
                {previewUrls.map((url, i) => (
                  <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-primary-200 dark:border-primary-800">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 rounded-full bg-rose-500 p-0.5 text-white hover:bg-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 rounded bg-primary-600/80 px-1.5 text-[9px] font-bold text-white">New</span>
                  </div>
                ))}
              </div>
            )}
            {!existingImages.length && !previewUrls.length && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <ImageIcon className="h-3.5 w-3.5" /> Upload multiple images; they save when you submit the plot.
              </p>
            )}
          </div>
        </form>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-md shadow-primary-500/10"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              isEdit ? 'Save Changes' : 'Add Plot'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Plots Page ──────────────────────────────────────────────────────────
const Plots = () => {
  const { user } = useAuth();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFacing, setFilterFacing] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [whatsAppPlot, setWhatsAppPlot] = useState(null);

  const fetchPlots = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterFacing) params.facing = filterFacing;
      const res = await axios.get('/api/plots', { params });
      setPlots(res.data);
    } catch {
      toast.error('Failed to load plots');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterFacing]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plot?')) return;
    try {
      await axios.delete(`/api/plots/${id}`);
      toast.success('Plot deleted');
      fetchPlots();
    } catch {
      toast.error('Failed to delete plot');
    }
  };

  const handleWhatsAppShare = (plot) => {
    setWhatsAppPlot(plot);
    setWhatsAppOpen(true);
  };

  const handleAdd = () => {
    setEditingPlot(null);
    setModalOpen(true);
  };
  const handleEdit = (plot) => {
    setEditingPlot(plot);
    setModalOpen(true);
  };

  const getPlotThumbnail = (plot) => {
    const imgs = parseImageList(plot.images);
    return imgs.length ? uploadImageUrl(imgs[0]) : null;
  };

  const handleAiResults = (results) => {
    setPlots(results);
    setAiSearchActive(true);
  };

  const clearAiSearch = () => {
    setAiSearchActive(false);
    fetchPlots();
  };

  return (
    <div className="space-y-6 pb-8">
      <AppHeader
        title="Plot Listings"
        subtitle={`${plots.length} plot${plots.length !== 1 ? 's' : ''} in your inventory`}
      />
      <AISearchBar onResults={handleAiResults} />
      {aiSearchActive && (
        <button onClick={clearAiSearch} className="text-sm font-bold text-violet-600 hover:text-violet-500">
          ← Clear AI search and show all plots
        </button>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {plots.length >= 2 && (
          <button
            onClick={() => setCompareOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <GitCompare className="h-4 w-4" /> Compare Plots
          </button>
        )}
        <button
          onClick={handleAdd}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/15 hover:bg-primary-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Add Plot
        </button>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, location, amenities..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
              showFilters
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="h-4 w-4" /> Filters
            {(filterStatus || filterFacing) && (
              <span className="h-2 w-2 rounded-full bg-primary-600" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 min-w-[140px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filterFacing}
              onChange={(e) => setFilterFacing(e.target.value)}
              className="flex-1 min-w-[140px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary-500"
            >
              <option value="">All Facings</option>
              {FACING_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            {(filterStatus || filterFacing) && (
              <button
                onClick={() => { setFilterStatus(''); setFilterFacing(''); }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : plots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 px-4">
          <MapPin className="h-12 w-12 text-slate-300 dark:text-slate-700" />
          <p className="mt-4 text-lg font-bold text-slate-500 dark:text-slate-400">No Plots Found</p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 max-w-sm">
            {search || filterStatus || filterFacing
              ? 'Try adjusting your search or filters'
              : 'Add your first plot to get started'}
          </p>
          {!search && !filterStatus && !filterFacing && (
            <button
              onClick={handleAdd}
              className="mt-5 flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" /> Add First Plot
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {plots.map((plot) => {
            const thumb = getPlotThumbnail(plot);
            return (
              <div
                key={plot.id}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
              >
                {thumb ? (
                  <div className="relative h-40 sm:h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={thumb} alt={plot.name} className="h-full w-full object-cover" loading="lazy" />
                    <span className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadgeClass(plot.status)}`}>
                      {plot.status}
                    </span>
                  </div>
                ) : (
                  <div className="relative h-24 bg-gradient-to-br from-primary-50 to-slate-100 dark:from-primary-950/30 dark:to-slate-800 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary-300 dark:text-primary-700" />
                    <span className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadgeClass(plot.status)}`}>
                      {plot.status}
                    </span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  {!thumb && (
                    <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-bold mb-2 ${statusBadgeClass(plot.status)}`}>
                      {plot.status}
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-snug line-clamp-2">
                      {plot.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono shrink-0">#{plot.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{plot.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-auto">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Price</p>
                      <p className="font-bold text-primary-700 dark:text-primary-400">{formatPrice(plot.price)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Size</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{plot.sq_yards} Sq Yd</p>
                    </div>
                  </div>
                  {plot.facing && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">{plot.facing}</span> Facing
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                  <Link
                    to={`/plots/${plot.id}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500"
                  >
                    <Eye className="h-4 w-4" /> View Details
                  </Link>
                  <div className="flex items-center gap-1">
                    <BrochureButton plotId={plot.id} plotName={plot.name} variant="card" />
                    <button
                      onClick={() => handleWhatsAppShare(plot)}
                      className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(plot)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plot.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <PlotModal
          plot={editingPlot}
          onClose={() => setModalOpen(false)}
          onSaved={fetchPlots}
        />
      )}

      {compareOpen && (
        <PlotCompareModal plots={plots} onClose={() => setCompareOpen(false)} />
      )}

      {whatsAppOpen && (
        <WhatsAppShareModal
          plot={whatsAppPlot}
          agent={user}
          onClose={() => {
            setWhatsAppOpen(false);
            setWhatsAppPlot(null);
          }}
        />
      )}
    </div>
  );
};

export default Plots;

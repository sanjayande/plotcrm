import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, MapPin, Compass, Ruler, IndianRupee, Upload,
  Sparkles, MessageCircle, Copy, CheckCircle, ExternalLink,
  Image as ImageIcon, Share2, FileDown, QrCode,
} from 'lucide-react';
import { downloadQr } from '../services/api';
import BrochureButton from '../components/BrochureButton';
import { API_BASE } from '../utils/format';
import { buildWhatsAppMessage, openWhatsApp, WHATSAPP_TEMPLATES, buildTemplateMessage } from '../utils/whatsapp';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageGallery from '../components/ImageGallery';
import MapsPanel from '../components/MapsPanel';
import WhatsAppShareModal from '../components/WhatsAppShareModal';
import {
  formatPriceLong, parseImageList, statusBadgeClass, toTitleCase,
} from '../utils/format';
const PlotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [whatsAppTemplate, setWhatsAppTemplate] = useState('new_plot');

  const fetchPlot = async () => {
    try {
      const res = await axios.get(`/api/plots/${id}`);
      setPlot(res.data);
      if (res.data.description) setAiDescription(res.data.description);
    } catch {
      toast.error('Plot not found');
      navigate('/plots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPlot();
  }, [id]);

  useEffect(() => {
    if (plot?.id) {
      axios.get(`/api/plots/${plot.id}/qr`, { responseType: 'blob' }).catch(() => {});
    }
  }, [plot?.id]);

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post(`/api/plots/${id}/generate-ai-description`);
      setAiDescription(res.data.description);
      setPlot((p) => ({ ...p, description: res.data.description }));
      toast.success('AI description generated and saved!');
    } catch {
      toast.error('Failed to generate description');
    } finally {
      setAiLoading(false);
    }
  };

  const handleWhatsAppShare = (templateId = 'new_plot') => {
    setWhatsAppTemplate(templateId);
    setWhatsAppOpen(true);
  };

  const handleQrDownload = async () => {
    try {
      await downloadQr(plot.id);
      toast.success('QR code downloaded');
    } catch {
      toast.error('QR download failed');
    }
  };

  const handleCopyDescription = async () => {
    const text = plot.description || aiDescription;
    if (!text) {
      toast.error('No description to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyPlotLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Plot link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleOpenPlotPage = () => {
    window.open(window.location.href, '_blank');
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    setUploading(true);
    try {
      await axios.post(`/api/plots/${id}/upload-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`${files.length} image(s) uploaded!`);
      fetchPlot();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!plot) return null;

  const images = parseImageList(plot.images);
  const amenities = plot.amenities
    ? plot.amenities.split(',').map((a) => a.trim()).filter(Boolean)
    : [];
  const displayDescription = plot.description || aiDescription;

  return (
    <div className="space-y-6 pb-10">
      <button
        onClick={() => navigate('/plots')}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Plots
      </button>

      {/* Hero card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-5 py-6 sm:px-8 sm:py-8 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-200">
                Plot #{plot.id}
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight break-words">
                {plot.name}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-primary-100">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-sm sm:text-base">{plot.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(plot.status)}`}>
                {plot.status}
              </span>
              <BrochureButton plotId={plot.id} plotName={plot.name} variant="hero" showPreview />
              <button onClick={handleQrDownload} className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-bold text-white hover:bg-white/30">
                <QrCode className="h-4 w-4" /> QR
              </button>
              <button onClick={() => handleWhatsAppShare()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600">
                <MessageCircle className="h-4 w-4" /> {t('shareWhatsApp')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4 sm:gap-4 sm:p-6">
          {[
            { icon: IndianRupee, label: 'Price', value: formatPriceLong(plot.price), color: 'text-primary-600 dark:text-primary-400' },
            { icon: Ruler, label: 'Size', value: `${plot.sq_yards} Sq Yd`, color: 'text-indigo-500' },
            { icon: Compass, label: 'Facing', value: plot.facing, color: 'text-amber-500' },
            {
              icon: IndianRupee,
              label: 'Per Sq Yd',
              value: formatPriceLong(plot.price / (plot.sq_yards || 1)),
              color: 'text-emerald-500',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
              <Icon className={`mx-auto h-5 w-5 ${color}`} />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Image gallery */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Photo Gallery
            {images.length > 0 && (
              <span className="text-sm font-normal text-slate-500">({images.length})</span>
            )}
          </h2>
          <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 cursor-pointer transition-colors shadow-md shadow-primary-500/10 w-full sm:w-auto">
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Images
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <ImageGallery images={images} altPrefix={plot.name} />
      </div>

      {/* Description, amenities, maps */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-6">
        {amenities.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a, i) => (
                <span
                  key={i}
                  className="rounded-full bg-primary-50 dark:bg-primary-950/30 px-3 py-1.5 text-xs font-bold text-primary-700 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/30"
                >
                  {toTitleCase(a)}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Full Description
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-2 text-xs font-bold text-white hover:from-violet-700 hover:to-purple-700 disabled:opacity-50"
              >
                {aiLoading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Regenerate with AI
              </button>
              {displayDescription && (
                <button
                  onClick={handleCopyDescription}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          </div>
          {displayDescription ? (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
              {displayDescription}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No description yet. Use &quot;Regenerate with AI&quot; or edit the plot to add one.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
            Location & Nearby
          </h2>
          <MapsPanel mapsLink={plot.google_maps_link} location={plot.location} plotName={plot.name} />
        </section>

        <section className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">WhatsApp Automation</h2>
          <p className="text-xs text-slate-500 mb-3">Share instantly or copy message to clipboard.</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {WHATSAPP_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleWhatsAppShare(tmpl.id)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </section>

        <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/60 dark:bg-slate-900/30 p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center shrink-0">
              <img
                src={`${API_BASE}/static/qr/plot_${plot.id}.png`}
                alt="Plot Details QR Passport"
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg bg-white"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`;
                }}
              />
            </div>
            <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
              <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                Digital Property QR Passport
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                This secure QR code points directly to the digital plot listing. Print this code on yard banners, brochures, or local pamphlets so prospective buyers can instantly scan and explore vastu directions, maps, and amenities.
              </p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                <button
                  onClick={handleQrDownload}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <FileDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  Download Plot QR Code
                </button>
                <button
                  onClick={handleCopyPlotLink}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  Copy Plot Link
                </button>
                <button
                  onClick={handleOpenPlotPage}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  Open Plot Page
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {whatsAppOpen && (
        <WhatsAppShareModal
          plot={plot}
          agent={user}
          initialTemplate={whatsAppTemplate}
          onClose={() => {
            setWhatsAppOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PlotDetail;

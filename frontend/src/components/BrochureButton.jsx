import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileDown, Eye, X } from 'lucide-react';
import { generateBrochure } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

/**
 * Reusable brochure download control for plot cards and detail pages.
 * variant: 'card' | 'outline' | 'hero'
 */
const BrochureButton = ({
  plotId,
  plotName,
  variant = 'card',
  showPreview = false,
  className = '',
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const handleInitialClick = () => {
    if (!plotId) return;
    setQrUrl(`/api/plots/${plotId}/qr`);
    setShowQrModal(true);
  };

  const handleGenerate = async () => {
    if (!plotId) return;
    setLoading(true);
    const toastId = `brochure-${plotId}`;
    toast.loading('Generating brochure…', { id: toastId });
    try {
      const blob = await generateBrochure(plotId);
      const url = window.URL.createObjectURL(blob);
      const safeName = (plotName || 'plot').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = `PlotCRM_${safeName}.pdf`;
      a.click();
      toast.success('Brochure downloaded', { id: toastId });
      if (showPreview) {
        setPreviewUrl(url);
      } else {
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      let msg = 'Brochure generation failed';
      const data = err.response?.data;
      if (data instanceof Blob) {
        try {
          const parsed = JSON.parse(await data.text());
          msg = parsed.detail || msg;
        } catch {
          /* keep default */
        }
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      toast.error(typeof msg === 'string' ? msg : 'Brochure generation failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) window.URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const base =
    variant === 'hero'
      ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-bold text-white hover:bg-white/30 transition-colors disabled:opacity-60'
      : variant === 'outline'
        ? 'inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/30 px-3 py-2 text-xs font-bold text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-950/50 transition-all disabled:opacity-60'
        : 'inline-flex items-center justify-center gap-1.5 rounded-lg p-1.5 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors disabled:opacity-60';

  const label = t('generateBrochure');

  return (
    <>
      <button
        type="button"
        onClick={handleInitialClick}
        disabled={loading}
        title={t('generateBrochure')}
        className={`${base} ${className}`}
        aria-busy={loading}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <FileDown className="h-4 w-4 shrink-0" />
        )}
        {variant !== 'card' && <span>{label}</span>}
      </button>

      {previewUrl && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="relative w-full max-w-3xl rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary-600" /> Brochure Preview
              </h3>
              <button
                type="button"
                onClick={closePreview}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe
              title="Brochure preview"
              src={previewUrl}
              className="w-full flex-1 min-h-[60vh] rounded-b-2xl bg-slate-100"
            />
          </div>
        </div>
      )}

      {showQrModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 flex flex-col items-center border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Brochure QR Code</h3>
            <p className="text-sm text-slate-500 text-center mb-4">This QR code will be included in your brochure. It points to the dynamic frontend URL.</p>
            <div className="bg-white p-2 rounded-xl mb-6 shadow-sm border border-slate-100">
              <img src={qrUrl} alt="QR Preview" className="w-48 h-48 rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setShowQrModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              <button onClick={() => { setShowQrModal(false); handleGenerate(); }} className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-colors">Generate PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BrochureButton;

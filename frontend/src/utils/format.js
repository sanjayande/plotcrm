export const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const uploadImageUrl = (filename) =>
  `${API_BASE}/static/uploads/${String(filename).trim()}`;

export const formatPrice = (price) => {
  if (!price && price !== 0) return '—';
  const val = parseFloat(price);
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

export const formatPriceLong = (price) => {
  if (!price && price !== 0) return '—';
  const val = parseFloat(price);
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Crore`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
  return `₹${val.toLocaleString('en-IN')}`;
};

/** Title-case each word; preserves common abbreviations */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const parseImageList = (images) =>
  images ? images.split(',').map((s) => s.trim()).filter(Boolean) : [];

export const statusBadgeClass = (status) => {
  const map = {
    Available:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30',
    Reserved:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30',
    Sold:
      'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30',
  };
  return map[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

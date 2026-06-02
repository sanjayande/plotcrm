import axios from 'axios';
import { API_BASE } from '../utils/format';

export const downloadBlob = async (url, filename) => {
  const res = await axios.get(url, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
};

/** POST — generates brochure PDF and returns blob for download/preview. */
export const generateBrochure = async (plotId) => {
  const res = await axios.post(`/api/brochure/generate/${plotId}`, null, {
    responseType: 'blob',
  });
  return res.data;
};

/** Legacy GET download (kept for compatibility). */
export const downloadBrochure = (plotId, plotName) =>
  downloadBlob(`${API_BASE}/api/plots/${plotId}/brochure`, `PlotCRM_${plotName}.pdf`);

export const downloadQr = (plotId) =>
  downloadBlob(`${API_BASE}/api/plots/${plotId}/qr`, `plot_${plotId}_qr.png`);

export const aiSearch = (query, language = 'en') =>
  axios.post('/api/search/ai', { query, language });

export const getSearchSuggestions = () => axios.get('/api/search/suggestions');

export const getNotifications = () => axios.get('/api/notifications');

export const getAnalytics = () => axios.get('/api/analytics');

export const getCustomerDetail = (id) => axios.get(`/api/customers/${id}/detail`);

export const suggestLeadPriority = (id) => axios.post(`/api/customers/${id}/suggest-priority`);

export const sendChatMessage = (message, history = []) =>
  axios.post('/api/chat', { message, history });

export const comparePlots = (plotIds) =>
  axios.post('/api/plots/compare', { plot_ids: plotIds });

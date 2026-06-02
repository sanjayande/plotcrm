import { formatPriceLong } from './format';

/**
 * Build a formatted WhatsApp sales message for a plot listing.
 */
export const buildWhatsAppMessage = (plot, agent = {}) => {
  const price = formatPriceLong(plot.price);
  const agentName = agent.full_name || 'Your Agent';
  const agentPhone = agent.phone_number || '';
  const amenityLine = plot.amenities
    ? `🔹 *Amenities:* ${plot.amenities}\n`
    : '';
  const mapsLine = plot.google_maps_link
    ? `🗺️ *Location:* ${plot.google_maps_link}\n`
    : '';
  const descSnippet = plot.description
    ? `\n📝 ${plot.description.slice(0, 120)}${plot.description.length > 120 ? '…' : ''}\n`
    : '';

  return (
    `🏡 *PRIME PLOT FOR SALE — ${plot.name}*\n\n` +
    `Looking for the perfect plot in *${plot.location}*? Here are the details:\n\n` +
    `📍 *Location:* ${plot.location}\n` +
    `📐 *Plot Size:* ${plot.sq_yards} Sq Yards\n` +
    `🧭 *Facing:* ${plot.facing}\n` +
    `💰 *Price:* ${price}\n` +
    `📊 *Status:* ${plot.status || 'Available'}\n` +
    amenityLine +
    mapsLine +
    descSnippet +
    `\n✅ Clear titles & immediate registration available.\n\n` +
    `📞 *Interested?* Contact for a site visit:\n` +
    `👤 *${agentName}*\n` +
    (agentPhone ? `📱 ${agentPhone}\n` : '') +
    `\n_Message sent via PlotCRM_`
  );
};

/** Open WhatsApp with pre-filled message (optionally to a specific number). */
const TEMPLATE_BUILDERS = {
  new_plot: (plot, agent) => buildWhatsAppMessage(plot, agent),
  price_reduced: (plot, agent) => {
    const price = formatPriceLong(plot.price);
    return `🔥 *PRICE UPDATE — ${plot.name}*\n\nGreat news! This prime plot in *${plot.location}* is now available at *${price}*.\n\n📐 ${plot.sq_yards} Sq Yards | 🧭 ${plot.facing}\n\nBook a site visit today!\n👤 ${agent.full_name || 'Agent'}\n📱 ${agent.phone_number || ''}`;
  },
  investment: (plot, agent) => {
    const price = formatPriceLong(plot.price);
    return `📈 *INVESTMENT OPPORTUNITY*\n\nHigh-growth plot in *${plot.location}* — ${plot.sq_yards} Sq Yards at *${price}*.\n\nIdeal for long-term appreciation & dream home construction.\n\nContact: ${agent.full_name || 'Agent'} | ${agent.phone_number || ''}`;
  },
  follow_up: (plot, agent, extra = {}) => {
    const name = extra.customerName || 'Sir/Madam';
    return `🙏 Hi ${name},\n\nFollowing up on the *${plot.name}* plot in *${plot.location}* we discussed.\n\nWould you like to schedule a site visit this week?\n\n— ${agent.full_name || 'Your Plot Agent'}`;
  },
};

export const WHATSAPP_TEMPLATES = [
  { id: 'new_plot', label: 'New Plot' },
  { id: 'price_reduced', label: 'Price Reduced' },
  { id: 'investment', label: 'Investment Opportunity' },
  { id: 'follow_up', label: 'Follow-Up Reminder' },
];

export const buildTemplateMessage = (templateId, plot, agent, extra = {}) => {
  const fn = TEMPLATE_BUILDERS[templateId] || TEMPLATE_BUILDERS.new_plot;
  return fn(plot, agent, extra);
};

export const openWhatsApp = (message, phone = '') => {
  const encoded = encodeURIComponent(message);
  const digits = phone ? phone.replace(/\D/g, '') : '';
  const url = digits
    ? `https://wa.me/${digits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Copy, Check, Send, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { WHATSAPP_TEMPLATES, buildTemplateMessage, openWhatsApp } from '../utils/whatsapp';

const WhatsAppShareModal = ({ plot, agent, onClose, initialTemplate = 'new_plot' }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const [customerName, setCustomerName] = useState('');

  // Update generated message when template, customerName, or plot changes
  useEffect(() => {
    if (plot) {
      const extra = { customerName: customerName || undefined };
      const generated = buildTemplateMessage(selectedTemplate, plot, agent, extra);
      setMessageText(generated);
    }
  }, [selectedTemplate, plot, agent, customerName]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      toast.success('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy message');
    }
  };

  const handleShare = () => {
    openWhatsApp(messageText);
    toast.success('Opening WhatsApp...');
  };

  if (!plot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity duration-300">
      {/* Backdrop click closes modal */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col transform transition-transform duration-300 scale-100 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">WhatsApp Sales Automation</h3>
              <p className="text-xs text-emerald-100 font-medium">Select a template, customize & share instantly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-white/20 text-white/95 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* Template Selectors */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              1. Choose Broadcast Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WHATSAPP_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all duration-200 ${
                    selectedTemplate === tmpl.id
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional field for follow up template */}
          {selectedTemplate === 'follow_up' && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Client Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Sanjay Kumar"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          )}

          {/* Message Preview and Editor */}
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                2. Live Message Editor <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
              </label>
              <span className="text-[10px] text-slate-400 font-semibold italic">Editable text</span>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={8}
              placeholder="Your generated message will appear here..."
              className="w-full flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none font-sans shadow-inner min-h-[160px]"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-200"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-500" />
                <span>Copy Message</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/10 active:scale-[0.98] transition-all duration-200"
          >
            <Send className="h-4 w-4" />
            <span>Open WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppShareModal;

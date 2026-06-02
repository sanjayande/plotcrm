import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard',
    plots: 'Plots',
    customers: 'Customer CRM',
    siteVisits: 'Site Visits',
    analytics: 'Analytics',
    aiSearch: 'Ask AI: e.g. East-facing plots under 40 lakhs…',
    generateAI: 'Generate AI Description',
    shareWhatsApp: 'Share on WhatsApp',
    generateBrochure: 'Generate Brochure',
    hotLead: 'Hot Lead',
    warmLead: 'Warm Lead',
    coldLead: 'Cold Lead',
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్',
    plots: 'ప్లాట్లు',
    customers: 'కస్టమర్ CRM',
    siteVisits: 'సైట్ సందర్శనలు',
    analytics: 'విశ్లేషణ',
    aiSearch: 'AI అడగండి: ఉదా. 40 లక్షలలోపు తూర్పు ఫేసింగ్ ప్లాట్లు…',
    generateAI: 'AI వివరణ సృష్టించు',
    shareWhatsApp: 'WhatsApp లో షేర్ చేయండి',
    generateBrochure: 'బ్రోచర్ సృష్టించు',
    hotLead: 'హాట్ లీడ్',
    warmLead: 'వార్మ్ లీడ్',
    coldLead: 'కోల్డ్ లీడ్',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    plots: 'प्लॉट',
    customers: 'ग्राहक CRM',
    siteVisits: 'साइट विज़िट',
    analytics: 'एनालिटिक्स',
    aiSearch: 'AI से पूछें: जैसे 40 लाख से कम पूर्व-facing प्लॉट…',
    generateAI: 'AI विवरण बनाएं',
    shareWhatsApp: 'WhatsApp पर शेयर करें',
    generateBrochure: 'ब्रोशर बनाएं',
    hotLead: 'हॉट लीड',
    warmLead: 'वार्म लीड',
    coldLead: 'कोल्ड लीड',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('plotcrm_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('plotcrm_lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;

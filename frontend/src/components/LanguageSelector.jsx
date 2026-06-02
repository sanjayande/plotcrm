import { useLanguage } from '../context/LanguageContext';

const langs = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिंदी' },
];

const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-primary-500 focus:outline-none"
      aria-label="Language"
    >
      {langs.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
};

export default LanguageSelector;

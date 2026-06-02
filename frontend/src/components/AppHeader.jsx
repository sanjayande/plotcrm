import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';

const AppHeader = ({ title, subtitle }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      {title && <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">{title}</h1>}
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <LanguageSelector />
      <NotificationBell />
    </div>
  </div>
);

export default AppHeader;

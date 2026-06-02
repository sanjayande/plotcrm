import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getNotifications } from '../services/api';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const load = async () => {
    try {
      const res = await getNotifications();
      setItems(res.data.notifications || []);
      setCount(res.data.unread_count || 0);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) load(); }}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
              <p className="text-sm font-bold text-slate-800 dark:text-white">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications</p>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.id}
                    to={n.link || '#'}
                    onClick={() => setOpen(false)}
                    className={`block border-b border-slate-50 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${n.urgent ? 'bg-primary-50/50 dark:bg-primary-950/20' : ''}`}
                  >
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

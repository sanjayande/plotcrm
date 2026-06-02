import { MapPin, Users, Calendar, CheckCircle, Footprints } from 'lucide-react';

const iconMap = {
  plot: MapPin,
  customer: Users,
  visit: Footprints,
  sale: CheckCircle,
  follow_up: Calendar,
};

const ActivityTimeline = ({ activities = [] }) => {
  if (!activities.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No recent activity yet</p>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((act, i) => {
        const Icon = iconMap[act.type] || MapPin;
        return (
          <div key={act.id || i} className="relative flex gap-4 pb-6 last:pb-0">
            {i < activities.length - 1 && (
              <span className="absolute left-[15px] top-8 h-full w-px bg-slate-200 dark:bg-slate-700" />
            )}
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{act.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {act.time ? new Date(act.time).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                }) : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;

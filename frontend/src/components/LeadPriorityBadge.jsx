const styles = {
  'Hot Lead': 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40',
  'Warm Lead': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40',
  'Cold Lead': 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40',
};

const LeadPriorityBadge = ({ priority = 'Warm Lead' }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${styles[priority] || styles['Warm Lead']}`}>
    {priority}
  </span>
);

export default LeadPriorityBadge;

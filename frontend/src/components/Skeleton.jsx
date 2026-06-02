const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-20 w-full" />
  </div>
);

export default Skeleton;

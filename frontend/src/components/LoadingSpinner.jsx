const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-12 w-12 border-4',
  };
  const dim = sizes[size] || sizes.md;

  return (
    <div className={`relative ${className}`} role="status" aria-label="Loading">
      <div className={`${dim} rounded-full border-slate-200 dark:border-slate-800`} />
      <div
        className={`absolute top-0 left-0 ${dim} animate-spin rounded-full border-primary-600 border-t-transparent`}
      />
    </div>
  );
};

export default LoadingSpinner;

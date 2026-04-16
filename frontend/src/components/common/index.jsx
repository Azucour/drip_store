// src/components/common/Spinner.jsx
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} ${className} animate-spin rounded-full border-2 border-white/10 border-t-primary-500`} />
  );
};

// src/components/common/PageLoader.jsx - Full page loading state
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
);

// src/components/common/ProductCardSkeleton.jsx
export const ProductCardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="skeleton aspect-square" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-4 rounded w-3/4" />
      <div className="skeleton h-3 rounded w-1/2" />
      <div className="skeleton h-5 rounded w-1/3" />
    </div>
  </div>
);

// src/components/common/EmptyState.jsx
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    {description && <p className="text-gray-500 mb-6 max-w-sm">{description}</p>}
    {action}
  </div>
);

// src/components/common/Badge.jsx
export const StatusBadge = ({ status }) => {
  const styles = {
    pending:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    confirmed:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    shipped:    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    delivered:  'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
    paid:       'bg-green-500/10 text-green-400 border-green-500/20',
    failed:     'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`badge border ${styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// src/components/common/ErrorMessage.jsx
export const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="text-4xl mb-4">⚠️</div>
    <p className="text-gray-400 mb-4">{message || 'Something went wrong'}</p>
    {onRetry && <button onClick={onRetry} className="btn-primary">Try Again</button>}
  </div>
);

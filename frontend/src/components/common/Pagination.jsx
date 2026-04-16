// src/components/common/Pagination.jsx
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  // Show max 5 pages around current
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronLeft size={16} />
      </button>

      {visible.map((page, i) => {
        const prev = visible[i - 1];
        const showEllipsis = prev && page - prev > 1;
        return (
          <span key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="text-gray-600 px-1">…</span>}
            <button
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all ${
                page === currentPage
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-primary-400'
              }`}
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}

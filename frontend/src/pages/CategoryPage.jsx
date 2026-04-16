// src/pages/CategoryPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { productAPI } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/common/Pagination';

const ALL_SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
const SORT_OPTIONS = [
  { label: 'Newest',       value: '-createdAt' },
  { label: 'Price: Low',   value: 'price' },
  { label: 'Price: High',  value: '-price' },
  { label: 'Top Rated',    value: '-rating' },
];

export default function CategoryPage() {
  const { cat }            = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]       = useState([]);
  const [pagination, setPagination]   = useState({});
  const [loading, setLoading]         = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selSizes, setSelSizes] = useState([]);
  const [sort, setSort]         = useState('-createdAt');
  const [page, setPage]         = useState(1);

  const category = decodeURIComponent(cat || '');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { category, page, limit: 12, sort };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (selSizes.length === 1) params.size = selSizes[0];

      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, page, sort, minPrice, maxPrice, selSizes]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [category]);

  const toggleSize = (size) => {
    setSelSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setMinPrice(''); setMaxPrice(''); setSelSizes([]); setSort('-createdAt'); setPage(1);
  };

  const hasFilters = minPrice || maxPrice || selSizes.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">{category}</h1>
          {!loading && (
            <p className="text-gray-500 text-sm mt-1">
              {pagination.totalProducts || 0} products
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input text-sm py-2 pr-8 appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              showFilters || hasFilters
                ? 'border-primary-500 text-primary-400 bg-primary-500/10'
                : 'border-white/10 text-gray-400 hover:border-white/30'
            }`}
          >
            <FiFilter size={14} />
            Filters
            {hasFilters && (
              <span className="w-4 h-4 bg-primary-500 rounded-full text-white text-xs flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-6 mb-8 animate-slide-down">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Filters</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                <FiX size={12} /> Clear all
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Price range */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-3 block">Price Range (₹)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="input text-sm py-2"
                />
                <span className="text-gray-600">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="input text-sm py-2"
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-3 block">Sizes</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`tag text-xs ${selSizes.includes(size) ? 'tag-active' : 'tag-inactive'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product grid */}
      <ProductGrid products={products} loading={loading} />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage || 1}
        totalPages={pagination.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}

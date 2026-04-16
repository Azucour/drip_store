// src/pages/SearchPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { productAPI } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/common/Pagination';

const CATEGORIES = ['T-Shirts','Shirts','Jeans','Hoodies','Jackets','Jerseys','Shorts','Traditional Wear','Footwear','Accessories'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery]       = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]   = useState(false);
  const [category, setCategory] = useState('');
  const [sort, setSort]         = useState(searchParams.get('sort') || '-createdAt');
  const [page, setPage]         = useState(1);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (query) params.keyword = query;
      if (category) params.category = category;
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, category, sort, page]);

  useEffect(() => { search(); }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    search();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="section-title mb-6">Search Products</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for T-shirts, Jeans, Hoodies..."
            className="input pl-12 py-4 text-base"
          />
        </div>
        <button type="submit" className="btn-primary px-8 text-base">Search</button>
      </form>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setCategory(''); setPage(1); }}
          className={`tag ${!category ? 'tag-active' : 'tag-inactive'}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => { setCategory(c); setPage(1); }}
            className={`tag ${category === c ? 'tag-active' : 'tag-inactive'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {!loading && `${pagination.totalProducts || 0} results`}
          {query && ` for "${query}"`}
        </p>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="input text-sm py-2 w-auto"
        >
          <option value="-createdAt">Newest</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-rating">Top Rated</option>
        </select>
      </div>

      <ProductGrid products={products} loading={loading} />
      <Pagination currentPage={pagination.currentPage || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}

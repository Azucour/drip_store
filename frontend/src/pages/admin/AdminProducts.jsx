// src/pages/admin/AdminProducts.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api';
import { PageLoader, StatusBadge } from '../../components/common/index';
import Pagination from '../../components/common/Pagination';

export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.keyword = search;
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Products</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm py-2">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input pl-11"
        />
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            className="w-11 h-11 rounded-lg object-cover bg-white/5 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-white line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-600">ID: {p._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="badge bg-white/5 text-gray-400 border border-white/10">{p.category}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">₹{(p.discountPrice || p.price).toLocaleString('en-IN')}</p>
                        {p.discountPrice > 0 && (
                          <p className="text-xs text-gray-600 line-through">₹{p.price.toLocaleString('en-IN')}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className={`font-medium ${p.stock === 0 ? 'text-red-400' : p.stock <= 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/products/edit/${p._id}`}
                            className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                          >
                            <FiEdit2 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            disabled={deletingId === p._id}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-16 text-gray-600">
                <FiPlus size={32} className="mx-auto mb-3 opacity-30" />
                <p>No products found.</p>
                <Link to="/admin/products/new" className="text-primary-400 text-sm mt-2 inline-block hover:text-primary-300">Add your first product →</Link>
              </div>
            )}
          </div>

          <Pagination currentPage={pagination.currentPage || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// src/pages/admin/AdminInventory.jsx
import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api';
import { PageLoader } from '../../components/common/index';

const getStockStatus = (stock) => {
  if (stock === 0) return { label: 'Out of Stock', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: FiAlertCircle };
  if (stock <= 10) return { label: 'Low Stock',    color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: FiAlertTriangle };
  return { label: 'In Stock',      color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: FiCheckCircle };
};

export default function AdminInventory() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [stockEdits, setStockEdits] = useState({});
  const [saving, setSaving]       = useState({});
  const [filter, setFilter]       = useState('all'); // all | low | out

  useEffect(() => {
    productAPI.getAll({ limit: 100, sort: 'stock' })
      .then(({ data }) => setProducts(data.products))
      .catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, []);

  const handleStockChange = (id, value) => {
    setStockEdits((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (product) => {
    const newStock = parseInt(stockEdits[product._id], 10);
    if (isNaN(newStock) || newStock < 0) return toast.error('Invalid stock value');

    setSaving((prev) => ({ ...prev, [product._id]: true }));
    try {
      await productAPI.update(product._id, { stock: newStock });
      setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, stock: newStock } : p));
      setStockEdits((prev) => { const next = { ...prev }; delete next[product._id]; return next; });
      toast.success(`Stock updated for ${product.name}`);
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setSaving((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  const filtered = products.filter((p) => {
    if (filter === 'out') return p.stock === 0;
    if (filter === 'low') return p.stock > 0 && p.stock <= 10;
    return true;
  });

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock   = products.filter((p) => p.stock > 0 && p.stock <= 10).length;

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-white mb-6">Inventory Management</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-green-500/15 rounded-xl flex items-center justify-center">
            <FiCheckCircle size={20} className="text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{products.filter((p) => p.stock > 10).length}</p>
            <p className="text-xs text-gray-500">In Stock</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-yellow-500/15 rounded-xl flex items-center justify-center">
            <FiAlertTriangle size={20} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{lowStock}</p>
            <p className="text-xs text-gray-500">Low Stock (≤10)</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-red-500/15 rounded-xl flex items-center justify-center">
            <FiAlertCircle size={20} className="text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{outOfStock}</p>
            <p className="text-xs text-gray-500">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Products' },
          { key: 'low', label: `Low Stock (${lowStock})` },
          { key: 'out', label: `Out of Stock (${outOfStock})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} className={`tag text-xs ${filter === key ? 'tag-active' : 'tag-inactive'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Product stock table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((product) => {
                const status = getStockStatus(product.stock);
                const Icon = status.icon;
                const isDirty = stockEdits[product._id] !== undefined && stockEdits[product._id] !== String(product.stock);

                return (
                  <tr key={product._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-white/5 flex-shrink-0" />
                        <p className="font-medium text-white line-clamp-1 max-w-[200px]">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="badge bg-white/5 text-gray-400 border border-white/10">{product.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge border flex items-center gap-1.5 w-fit ${status.bg} ${status.color}`}>
                        <Icon size={11} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-bold text-lg ${status.color}`}>{product.stock}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stockEdits[product._id] ?? product.stock}
                          onChange={(e) => handleStockChange(product._id, e.target.value)}
                          className="input py-1.5 w-24 text-sm"
                        />
                        {isDirty && (
                          <button
                            onClick={() => handleSave(product)}
                            disabled={saving[product._id]}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-400 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                          >
                            <FiSave size={12} />
                            {saving[product._id] ? '...' : 'Save'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <FiCheckCircle size={32} className="mx-auto mb-3 text-green-500/30" />
              <p>All products are well-stocked!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

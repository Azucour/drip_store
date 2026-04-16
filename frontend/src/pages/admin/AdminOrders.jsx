// src/pages/admin/AdminOrders.jsx
import { useState, useEffect } from 'react';
import { FiChevronDown, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';
import { PageLoader, StatusBadge } from '../../components/common/index';
import Pagination from '../../components/common/Pagination';

const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];

export default function AdminOrders() {
  const [orders, setOrders]       = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]           = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await orderAPI.getAllAdmin(params);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await orderAPI.updateStatus(orderId, { orderStatus: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Orders</h1>
        <p className="text-sm text-gray-500">{pagination.totalOrders || 0} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['', ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`tag text-xs ${statusFilter === s ? 'tag-active' : 'tag-inactive'}`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Customer</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{order.items?.length} item(s)</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-white font-medium text-sm">{order.user?.name || '—'}</p>
                        <p className="text-xs text-gray-600">{order.user?.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            disabled={updatingId === order._id}
                            className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary-500 cursor-pointer pr-7 disabled:opacity-50"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          <FiChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                        >
                          <FiEye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-16 text-gray-600">
                  <p>No orders found</p>
                </div>
              )}
            </div>
          </div>

          <Pagination currentPage={pagination.currentPage || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white text-xl leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-white/5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{selectedOrder.itemsTotal?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-gray-400"><span>Shipping</span><span>{selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice}`}</span></div>
                <div className="flex justify-between font-bold text-white border-t border-white/10 pt-2"><span>Total</span><span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span></div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-400">
                  <p className="text-white">{selectedOrder.shippingAddress?.fullName}</p>
                  <p>{selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}</p>
                  <p>{selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  <p>📱 {selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Update status */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(selectedOrder._id, s)}
                      disabled={selectedOrder.orderStatus === s || updatingId === selectedOrder._id}
                      className={`tag text-xs ${selectedOrder.orderStatus === s ? 'tag-active' : 'tag-inactive'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

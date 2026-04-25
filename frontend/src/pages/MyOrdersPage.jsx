// src/pages/MyOrdersPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { PageLoader, EmptyState, StatusBadge } from '../components/common/index';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="section-title mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders yet"
          description="When you place an order, it'll show up here."
          action={<Link to="/" className="btn-primary">Start Shopping</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card p-5 flex items-center gap-5 hover:border-white/15 transition-all group"
            >
              <div className="w-14 h-14 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiPackage size={22} className="text-primary-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <p className="text-sm font-mono text-gray-500 truncate">#{order._id.slice(-8).toUpperCase()}</p>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <p className="text-black font-medium line-clamp-1">
                  {order.items?.map((i) => i.name).join(', ')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.items?.length} item(s) · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-bold text-black">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  <StatusBadge status={order.paymentStatus} />
                </p>
              </div>

              <FiChevronRight size={18} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

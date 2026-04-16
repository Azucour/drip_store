// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiDollarSign, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { productAPI, orderAPI } from '../../services/api';
import { PageLoader, StatusBadge } from '../../components/common/index';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [productStats, setProductStats] = useState(null);
  const [orderStats, setOrderStats]     = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      productAPI.getAdminStats(),
      orderAPI.getAdminStats(),
    ]).then(([pRes, oRes]) => {
      setProductStats(pRes.data.stats);
      setOrderStats(oRes.data.stats);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <p className="text-xs text-gray-600">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard icon={FiDollarSign}     label="Total Revenue"   value={`₹${(orderStats?.totalRevenue || 0).toLocaleString('en-IN')}`} color="bg-green-500/80" sub="From paid orders" />
        <StatCard icon={FiShoppingBag}    label="Total Orders"    value={orderStats?.totalOrders || 0}    color="bg-blue-500/80"   sub="Successful payments" />
        <StatCard icon={FiPackage}        label="Total Products"  value={productStats?.totalProducts || 0} color="bg-purple-500/80" sub="Active listings" />
        <StatCard icon={FiAlertTriangle}  label="Pending Orders"  value={orderStats?.pendingOrders || 0}  color="bg-yellow-500/80" sub="Awaiting action" />
      </div>

      {/* Quick links + Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/products/new" className="btn-primary w-full text-center block py-2.5 text-sm">
              + Add New Product
            </Link>
            <Link to="/admin/orders" className="btn-outline w-full text-center block py-2.5 text-sm">
              View All Orders
            </Link>
            <Link to="/admin/inventory" className="btn-ghost w-full text-center block py-2.5 text-sm border border-white/10">
              Check Inventory
            </Link>
          </div>

          {/* Low stock alert */}
          {productStats?.lowStock > 0 && (
            <div className="mt-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <FiAlertTriangle size={14} className="text-yellow-400" />
                <p className="text-sm font-semibold text-yellow-400">Low Stock Alert</p>
              </div>
              <p className="text-xs text-gray-400">
                {productStats.lowStock} product(s) have ≤10 units left.
              </p>
              <Link to="/admin/inventory" className="text-xs text-yellow-400 hover:text-yellow-300 mt-1 inline-block">
                View →
              </Link>
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-400 hover:text-primary-300">View all →</Link>
          </div>

          {orderStats?.recentOrders?.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orderStats?.recentOrders?.map((order) => (
                <div key={order._id} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {order.user?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <StatusBadge status={order.orderStatus} />
                  <p className="text-sm font-bold text-white flex-shrink-0">
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      {productStats?.categoryCounts?.length > 0 && (
        <div className="card p-6 mt-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <FiTrendingUp size={16} className="text-primary-400" /> Products by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {productStats.categoryCounts.map(({ _id, count }) => (
              <div key={_id} className="text-center p-4 bg-white/3 rounded-xl border border-white/5">
                <p className="text-2xl font-bold text-primary-400">{count}</p>
                <p className="text-xs text-gray-500 mt-1">{_id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

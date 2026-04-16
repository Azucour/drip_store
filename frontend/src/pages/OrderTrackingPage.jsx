// src/pages/OrderTrackingPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiCheck, FiTruck, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { PageLoader, StatusBadge } from '../components/common/index';

const TRACK_STEPS = [
  { key: 'confirmed',  label: 'Order Confirmed', icon: FiCheck,   desc: 'Your order has been confirmed' },
  { key: 'processing', label: 'Processing',      icon: FiPackage, desc: 'We are preparing your order' },
  { key: 'shipped',    label: 'Shipped',         icon: FiTruck,   desc: 'Your order is on its way' },
  { key: 'delivered',  label: 'Delivered',       icon: FiMapPin,  desc: 'Order delivered successfully' },
];

const STEP_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found.</div>;

  const currentStepIdx = STEP_ORDER.indexOf(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors">
        <FiArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Track Order</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      {/* Timeline */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-white mb-6">Order Timeline</h2>
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-white/10" />

          <div className="space-y-8">
            {TRACK_STEPS.map((step, i) => {
              const stepIdx = STEP_ORDER.indexOf(step.key);
              const isDone = currentStepIdx >= stepIdx;
              const isCurrent = STEP_ORDER[currentStepIdx] === step.key;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-5 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all z-10 ${
                    isDone
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'bg-dark border-white/20 text-gray-600'
                  } ${isCurrent ? 'ring-4 ring-primary-500/20' : ''}`}>
                    <Icon size={16} />
                  </div>
                  <div className="pt-1.5">
                    <p className={`font-semibold text-sm ${isDone ? 'text-white' : 'text-gray-600'}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isDone ? 'text-gray-400' : 'text-gray-700'}`}>
                      {step.desc}
                    </p>
                    {/* Find timestamp from status history */}
                    {isDone && (() => {
                      const hist = order.statusHistory?.find((h) => h.status === step.key);
                      return hist ? (
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(hist.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      ) : null;
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Items Ordered</h3>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
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
          <hr className="border-white/10 my-4" />
          <div className="flex justify-between text-sm font-bold text-white">
            <span>Total Paid</span>
            <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Delivery Address</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p className="text-white font-medium">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>Pincode: {order.shippingAddress?.pincode}</p>
            <p className="pt-1">📱 {order.shippingAddress?.phone}</p>
          </div>
          <hr className="border-white/10 my-4" />
          <div className="text-sm text-gray-500">
            <p>Payment: <span className="text-green-400">✓ Paid via Razorpay</span></p>
            <p className="mt-1 font-mono text-xs text-gray-600">{order.razorpayPaymentId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

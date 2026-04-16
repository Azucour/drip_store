// src/pages/OrderSuccessPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import { orderAPI } from '../services/api';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderAPI.getById(id).then(({ data }) => setOrder(data.order)).catch(() => {});
  }, [id]);

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiCheckCircle size={40} className="text-green-400" />
      </div>
      <h1 className="font-display text-4xl font-bold text-white mb-3">Order Placed! 🎉</h1>
      <p className="text-gray-400 mb-2">Your payment was successful and your order is confirmed.</p>
      {order && (
        <p className="text-sm text-gray-600 mb-8">
          Order ID: <span className="font-mono text-gray-400">{order._id}</span>
        </p>
      )}

      {order && (
        <div className="card p-5 text-left mb-8">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><FiPackage /> Order Summary</h3>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.name} × {item.quantity} <span className="text-gray-600">(Size: {item.size})</span></span>
                <span className="text-white font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <hr className="border-white/10 my-3" />
            <div className="flex justify-between font-bold text-white">
              <span>Total Paid</span>
              <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>📦 Delivering to: {order.shippingAddress?.fullName}, {order.shippingAddress?.city}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link to={`/orders/${id}`} className="btn-primary flex items-center gap-2">
          <FiPackage size={16} /> Track Order
        </Link>
        <Link to="/" className="btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}

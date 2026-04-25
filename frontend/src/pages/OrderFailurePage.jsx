// src/pages/OrderFailurePage.jsx
import { Link } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

export default function OrderFailurePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiXCircle size={40} className="text-red-400" />
      </div>
      <h1 className="font-display text-4xl font-bold text-black mb-3">Payment Failed</h1>
      <p className="text-gray-600 mb-8">
        Your payment could not be processed. No amount has been charged.
        Please try again or use a different payment method.
      </p>
      <div className="flex gap-4 justify-center">
        <Link to="/checkout" className="btn-primary">Try Again</Link>
        <Link to="/cart" className="btn-outline">Back to Cart</Link>
      </div>
    </div>
  );
}

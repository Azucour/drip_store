// src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/common/index';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const shipping = totalPrice >= 999 ? 0 : 79;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our collection!"
          action={<Link to="/" className="btn-primary">Start Shopping</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title text-black">Your Cart</h1>

        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 transition-colors">
          Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">

          {items.map((item) => (
            <div key={item.key} className="card p-4 flex items-center gap-4">

              {/* Image */}
              <Link to={`/product/${item.product._id}`}>
                <img
                  src={item.product.images?.[0]}
                  alt={item.product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">

                <Link
                  to={`/product/${item.product._id}`}
                  className="font-semibold text-black hover:text-gray-700 transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    Size: {item.size}
                  </span>
                  <span className="text-xs text-gray-600">
                    {item.product.category}
                  </span>
                </div>

                <p className="font-bold text-black mt-1">
                  ₹{item.price.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quantity + Remove */}
              <div className="flex flex-col items-end gap-3">

                <button
                  onClick={() => removeFromCart(item.key)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-7 h-7 rounded border border-gray-300 text-black text-sm hover:border-black disabled:opacity-40"
                  >
                    −
                  </button>

                  <span className="w-6 text-center text-black text-sm font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                    className="w-7 h-7 rounded border border-gray-300 text-black text-sm hover:border-black"
                  >
                    +
                  </button>

                </div>

                <p className="text-sm font-semibold text-black">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>

            </div>
          ))}

        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">

            <h2 className="font-semibold text-black text-lg mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-gray-500">
                  Add ₹{(999 - totalPrice).toLocaleString('en-IN')} more for free shipping
                </p>
              )}

            </div>

            <hr className="border-gray-200 my-5" />

            <div className="flex justify-between font-bold text-black text-lg mb-6">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              <FiShoppingBag size={18} />
              Proceed to Checkout
            </button>

            <Link to="/" className="btn-ghost w-full flex items-center justify-center gap-2 mt-3 text-sm text-black">
              <FiArrowLeft size={14} /> Continue Shopping
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
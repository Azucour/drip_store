// src/components/product/ProductCard.jsx
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    const defaultSize = product.sizes?.[0];
    if (!defaultSize) return;
    addToCart(product, defaultSize, 1);
    toast.success(`Added to cart!`);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={product.images?.[0] || 'https://placehold.co/400x400/e5e7eb/999?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="badge bg-primary-500 text-white text-xs font-bold px-2 py-0.5">
              -{discountPct}%
            </span>
          )}

          {product.stock === 0 && (
            <span className="badge bg-gray-800 text-white text-xs px-2 py-0.5">
              Out of Stock
            </span>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <span className="badge bg-yellow-400 text-black text-xs font-semibold px-2 py-0.5">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Quick add button */}
        <button
          onClick={handleQuickAdd}
          disabled={product.stock === 0}
          className="absolute bottom-3 right-3 w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md"
        >
          <FiShoppingCart size={16} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-primary-500 font-medium mb-1">
          {product.category}
        </p>

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <FiStar size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-500">
              {product.rating?.toFixed(1)} ({product.numReviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-gray-900">
            ₹{price.toLocaleString('en-IN')}
          </span>

          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {product.sizes.slice(0, 5).map((s) => (
              <span
                key={s}
                className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200"
              >
                {s}
              </span>
            ))}

            {product.sizes.length > 5 && (
              <span className="text-xs px-1.5 py-0.5 text-gray-500">
                +{product.sizes.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
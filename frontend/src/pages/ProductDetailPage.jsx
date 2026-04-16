// src/pages/ProductDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PageLoader, StatusBadge } from '../components/common/index';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity]     = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await productAPI.getById(id);
        setProduct(data.product);
        setSelectedSize(data.product.sizes?.[0] || '');
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error('Please select a size');
    if (product.stock === 0) return toast.error('Out of stock');
    addToCart(product, selectedSize, quantity);
    toast.success('Added to cart! 🛒');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to leave a review');
    setSubmitting(true);
    try {
      await productAPI.addReview(id, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted!');
      setReviewText('');
      // Refresh product
      const { data } = await productAPI.getById(id);
      setProduct(data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Product not found.</p>
      <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
    </div>
  );

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPct = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/category/${encodeURIComponent(product.category)}`} className="hover:text-white transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-300">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* ── Images ───────────────────────────────────── */}
        <div>
          {/* Main image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-4">
            <img
              src={product.images?.[activeImage] || 'https://placehold.co/600x600/1a1a1a/666?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeImage ? 'border-primary-500' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ─────────────────────────────── */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary-400 text-sm font-medium mb-1">{product.category}</p>
              <h1 className="font-display text-3xl font-bold text-white">{product.name}</h1>
            </div>
            <button className="p-2 text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors mt-1">
              <FiShare2 size={16} />
            </button>
          </div>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <FiStar key={s} size={14} className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                ))}
              </div>
              <span className="text-sm text-gray-400">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mt-5">
            <span className="font-display text-4xl font-bold text-white">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {discountPct > 0 && (
              <>
                <span className="text-lg text-gray-500 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30 font-bold">
                  {discountPct}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          <div className="mt-3">
            {product.stock === 0 ? (
              <span className="text-red-400 text-sm font-medium">Out of Stock</span>
            ) : product.stock <= 10 ? (
              <span className="text-yellow-400 text-sm font-medium">Only {product.stock} left in stock</span>
            ) : (
              <span className="text-green-400 text-sm font-medium">In Stock</span>
            )}
          </div>

          <hr className="border-white/10 my-6" />

          {/* Size selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-white">Select Size</label>
              <button className="text-xs text-primary-400 hover:text-primary-300">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`tag ${selectedSize === size ? 'tag-active' : 'tag-inactive'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-white mb-3 block">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-lg border border-white/10 text-white hover:border-primary-500 transition-all text-lg font-bold"
              >
                −
              </button>
              <span className="w-12 text-center text-white font-semibold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="w-10 h-10 rounded-lg border border-white/10 text-white hover:border-primary-500 transition-all text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4"
          >
            <FiShoppingCart size={20} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Description */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-white mb-3">About this product</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Meta */}
          {product.brand && (
            <p className="mt-4 text-xs text-gray-600">Brand: <span className="text-gray-400">{product.brand}</span></p>
          )}
        </div>
      </div>

      {/* ── Reviews ─────────────────────────────────────── */}
      <section className="mt-16">
        <h2 className="section-title mb-8">Customer Reviews</h2>

        {/* Submit review */}
        {isAuthenticated && (
          <form onSubmit={handleReviewSubmit} className="card p-6 mb-8">
            <h3 className="font-semibold text-white mb-4">Write a Review</h3>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => setReviewRating(s)}>
                  <FiStar size={24} className={s <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-400 transition-colors'} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience..."
              required
              rows={3}
              className="input resize-none mb-4"
            />
            <button type="submit" disabled={submitting} className="btn-primary py-2 px-6">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {product.reviews?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {product.reviews?.map((review, i) => (
              <div key={i} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold text-sm">
                      {review.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{review.name}</p>
                      <div className="flex">
                        {[1,2,3,4,5].map((s) => (
                          <FiStar key={s} size={11} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

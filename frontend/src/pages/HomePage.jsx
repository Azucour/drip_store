// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { productAPI } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';

const CATEGORIES = [
  { name: 'T-Shirts',         emoji: '👕', color: 'from-blue-500/20 to-blue-600/5' },
  { name: 'Shirts',           emoji: '👔', color: 'from-purple-500/20 to-purple-600/5' },
  { name: 'Jeans',            emoji: '👖', color: 'from-indigo-500/20 to-indigo-600/5' },
  { name: 'Hoodies',          emoji: '🧥', color: 'from-green-500/20 to-green-600/5' },
  { name: 'Jackets',          emoji: '🧤', color: 'from-orange-500/20 to-orange-600/5' },
  { name: 'Jerseys',          emoji: '⚽', color: 'from-red-500/20 to-red-600/5' },
  { name: 'Shorts',           emoji: '🩳', color: 'from-yellow-500/20 to-yellow-600/5' },
  { name: 'Traditional Wear', emoji: '🎎', color: 'from-pink-500/20 to-pink-600/5' },
  { name: 'Footwear',         emoji: '👟', color: 'from-teal-500/20 to-teal-600/5' },
  { name: 'Accessories',      emoji: '🧢', color: 'from-cyan-500/20 to-cyan-600/5' },
];

export default function HomePage() {
  const [featured, setFeatured]       = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [featRes, newRes] = await Promise.all([
        productAPI.getFeatured(),
        productAPI.getAll({ sort: '-createdAt', limit: 8 }),
      ]);
      setFeatured(featRes.data.products);
      setNewArrivals(newRes.data.products);
    } catch (err) {
      console.error('Failed to load homepage products', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const ErrorRetry = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚡</div>
      <h3 className="text-xl font-semibold text-gray-500 mb-2">Server is waking up…</h3>
      <p className="text-gray-500 mb-6">Our server takes a moment to start. Please try again.</p>
      <button onClick={fetchData} className="btn-primary flex items-center gap-2">
        <FiRefreshCw size={16} /> Retry
      </button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-dark to-dark" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/5 to-transparent" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-up">
            <p className="text-primary-400 text-sm font-mono font-medium tracking-widest uppercase mb-4">
              New Season Drop
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-tight">
              Dress Like
              <br />
              You Mean
              <br />
              <span className="text-primary-500">It.</span>
            </h1>
            <p className="mt-6 text-gray-400 text-lg max-w-md">
              Premium streetwear and fashion pieces curated for those who lead the pack.
              Free shipping on orders above ₹999.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/search" className="btn-primary text-lg px-8 py-4">
                Shop Now →
              </Link>
              <Link to="/category/T-Shirts" className="btn-ghost text-lg px-8 py-4">
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/category/${encodeURIComponent(cat.name)}`}
              className={`bg-gradient-to-br ${cat.color} border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-white/20 hover:scale-105 transition-all duration-300 text-center`}
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-gray-300">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Picks ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Picks</h2>
            <p className="text-gray-500 mt-1">Hand-selected must-haves this season</p>
          </div>
          <Link to="/search" className="btn-ghost flex items-center gap-2 text-sm">
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        {error
          ? <ErrorRetry />
          : <ProductGrid products={featured} loading={loading} />
        }
      </section>

      {/* ── New Arrivals ── */}
      {!error && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="text-gray-500 mt-1">Just dropped — get them before they sell out</p>
            </div>
            <Link to="/search?sort=-createdAt" className="btn-ghost flex items-center gap-2 text-sm">
              See All <FiArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={newArrivals} loading={loading} />
        </section>
      )}

      {/* ── Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-900/60 to-primary-700/30 border border-primary-500/20 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
          <div className="relative">
            <p className="text-primary-400 font-mono text-sm tracking-widest uppercase mb-2">Limited Time</p>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-white">
              Get 20% Off Your First Order
            </h3>
            <p className="text-gray-400 mt-2">Use code <span className="text-primary-400 font-mono font-bold">DRIP20</span> at checkout</p>
          </div>
          <Link to="/signup" className="relative btn-primary text-lg px-8 py-4 whitespace-nowrap">
            Claim Offer →
          </Link>
        </div>
      </section>
    </div>
  );
}

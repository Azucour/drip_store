// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { productAPI } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';

const CATEGORIES = [
  { name: 'T-Shirts', emoji: '👕' },
  { name: 'Shirts', emoji: '👔' },
  { name: 'Jeans', emoji: '👖' },
  { name: 'Hoodies', emoji: '🧥' },
  { name: 'Jackets', emoji: '🧤' },
  { name: 'Jerseys', emoji: '⚽' },
  { name: 'Shorts', emoji: '🩳' },
  { name: 'Traditional Wear', emoji: '🎎' },
  { name: 'Footwear', emoji: '👟' },
  { name: 'Accessories', emoji: '🧢' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          productAPI.getFeatured(),
          productAPI.getAll({ sort: '-createdAt', limit: 8 }),
        ]);
        setFeatured(featRes.data.products);
        setNewArrivals(newRes.data.products);
      } catch (err) {
        console.error('Failed to load homepage products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in">

      {/* 🔥 TOP CATEGORY BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/category/${encodeURIComponent(cat.name)}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all whitespace-nowrap"
            >
              <span>{cat.emoji}</span>
              <span className="text-sm text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 🔥 FEATURED PRODUCTS */}
      {(loading || featured.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Picks</h2>
              <p className="text-gray-600 mt-1">Hand-selected must-haves this season</p>
            </div>
            <Link to="/search" className="btn-ghost flex items-center gap-2 text-sm">
              View All <FiArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
        </section>
      )}

      {/* 🔥 NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">New Arrivals</h2>
            <p className="text-gray-600 mt-1">Just dropped — get them before they sell out</p>
          </div>
          <Link to="/search?sort=-createdAt" className="btn-ghost flex items-center gap-2 text-sm">
            See All <FiArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={newArrivals} loading={loading} />
      </section>

      {/* 🔥 HERO (LIGHT VERSION) */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center bg-gradient-to-br from-primary-50 via-white to-white">
        
        {/* Soft decoration */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-orange-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary-500 text-sm font-mono tracking-widest uppercase mb-4">
              New Season Drop
            </p>

            <h1 className="font-display text-5xl md:text-6xl font-black text-gray-900 leading-tight">
              Dress Like You Mean <span className="text-primary-500">It.</span>
            </h1>

            <p className="mt-6 text-gray-600 text-lg max-w-md">
              Premium streetwear for those who lead the pack. Free shipping above ₹999.
            </p>

            <div className="flex gap-4 mt-8">
              <Link to="/category/T-Shirts" className="btn-primary flex items-center gap-2">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/category/Jackets" className="btn-outline">
                New Arrivals
              </Link>
            </div>

            <div className="flex gap-8 mt-10">
              {[
                ['1K+', 'Customers'],
                ['500+', 'Products'],
                ['Free', 'Returns'],
              ].map(([val, label]) => (
                <div key={label}>
                  <p className="text-xl font-bold text-primary-500">{val}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 BANNER (LIGHT VERSION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl bg-primary-50 border border-primary-200 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-primary-500 text-sm uppercase mb-2">Limited Time</p>
            <h3 className="text-3xl font-bold text-gray-900">
              Get 10% Off Your First Order
            </h3>
            <p className="text-gray-600 mt-2">
              Use code <span className="text-primary-500 font-bold">LXRY20</span>
            </p>
          </div>

          <Link to="/signup" className="btn-primary px-8 py-4">
            Claim Offer →
          </Link>
        </div>
      </section>

    </div>
  );
}
// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CATEGORIES = [
  'T-Shirts', 'Shirts', 'Jeans', 'Hoodies',
  'Jackets', 'Jerseys', 'Shorts', 'Traditional Wear',
  'Footwear', 'Accessories',
];

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="font-display text-2xl font-black tracking-tight text-gray-900">
            LXRY_STREET<span className="text-primary-500">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                to={`/category/${encodeURIComponent(cat)}`}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {cat}
              </Link>
            ))}

            <div className="relative group">
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                More ▾
              </button>

              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {CATEGORIES.slice(6).map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${encodeURIComponent(cat)}`}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 first:rounded-t-xl last:rounded-b-xl transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5 gap-2 focus-within:border-primary-500 transition-colors">
              <FiSearch className="text-gray-500 text-sm" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none w-32 focus:w-48 transition-all duration-300"
              />
            </form>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <FiShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse-once">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-100 border border-primary-300 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-md z-50 animate-slide-down">
                    
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <FiPackage size={14} /> My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-gray-100 transition-colors"
                      >
                        <FiUser size={14} /> Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        navigate('/');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-gray-100 transition-colors rounded-b-xl"
                    >
                      <FiLogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 animate-slide-down">
          <div className="px-4 py-3">

            <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 gap-2 mb-4">
              <FiSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none flex-1"
              />
            </form>

            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${encodeURIComponent(cat)}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-gray-700 hover:text-gray-900 py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                  {cat}
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
  
  <span className="text-sm text-gray-600">Follow us</span>

  <a
    href="https://www.instagram.com/Causeway_Collection"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-sm text-gray-900 hover:text-blue-600 transition-colors"
  >
    <img
      src="https://logodix.com/logo/1049852.png"
      alt="profile"
      className="w-6 h-6 rounded-full"
    />
    @Causeway_Collection
  </a>

</div>

          </div>
        </div>
      )}
    </header>
  );
}
// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

const CATEGORIES = ['T-Shirts', 'Shirts', 'Jeans', 'Hoodies', 'Jackets', 'Jerseys'];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-2xl font-black">
              DRIP<span className="text-primary-500">.</span>
            </Link>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed">
              Premium streetwear and fashion for those who set trends.
            </p>
            <div className="flex gap-3 mt-4">
              {[FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-500 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link to={`/category/${encodeURIComponent(cat)}`} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-white mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {['My Orders', 'Size Guide', 'Returns & Exchanges', 'Shipping Info', 'Contact Us'].map((item) => (
                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-white mb-4">Stay in the Loop</h4>
            <p className="text-sm text-gray-500 mb-3">Get exclusive drops and deals.</p>
            <form className="flex gap-2">
              <input type="email" placeholder="your@email.com" className="input text-sm py-2 flex-1" />
              <button type="submit" className="btn-primary py-2 px-4 text-sm whitespace-nowrap">Go</button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Drip Store. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-gray-600">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

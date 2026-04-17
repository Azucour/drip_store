// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

const CATEGORIES = ['T-Shirts', 'Shirts', 'Jeans', 'Hoodies', 'Jackets', 'Jerseys'];

// ─── CHANGE THESE LATER ───────────────────────────────────────────────────────
const OWNER_EMAIL     = 'adinathmane462@gmail.com';          // newsletter destination
const WHATSAPP_NUMBER = '9372789326';                  // returns & size guide (no + or spaces)
const CONTACT_PHONE   = '+9372789326';                 // dial pad
const INSTAGRAM_URL   = 'https://www.instagram.com/Causeway_Collection';
const TWITTER_URL     = 'https://www.instagram.com/Causeway_Collection';
const YOUTUBE_URL     = 'https://www.instagram.com/Causeway_Collection';
const PROFILE_PIC_URL = 'https://logodix.com/logo/1049852.png';
// ─────────────────────────────────────────────────────────────────────────────

const WA_RETURNS = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I want to know about return and exchange policy.')}`;
const WA_SIZE    = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I need help with the size guide.')}`;
const TEL_URL    = `tel:${CONTACT_PHONE}`;

export default function Footer() {
  const handleNewsletter = (e) => {
    e.preventDefault();
    const email   = e.target.elements.email.value.trim();
    if (!email) return;
    const subject = encodeURIComponent('Newsletter Subscription – Lxry_street Store');
    const body    = encodeURIComponent(`Hi,\n\nI'd like to subscribe to the Lxry_street Store newsletter.\n\nMy email: ${email}`);
    window.open(`mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`, '_blank');
    e.target.reset();
  };

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-2xl font-black text-gray-900">
              LXRY_STREET<span className="text-primary-500">.</span>
            </Link>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed">
              Premium streetwear and fashion for those who set trends.
            </p>

            {/* Profile pic + Follow us */}
            <div className="flex items-center gap-3 mt-5">
              <img
                src={PROFILE_PIC_URL}
                alt="Drip Store"
className="w-10 h-10 rounded-full object-cover"              />
              <div>
                <p className="text-xs font-semibold text-gray-700">Follow us on</p>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                 className="text-xs text-gray-900 hover:text-blue-600 font-medium transition-colors"
>
                  @Causeway_Collection
                </a>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex gap-3 mt-4">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary-500 transition-all"
                aria-label="Instagram">
                <FiInstagram size={16} />
              </a>
              <a href={TWITTER_URL} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary-500 transition-all"
                aria-label="Twitter">
                <FiTwitter size={16} />
              </a>
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary-500 transition-all"
                aria-label="YouTube">
                <FiYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link to={`/category/${encodeURIComponent(cat)}`}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              {/* My Orders → /orders page */}
              <li>
                <Link to="/orders" className="text-gray-500 hover:text-gray-900 transition-colors">
                  My Orders
                </Link>
              </li>
              {/* Size Guide → WhatsApp */}
              <li>
                <a href={WA_SIZE} target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900 transition-colors">
                  Size Guide
                </a>
              </li>
              {/* Returns & Exchanges → WhatsApp */}
              <li>
                <a href={WA_RETURNS} target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900 transition-colors">
                  Returns &amp; Exchanges
                </a>
              </li>
              {/* Shipping Info → /orders (tracks shipments) */}
              <li>
                <Link to="/orders" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Shipping Info
                </Link>
              </li>
              {/* Contact Us → dial pad */}
              <li>
                <a href={TEL_URL} className="text-gray-500 hover:text-gray-900 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Stay in the Loop</h4>
            <p className="text-sm text-gray-500 mb-3">Get exclusive drops and deals.</p>
            <form className="flex gap-2" onSubmit={handleNewsletter}>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="input text-sm py-2 flex-1"
              />
              <button type="submit" className="btn-primary py-2 px-4 text-sm whitespace-nowrap">
                Go
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2">Tapping Go opens your email app.</p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Lxry_street Store. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
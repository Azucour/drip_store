// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      <p className="font-display text-9xl font-black text-white/5">404</p>
      <h1 className="font-display text-4xl font-bold text-white -mt-8 mb-4">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  );
}

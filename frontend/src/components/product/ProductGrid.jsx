// src/components/product/ProductGrid.jsx
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/index';

export default function ProductGrid({ products, loading, columns = 4 }) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns] || 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  if (loading) {
    return (
      <div className={`grid ${colClass} gap-4 md:gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClass} gap-4 md:gap-6`}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

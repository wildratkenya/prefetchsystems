import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Tag } from 'lucide-react';

interface ProductCardProps {
  product: any;
  showSaleBadge?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showSaleBadge }) => {
  const { addToCart } = useCart();
  const price = product.price || 0;
  const isSale = product.tags?.includes('sale') || showSaleBadge;
  const originalPrice = isSale ? Math.round(price * 1.15) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      variant_id: undefined,
      name: product.name,
      variant_title: undefined,
      sku: product.sku || product.handle,
      price: price,
      image: product.images?.[0],
    });
  };

  const formatKES = (cents: number) => {
    return 'KES ' + (cents / 100).toLocaleString('en-KE');
  };

  return (
    <Link to={`/product/${product.handle}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isSale && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" /> SALE
          </div>
        )}
        {product.tags?.includes('bestseller') && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            BESTSELLER
          </div>
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-[#1a365d] hover:bg-[#dc2626] text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.vendor || product.product_type}</p>
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-[#dc2626] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#1a365d]">{formatKES(price)}</span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">{formatKES(originalPrice)}</span>
          )}
        </div>
        {product.inventory_qty !== null && product.inventory_qty <= 3 && product.inventory_qty > 0 && (
          <p className="text-xs text-orange-600 mt-1 font-medium">Only {product.inventory_qty} left!</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

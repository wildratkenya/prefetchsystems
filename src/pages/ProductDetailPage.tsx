import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, ArrowLeft, Truck, Shield, Package, Minus, Plus, Check } from 'lucide-react';
const ProductDetailPage: React.FC = () => {
  const {
    handle
  } = useParams<{
    handle: string;
  }>();
  const navigate = useNavigate();
  const {
    addToCart
  } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  useEffect(() => {
    const fetchProduct = async () => {
      setSelectedVariant(null);
      setSelectedSize('');
      setQuantity(1);
      setAdded(false);
      setLoading(true);
      const {
        data
      } = await supabase.from('ecom_products').select('*, variants:ecom_product_variants(*)').eq('handle', handle).single();
      if (data) {
        let variants = data.variants || [];
        if (data.has_variants && variants.length === 0) {
          const {
            data: variantData
          } = await supabase.from('ecom_product_variants').select('*').eq('product_id', data.id).order('position');
          variants = variantData || [];
          data.variants = variants;
        }
        setProduct(data);
        if (variants.length > 0) {
          const sorted = [...variants].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
          const firstInStock = sorted.find((v: any) => v.inventory_qty == null || v.inventory_qty > 0) || sorted[0];
          setSelectedVariant(firstInStock);
          setSelectedSize(firstInStock?.option1 || '');
        }

        // Fetch related products
        if (data.product_type) {
          const {
            data: related
          } = await supabase.from('ecom_products').select('*, variants:ecom_product_variants(*)').eq('product_type', data.product_type).eq('status', 'active').neq('id', data.id).limit(4);
          if (related) setRelatedProducts(related);
        }
        supabase.from('site_analytics').insert({
          page: `/product/${handle}`,
          event_type: 'product_view',
          metadata: {
            product_id: data.id
          }
        });
      }
      setLoading(false);
    };
    fetchProduct();
  }, [handle]);
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const variant = product?.variants?.find((v: any) => v.option1 === size || v.title?.toLowerCase().includes(size.toLowerCase()));
    if (variant) setSelectedVariant(variant);
  };
  const variantSizes = [...new Set(product?.variants?.map((v: any) => v.option1).filter(Boolean) || [])];
  const hasVariants = product?.has_variants && product?.variants?.length > 0;
  const getInStock = (): boolean => {
    if (selectedVariant) {
      if (selectedVariant.inventory_qty == null) return true;
      return selectedVariant.inventory_qty > 0;
    }
    if (product?.variants?.length > 0) {
      return product.variants.some((v: any) => v.inventory_qty == null || v.inventory_qty > 0);
    }
    if (product?.has_variants) return true;
    if (product?.inventory_qty == null) return true;
    return product.inventory_qty > 0;
  };
  const inStock = product ? getInStock() : false;
  const handleAddToCart = () => {
    if (!product) return;
    if (hasVariants && !selectedSize) return;
    if (!inStock) return;
    addToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id || undefined,
      name: product.name,
      variant_title: selectedVariant?.title || selectedSize || undefined,
      sku: selectedVariant?.sku || product.sku || product.handle,
      price: selectedVariant?.price || product.price,
      image: product.images?.[0]
    }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };
  const currentPrice = selectedVariant?.price || product?.price || 0;
  const formatKES = (cents: number) => 'KES ' + (cents / 100).toLocaleString('en-KE');
  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-gray-100 rounded-2xl animate-pulse aspect-square" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse" />
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>;
  }
  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Product not found</h2>
        <Link to="/shop" className="text-red-600 font-medium hover:text-red-700">Back to Shop</Link>
      </div>;
  }
  return <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-red-600">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square">
            <img src={product.images?.[0] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-red-600 font-medium uppercase tracking-wider mb-2">{product.vendor}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-[#1a365d]">{formatKES(currentPrice)}</span>
              {product.tags?.includes('sale') && <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">SALE</span>}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Specs from metadata */}
            {product.metadata && <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.metadata).map(([key, value]) => <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-500 capitalize" data-mixed-content="true">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-gray-900 font-medium">{String(value)}</span>
                    </div>)}
                </div>
              </div>}

            {/* Variant selector */}
            {hasVariants && variantSizes.length > 0 && <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Select Option</label>
                <div className="flex flex-wrap gap-2">
                  {variantSizes.map(size => {
                const variant = product.variants?.find((v: any) => v.option1 === size);
                const sizeInStock = variant ? variant.inventory_qty == null || variant.inventory_qty > 0 : true;
                return <button key={size} onClick={() => sizeInStock && handleSizeSelect(size)} disabled={!sizeInStock} className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${selectedSize === size ? 'bg-[#1a365d] text-white border-[#1a365d]' : sizeInStock ? 'border-gray-200 hover:border-gray-400 text-gray-700' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}>
                        {size}
                      </button>;
              })}
                </div>
              </div>}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button onClick={handleAddToCart} disabled={hasVariants && !selectedSize || !inStock} className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${added ? 'bg-green-600 text-white' : !inStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#1a365d] text-white hover:bg-red-600 shadow-lg hover:shadow-xl'}`}>
              {added ? <><Check className="w-5 h-5" /> Added to Cart!</> : !inStock ? 'Out of Stock' : hasVariants && !selectedSize ? 'Select an Option' : <><ShoppingCart className="w-5 h-5" /> Add to Cart - {formatKES(currentPrice * quantity)}</>}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[{
              icon: Truck,
              label: 'Free Delivery'
            }, {
              icon: Shield,
              label: 'Genuine Product'
            }, {
              icon: Package,
              label: 'Secure Packaging'
            }].map((b, i) => <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                  <b.icon className="w-5 h-5 mx-auto text-[#1a365d] mb-1" />
                  <p className="text-xs text-gray-600 font-medium">{b.label}</p>
                </div>)}
            </div>

            {/* SKU */}
            <p className="text-xs text-gray-400 mt-4" data-mixed-content="true">SKU: {selectedVariant?.sku || product.sku || 'N/A'}</p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {relatedProducts.map(p => <Link key={p.id} to={`/product/${p.handle}`} className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-sm font-bold text-[#1a365d]">{formatKES(p.price)}</p>
                  </div>
                </Link>)}
            </div>
          </div>}
      </div>
    </div>;
};
export default ProductDetailPage;
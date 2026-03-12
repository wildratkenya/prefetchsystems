import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { ArrowLeft } from 'lucide-react';

const CollectionPage: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionProducts = async () => {
      if (!handle) return;
      setLoading(true);

      const { data: collectionData } = await supabase
        .from('ecom_collections')
        .select('*')
        .eq('handle', handle)
        .single();

      if (!collectionData) { setLoading(false); return; }
      setCollection(collectionData);

      const { data: productLinks } = await supabase
        .from('ecom_product_collections')
        .select('product_id, position')
        .eq('collection_id', collectionData.id)
        .order('position');

      if (!productLinks || productLinks.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const productIds = productLinks.map(pl => pl.product_id);
      const { data: productsData } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .in('id', productIds)
        .eq('status', 'active');

      const sortedProducts = productIds
        .map(id => productsData?.find(p => p.id === id))
        .filter(Boolean);

      setProducts(sortedProducts);
      setLoading(false);
    };

    fetchCollectionProducts();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#1a365d] py-12"><div className="max-w-7xl mx-auto px-4"><div className="h-10 bg-white/20 rounded w-1/3 animate-pulse" /></div></div>
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl animate-pulse aspect-[3/4]" />)}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Collection not found</h2>
          <Link to="/shop" className="text-red-600 font-medium">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1a365d] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/shop" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{collection.title}</h1>
          {collection.description && <p className="text-gray-300">{collection.description}</p>}
          <p className="text-gray-400 text-sm mt-2">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products in this collection yet</h3>
            <Link to="/shop" className="text-red-600 font-medium">Browse all products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(product => (
              <ProductCard key={product.id} product={product} showSaleBadge={handle === 'on-sale'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;

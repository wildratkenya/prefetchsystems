import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase.from('site_analytics').insert({ page: '/shop', event_type: 'pageview' });
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .eq('status', 'active');
      if (data) setProducts(data);

      const { data: cols } = await supabase
        .from('ecom_collections')
        .select('id, title, handle')
        .eq('is_visible', true);
      if (cols) setCollections(cols.filter(c => !['featured', 'on-sale'].includes(c.handle)));

      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Search
    const q = searchQuery.toLowerCase();
    if (q) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.vendor?.toLowerCase().includes(q) ||
        p.product_type?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(p => p.product_type === selectedType);
    }

    // Vendor filter
    if (selectedVendor !== 'all') {
      result = result.filter(p => p.vendor === selectedVendor);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price-desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedType, selectedVendor, sortBy]);

  const productTypes = [...new Set(products.map(p => p.product_type).filter(Boolean))];
  const vendors = [...new Set(products.map(p => p.vendor).filter(Boolean))];

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedVendor('all');
    setSortBy('name-asc');
  };

  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedVendor !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-[#1a365d] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Shop All Products</h1>
          <p className="text-gray-300">Browse our complete range of printers, toners, and consumables</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Type filter */}
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                <option value="all">All Categories</option>
                {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Vendor filter */}
              <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                <option value="all">All Brands</option>
                {vendors.map(v => <option key={v} value={v}>{v}</option>)}
              </select>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collection Quick Links */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link to="/shop" className="px-4 py-2 rounded-full text-sm font-medium bg-[#1a365d] text-white">
            All
          </Link>
          {collections.map(col => (
            <Link key={col.id} to={`/collections/${col.handle}`}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:text-red-600 transition-colors">
              {col.title}
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="text-red-600 font-medium hover:text-red-700">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;

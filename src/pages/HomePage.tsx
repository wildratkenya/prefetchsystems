import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Search, Printer, Package, Wrench, Layers, ArrowRight, Shield, Truck, Headphones, CheckCircle } from 'lucide-react';

const HERO_BG = 'https://cdn.jsdelivr.net/gh/wildratkenya/prefetch/images/Gemini_Generated_Image_vfb3prvfb3prvfb3.png';
const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/699c6111136bd966ef67d342_1771935144580_898e7478.png';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Track page view
      supabase.from('site_analytics').insert({ page: '/', event_type: 'pageview' });

      // Fetch collections
      const { data: cols } = await supabase
        .from('ecom_collections')
        .select('id, title, handle, description')
        .eq('is_visible', true);
      if (cols) setCollections(cols.filter(c => !['featured', 'on-sale'].includes(c.handle)));

      // Fetch featured products
      const { data: featuredLinks } = await supabase
        .from('ecom_product_collections')
        .select('product_id, position')
        .eq('collection_id', 'bc639110-3e57-47f6-810c-e0f9b28fe068')
        .order('position');

      if (featuredLinks && featuredLinks.length > 0) {
        const ids = featuredLinks.map(l => l.product_id);
        const { data: products } = await supabase
          .from('ecom_products')
          .select('*, variants:ecom_product_variants(*)')
          .in('id', ids)
          .eq('status', 'active');
        if (products) {
          const sorted = ids.map(id => products.find(p => p.id === id)).filter(Boolean);
          setFeaturedProducts(sorted);
        }
      }

      // Fetch sale products
      const { data: saleLinks } = await supabase
        .from('ecom_product_collections')
        .select('product_id, position')
        .eq('collection_id', '6375c3f3-35a6-40ca-bbfa-58ac2a70c00f')
        .order('position');

      if (saleLinks && saleLinks.length > 0) {
        const ids = saleLinks.map(l => l.product_id);
        const { data: products } = await supabase
          .from('ecom_products')
          .select('*, variants:ecom_product_variants(*)')
          .in('id', ids)
          .eq('status', 'active');
        if (products) {
          const sorted = ids.map(id => products.find(p => p.id === id)).filter(Boolean);
          setSaleProducts(sorted);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const categoryCards = [
    { icon: Printer, label: 'Konica Minolta Printers', handle: 'konica-minolta-printers', color: 'from-blue-600 to-blue-800', desc: 'bizhub MFP Series' },
    { icon: Printer, label: 'HP Printers', handle: 'hp-printers', color: 'from-sky-500 to-sky-700', desc: 'LaserJet Pro & Enterprise' },
    { icon: Package, label: 'CET Toners & Consumables', handle: 'cet-toners-consumables', color: 'from-red-500 to-red-700', desc: 'Compatible Cartridges' },
    { icon: Wrench, label: 'Maintenance Kits', handle: 'maintenance-kits', color: 'from-amber-500 to-amber-700', desc: 'Fusers & Spare Parts' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Office Printing Solutions" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1f38]/95 via-[#0f1f38]/80 to-[#0f1f38]/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm font-medium">Certified & Authorized CET Dealers</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Premium Printer<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Solutions</span> for Your Business
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
              Your trusted partner for Konica Minolta printers, HP LaserJet, CET toners, and maintenance kits. Quality products, competitive prices, delivered across Kenya.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl font-semibold transition-all border border-white/20">
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: 'Certified Dealer', desc: 'Authorized CET Partner' },
              { icon: Truck, label: 'Free Delivery', desc: 'On All Orders Nationwide' },
              { icon: Headphones, label: 'Expert Support', desc: 'Technical Assistance' },
              { icon: CheckCircle, label: 'Quality Guarantee', desc: 'Genuine Products Only' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <badge.icon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{badge.label}</p>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Category Buttons */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Find What You Need</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Browse our extensive catalog of printers, toners, and consumables from leading brands</p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search printers, toners, maintenance kits..."
                className="w-full pl-12 pr-32 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#1a365d] hover:bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Search
              </button>
            </div>
          </form>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categoryCards.map((cat, i) => (
              <Link key={i} to={`/collections/${cat.handle}`}
                className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color}`} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{cat.label}</h3>
                  <p className="text-white/70 text-sm">{cat.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium">
                    Browse <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-500">Our most popular printers and consumables</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* On Sale / Discounted */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
                <Layers className="w-4 h-4" /> Special Offers
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">On Sale Now</h2>
              <p className="text-gray-500">Grab these deals before they're gone</p>
            </div>
            <Link to="/collections/on-sale" className="hidden md:flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors">
              All Deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/60 rounded-xl animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {saleProducts.map(product => (
                <ProductCard key={product.id} product={product} showSaleBadge />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#1a365d] py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Need a Printer Lease or Bulk Order?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            We offer flexible leasing options and competitive bulk pricing for businesses of all sizes. Get in touch with our team for a customized quote.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg">
              Request a Quote
            </Link>
            <a href="tel:+254700000000" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl font-semibold transition-all border border-white/20">
              Call Us Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

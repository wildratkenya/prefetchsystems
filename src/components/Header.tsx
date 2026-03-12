import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Search, Menu, X, Phone, Mail, ChevronDown, Shield } from 'lucide-react';
const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/699c6111136bd966ef67d342_1771935144580_898e7478.png';
const Header: React.FC = () => {
  const {
    cartCount,
    isCartOpen,
    setIsCartOpen,
    cart,
    cartTotal,
    removeFromCart
  } = useCart();
  const {
    isAdmin
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collections, setCollections] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shopDropdown, setShopDropdown] = useState(false);
  useEffect(() => {
    const fetchCollections = async () => {
      const {
        data
      } = await supabase.from('ecom_collections').select('id, title, handle').eq('is_visible', true);
      if (data) setCollections(data.filter(c => !['featured', 'on-sale'].includes(c.handle)));
    };
    fetchCollections();
  }, []);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };
  const formatKES = (cents: number) => 'KES ' + (cents / 100).toLocaleString('en-KE');
  const navLinks = [{
    label: 'Home',
    path: '/'
  }, {
    label: 'Shop',
    path: '/shop',
    hasDropdown: true
  }, {
    label: 'Contact',
    path: '/contact'
  }];
  return <>
      {/* Top bar */}
      <div className="bg-[#1a365d] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="tel:+254700000000" className="flex items-center gap-1 hover:text-red-300 transition-colors"><Phone className="w-3 h-3" /> +254 721337781</a>
            <a href="mailto:info@prefetchsystems.co.ke" className="hidden sm:flex items-center gap-1 hover:text-red-300 transition-colors">
              <Mail className="w-3 h-3" /> info@prefetchsystems.co.ke
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline">Certified CET & Konica Minolta Dealers</span>
            <span className="text-green-300 font-medium">Free Delivery in Nairobi & Environs on All Orders</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src={LOGO_URL} alt="Prefetch Systems" className="h-12 md:h-14 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => <div key={link.path} className="relative" onMouseEnter={() => link.hasDropdown && setShopDropdown(true)} onMouseLeave={() => setShopDropdown(false)}>
                  <Link to={link.path} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${location.pathname === link.path ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50 hover:text-[#1a365d]'}`}>
                    {link.label}
                    {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5" />}
                  </Link>
                  {link.hasDropdown && shopDropdown && <div className="absolute top-full left-0 bg-white shadow-xl rounded-lg border border-gray-100 py-2 min-w-[220px] z-50">
                      <Link to="/shop" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
                        All Products
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      {collections.map(col => <Link key={col.id} to={`/collections/${col.handle}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                          {col.title}
                        </Link>)}
                    </div>}
                </div>)}
              {isAdmin && <Link to="/admin" className="px-4 py-2 rounded-lg text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>}
            </nav>

            {/* Search + Cart + Mobile Menu */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <button onClick={() => setIsCartOpen(!isCartOpen)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>}
              </button>

              {/* Mobile menu */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && <form onSubmit={handleSearch} className="mt-3 flex gap-2">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search printers, toners, consumables..." className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" autoFocus />
              <button type="submit" className="bg-[#1a365d] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                Search
              </button>
            </form>}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {link.label}
                </Link>)}
              {collections.map(col => <Link key={col.id} to={`/collections/${col.handle}`} onClick={() => setMobileMenuOpen(false)} className="block px-8 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
                  {col.title}
                </Link>)}
              {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-medium text-amber-700 bg-amber-50">
                  Admin Dashboard
                </Link>}
            </div>
          </div>}
      </header>

      {/* Cart Sidebar */}
      {isCartOpen && <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setIsCartOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900" data-mixed-content="true" data-mixed-content="true">Shopping Cart ({cartCount})</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Your cart is empty</p>
                </div> : cart.map(item => <div key={item.product_id + (item.variant_id || '')} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                  {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    {item.variant_title && <p className="text-xs text-gray-500">{item.variant_title}</p>}
                    <p className="text-sm font-bold text-[#1a365d] mt-1" data-mixed-content="true" data-mixed-content="true">{formatKES(item.price)} x {item.quantity}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.product_id, item.variant_id)} className="text-gray-400 hover:text-red-500 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>)}
            </div>
            {cart.length > 0 && <div className="border-t p-4 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#1a365d]">{formatKES(cartTotal)}</span>
                </div>
                <p className="text-xs text-green-600 font-medium">Free shipping on all orders</p>
                <button onClick={() => {
            setIsCartOpen(false);
            navigate('/cart');
          }} className="w-full bg-[#1a365d] text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                  View Cart & Checkout
                </button>
              </div>}
          </div>
        </>}
    </>;
};
export default Header;
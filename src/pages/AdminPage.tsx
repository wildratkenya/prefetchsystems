import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Shield, Package, DollarSign, BarChart3, Users, LogOut, Plus, Trash2, Edit, Eye, MessageSquare, RefreshCw, Search } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { isAdmin, login, logout, adminEmail } = useAuth();
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [mpesaTransactions, setMpesaTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: '', handle: '', description: '', price: '', sku: '', inventory_qty: '', product_type: 'Printers', vendor: '', images: '', status: 'active' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginForm.email, loginForm.password);
    if (!success) setLoginError('Invalid credentials. Use admin@prefetchsystems.co.ke / admin123');
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'dashboard' || activeTab === 'products') {
      const { data } = await supabase.from('ecom_products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
    }
    if (activeTab === 'dashboard' || activeTab === 'orders') {
      const { data } = await supabase.from('ecom_orders').select('*, customer:ecom_customers(name, email)').order('created_at', { ascending: false }).limit(50);
      if (data) setOrders(data);
    }
    if (activeTab === 'dashboard' || activeTab === 'mpesa') {
      const { data } = await supabase.from('mpesa_transactions').select('*').order('created_at', { ascending: false }).limit(50);
      if (data) setMpesaTransactions(data);
    }
    if (activeTab === 'dashboard' || activeTab === 'analytics') {
      const { data } = await supabase.from('site_analytics').select('*').order('created_at', { ascending: false }).limit(100);
      if (data) setAnalytics(data);
    }
    if (activeTab === 'contacts') {
      const { data } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
      if (data) setContacts(data);
    }
    setLoading(false);
  };

  const formatKES = (cents: number) => 'KES ' + (cents / 100).toLocaleString('en-KE');

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: productForm.name,
      handle: productForm.handle || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: productForm.description,
      price: Math.round(parseFloat(productForm.price) * 100),
      sku: productForm.sku,
      inventory_qty: parseInt(productForm.inventory_qty) || 0,
      product_type: productForm.product_type,
      vendor: productForm.vendor,
      images: productForm.images ? productForm.images.split(',').map(s => s.trim()) : [],
      status: productForm.status,
      has_variants: false,
    };

    if (editProduct) {
      await supabase.from('ecom_products').update(productData).eq('id', editProduct.id);
    } else {
      await supabase.from('ecom_products').insert(productData);
    }

    setShowProductForm(false);
    setEditProduct(null);
    setProductForm({ name: '', handle: '', description: '', price: '', sku: '', inventory_qty: '', product_type: 'Printers', vendor: '', images: '', status: 'active' });
    fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('ecom_products').delete().eq('id', id);
      fetchData();
    }
  };

  const handleEditProduct = (product: any) => {
    setEditProduct(product);
    setProductForm({
      name: product.name,
      handle: product.handle,
      description: product.description || '',
      price: (product.price / 100).toString(),
      sku: product.sku || '',
      inventory_qty: (product.inventory_qty || 0).toString(),
      product_type: product.product_type || 'Printers',
      vendor: product.vendor || '',
      images: (product.images || []).join(', '),
      status: product.status || 'active',
    });
    setShowProductForm(true);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#1a365d] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="text-gray-500 text-sm mt-1">Prefetch Systems Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-[#1a365d] text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pageViews = analytics.filter(a => a.event_type === 'pageview').length;
  const productViews = analytics.filter(a => a.event_type === 'product_view').length;
  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.total || 0), 0);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: DollarSign },
    { id: 'mpesa', label: 'M-Pesa', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: Eye },
    { id: 'contacts', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-[#1a365d] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">Admin Dashboard</h1>
              <p className="text-xs text-gray-300">{adminEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
                { label: 'Total Orders', value: orders.length, icon: DollarSign, color: 'bg-green-50 text-green-600' },
                { label: 'Revenue', value: formatKES(totalRevenue), icon: DollarSign, color: 'bg-amber-50 text-amber-600' },
                { label: 'Page Views', value: pageViews, icon: Eye, color: 'bg-purple-50 text-purple-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{order.customer?.name || 'Guest'}</p>
                        <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatKES(order.total)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-gray-400 text-sm">No orders yet</p>}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Recent M-Pesa Payments</h3>
                <div className="space-y-3">
                  {mpesaTransactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{tx.phone_number}</p>
                        <p className="text-gray-500 text-xs">{tx.mpesa_receipt_number || 'Pending'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">KES {tx.amount?.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : tx.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {mpesaTransactions.length === 0 && <p className="text-gray-400 text-sm">No transactions yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Products ({products.length})</h2>
              <button onClick={() => { setShowProductForm(true); setEditProduct(null); setProductForm({ name: '', handle: '', description: '', price: '', sku: '', inventory_qty: '', product_type: 'Printers', vendor: '', images: '', status: 'active' }); }}
                className="bg-[#1a365d] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {showProductForm && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Name *</label>
                      <input required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Handle (URL slug)</label>
                      <input value={productForm.handle} onChange={e => setProductForm({ ...productForm, handle: e.target.value })}
                        placeholder="auto-generated" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (KES) *</label>
                      <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU</label>
                      <input value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Inventory</label>
                      <input type="number" value={productForm.inventory_qty} onChange={e => setProductForm({ ...productForm, inventory_qty: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select value={productForm.product_type} onChange={e => setProductForm({ ...productForm, product_type: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-white">
                        <option>Printers</option>
                        <option>Toners</option>
                        <option>Maintenance Kits</option>
                        <option>Consumables</option>
                        <option>Spare Parts</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Vendor/Brand</label>
                      <input value={productForm.vendor} onChange={e => setProductForm({ ...productForm, vendor: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select value={productForm.status} onChange={e => setProductForm({ ...productForm, status: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-white">
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea rows={3} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URLs (comma separated)</label>
                    <input value={productForm.images} onChange={e => setProductForm({ ...productForm, images: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="bg-[#1a365d] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                      {editProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    <button type="button" onClick={() => { setShowProductForm(false); setEditProduct(null); }}
                      className="border border-gray-200 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                            <div>
                              <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.vendor} / {product.product_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{product.sku || '-'}</td>
                        <td className="px-4 py-3 font-medium">{formatKES(product.price)}</td>
                        <td className="px-4 py-3">{product.inventory_qty ?? '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditProduct(product)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Orders ({orders.length})</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Order ID</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{order.customer?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-500">{order.customer?.email}</p>
                        </td>
                        <td className="px-4 py-3 font-bold">{formatKES(order.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No orders yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* M-Pesa Transactions */}
        {activeTab === 'mpesa' && (
          <div>
            <h2 className="text-xl font-bold mb-6">M-Pesa Transactions ({mpesaTransactions.length})</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Receipt</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mpesaTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{tx.phone_number}</td>
                        <td className="px-4 py-3 font-bold">KES {tx.amount?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-xs">{tx.mpesa_receipt_number || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : tx.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(tx.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {mpesaTransactions.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No transactions yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Site Analytics</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <p className="text-3xl font-bold text-[#1a365d]">{pageViews}</p>
                <p className="text-sm text-gray-500">Page Views</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <p className="text-3xl font-bold text-[#1a365d]">{productViews}</p>
                <p className="text-sm text-gray-500">Product Views</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <p className="text-3xl font-bold text-[#1a365d]">{analytics.filter(a => a.event_type === 'contact_form_submit').length}</p>
                <p className="text-sm text-gray-500">Contact Submissions</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Page</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Event</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {analytics.slice(0, 30).map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{a.page}</td>
                        <td className="px-4 py-3"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{a.event_type}</span></td>
                        <td className="px-4 py-3 text-gray-500">{new Date(a.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Contacts */}
        {activeTab === 'contacts' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Contact Messages ({contacts.length})</h2>
            <div className="space-y-4">
              {contacts.map(c => (
                <div key={c.id} className="bg-white rounded-xl shadow-sm border p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <p className="text-sm text-gray-500">{c.email} {c.phone && `| ${c.phone}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'new' ? 'bg-blue-100 text-blue-700' : c.status === 'read' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                        {c.status}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {c.subject && <p className="text-sm font-medium text-gray-700 mb-1">{c.subject}</p>}
                  <p className="text-sm text-gray-600">{c.message}</p>
                </div>
              ))}
              {contacts.length === 0 && <p className="text-center text-gray-400 py-8">No messages yet</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, ArrowRight, Truck } from 'lucide-react';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  const formatKES = (cents: number) => 'KES ' + (cents / 100).toLocaleString('en-KE');

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Browse our products and add items to your cart</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-[#1a365d] text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({cartCount} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.product_id + (item.variant_id || '')} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  {item.variant_title && <p className="text-sm text-gray-500">{item.variant_title}</p>}
                  <p className="text-lg font-bold text-[#1a365d] mt-1">{formatKES(item.price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeFromCart(item.product_id, item.variant_id)}
                      className="ml-auto text-gray-400 hover:text-red-500 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatKES(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4">
              <Link to="/shop" className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span className="font-medium">{formatKES(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Affordable 
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#1a365d]">{formatKES(cartTotal)}</span>
                </div>
              </div>

              <button onClick={() => navigate('/checkout')}
                className="w-full bg-[#1a365d] text-white py-3.5 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 bg-green-50 rounded-lg p-3 flex items-center gap-2">
                <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">M-PESA</div>
                <span className="text-xs text-green-800">Pay securely via M-Pesa STK Push</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

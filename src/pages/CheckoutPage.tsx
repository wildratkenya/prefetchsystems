import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Phone, CreditCard, Loader2, Check, AlertCircle, Truck, Shield } from 'lucide-react';
const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartTotal,
    clearCart
  } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    county: ''
  });
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'sending' | 'waiting' | 'success' | 'failed'>('idle');
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [orderId, setOrderId] = useState('');
  const formatKES = (cents: number) => 'KES ' + (cents / 100).toLocaleString('en-KE');
  useEffect(() => {
    if (cart.length === 0 && step !== 'success') navigate('/cart');
  }, [cart, step, navigate]);
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMpesaPhone(shippingAddress.phone);
    setStep('payment');
  };
  const createOrder = async (paymentRef?: string) => {
    try {
      const {
        data: customer
      } = await supabase.from('ecom_customers').upsert({
        email: shippingAddress.email,
        name: shippingAddress.name,
        phone: shippingAddress.phone
      }, {
        onConflict: 'email'
      }).select('id').single();
      const {
        data: order
      } = await supabase.from('ecom_orders').insert({
        customer_id: customer?.id,
        status: 'paid',
        subtotal: cartTotal,
        tax: 0,
        shipping: 0,
        total: cartTotal,
        shipping_address: shippingAddress,
        stripe_payment_intent_id: paymentRef || null,
        notes: `M-Pesa Payment: ${paymentRef || 'N/A'}`
      }).select('id').single();
      if (order) {
        setOrderId(order.id);
        const orderItems = cart.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          product_name: item.name,
          variant_title: item.variant_title || null,
          sku: item.sku || null,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.price * item.quantity
        }));
        await supabase.from('ecom_order_items').insert(orderItems);
        if (transactionId) {
          await supabase.from('mpesa_transactions').update({
            order_id: order.id
          }).eq('id', transactionId);
        }

        // Send confirmation email
        await supabase.functions.invoke('send-order-confirmation', {
          body: {
            orderId: order.id,
            customerEmail: shippingAddress.email,
            customerName: shippingAddress.name,
            orderItems,
            subtotal: cartTotal,
            shipping: 0,
            tax: 0,
            total: cartTotal,
            shippingAddress
          }
        });
      }
      clearCart();
      setStep('success');
    } catch (err) {
      console.error('Order creation error:', err);
    }
  };
  const handleMpesaPay = async () => {
    if (!mpesaPhone) return;
    setMpesaStatus('sending');
    setMpesaMessage('Sending STK Push to your phone...');
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: mpesaPhone,
          amount: Math.round(cartTotal / 100)
        }
      });
      if (error || !data?.success) {
        setMpesaStatus('failed');
        setMpesaMessage(data?.error || error?.message || 'Failed to send STK Push');
        return;
      }
      setTransactionId(data.transactionId);
      setMpesaStatus('waiting');
      setMpesaMessage('Please enter your M-Pesa PIN on your phone...');

      // Poll for status
      let pollCount = 0;
      const pollInterval = setInterval(async () => {
        pollCount++;
        const {
          data: statusData
        } = await supabase.functions.invoke('mpesa-stk-push', {
          body: {
            action: 'check-status',
            orderId: data.transactionId
          }
        });
        if (statusData?.transaction?.status === 'completed') {
          clearInterval(pollInterval);
          setMpesaStatus('success');
          setMpesaMessage('Payment successful! Creating your order...');
          await createOrder(statusData.transaction.mpesa_receipt_number);
        } else if (statusData?.transaction?.status === 'failed') {
          clearInterval(pollInterval);
          setMpesaStatus('failed');
          setMpesaMessage('Payment failed. Please try again.');
        } else if (pollCount >= 20) {
          clearInterval(pollInterval);
          setMpesaStatus('failed');
          setMpesaMessage('Payment timed out. Please try again.');
        }
      }, 3000);
    } catch (err: any) {
      setMpesaStatus('failed');
      setMpesaMessage(err.message || 'An error occurred');
    }
  };
  if (step === 'success') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
          {orderId && <p className="text-sm text-gray-400 mb-4" data-mixed-content="true">Order #{orderId.slice(0, 8).toUpperCase()}</p>}
          <p className="text-sm text-gray-500 mb-6">A confirmation email has been sent to <strong>{shippingAddress.email}</strong></p>
          <div className="space-y-3">
            <Link to="/shop" className="block w-full bg-[#1a365d] text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors">
              Continue Shopping
            </Link>
            <Link to="/" className="block w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-[#1a365d] font-bold' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'shipping' ? 'bg-[#1a365d] text-white' : 'bg-green-100 text-green-600'}`}>
              {step !== 'shipping' ? <Check className="w-4 h-4" /> : '1'}
            </div>
            Shipping
          </div>
          <div className="flex-1 h-0.5 bg-gray-200" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-[#1a365d] font-bold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'payment' ? 'bg-[#1a365d] text-white' : 'bg-gray-100 text-gray-400'}`}>
              2
            </div>
            Payment
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            {step === 'shipping' && <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#1a365d]" /> Shipping Information
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input required value={shippingAddress.name} onChange={e => setShippingAddress({
                    ...shippingAddress,
                    name: e.target.value
                  })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input required type="email" value={shippingAddress.email} onChange={e => setShippingAddress({
                    ...shippingAddress,
                    email: e.target.value
                  })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (M-Pesa) *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input required value={shippingAddress.phone} onChange={e => setShippingAddress({
                    ...shippingAddress,
                    phone: e.target.value
                  })} placeholder="0712 345 678" className="w-full pl-10 pr-4 border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                    <input required value={shippingAddress.address} onChange={e => setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value
                })} placeholder="Street address, building, floor" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input required value={shippingAddress.city} onChange={e => setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value
                  })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
                      <select value={shippingAddress.county} onChange={e => setShippingAddress({
                    ...shippingAddress,
                    county: e.target.value
                  })} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                        <option value="">Select County</option>
                        {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kiambu', 'Machakos', 'Kajiado', 'Nyeri', 'Thika'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#1a365d] text-white py-3.5 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                    Continue to Payment <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </form>
              </div>}

            {/* Payment */}
            {step === 'payment' && <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button onClick={() => setPaymentMethod('mpesa')} className={`p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'mpesa' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">M-PESA</div>
                      </div>
                      <p className="text-sm text-gray-600">Lipa Na M-Pesa</p>
                      <p className="text-xs text-gray-400 mt-1">STK Push to your phone</p>
                    </button>
                    <button onClick={() => setPaymentMethod('card')} className={`p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-sm">Card Payment</span>
                      </div>
                      <p className="text-sm text-gray-600">Visa, Mastercard</p>
                      <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                    </button>
                  </div>

                  {/* M-Pesa Payment */}
                  {paymentMethod === 'mpesa' && <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-800 text-sm mb-2">How M-Pesa STK Push Works:</h3>
                        <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                          <li>Enter your M-Pesa registered phone number</li>
                          <li>Click "Pay via M-Pesa" button below</li>
                          <li>You'll receive a prompt on your phone</li>
                          <li>Enter your M-Pesa PIN to confirm payment</li>
                        </ol>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} placeholder="0712 345 678" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                      </div>

                      {mpesaMessage && <div className={`p-4 rounded-lg flex items-start gap-3 ${mpesaStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : mpesaStatus === 'failed' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
                          {(mpesaStatus === 'sending' || mpesaStatus === 'waiting') && <Loader2 className="w-5 h-5 animate-spin flex-shrink-0 mt-0.5" />}
                          {mpesaStatus === 'success' && <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                          {mpesaStatus === 'failed' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                          <div>
                            <p className="text-sm font-medium">{mpesaMessage}</p>
                            {mpesaStatus === 'waiting' && <p className="text-xs mt-1 opacity-70">Waiting for confirmation... Do not close this page.</p>}
                          </div>
                        </div>}

                      <button onClick={handleMpesaPay} disabled={!mpesaPhone || mpesaStatus === 'sending' || mpesaStatus === 'waiting' || mpesaStatus === 'success'} className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
                        {mpesaStatus === 'sending' || mpesaStatus === 'waiting' ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : mpesaStatus === 'success' ? <><Check className="w-5 h-5" /> Payment Successful</> : <>
                            <div className="bg-white text-green-600 text-xs font-bold px-2 py-0.5 rounded">M-PESA</div>
                            Pay {formatKES(cartTotal)}
                          </>}
                      </button>

                      {mpesaStatus === 'failed' && <button onClick={() => {
                  setMpesaStatus('idle');
                  setMpesaMessage('');
                }} className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                          Try Again
                        </button>}
                    </div>}

                  {/* Card Payment - Coming Soon */}
                  {paymentMethod === 'card' && <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
                      <CreditCard className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                      <h3 className="font-semibold text-yellow-800 mb-2">Card Payment Coming Soon</h3>
                      <p className="text-sm text-yellow-700 mb-4">
                        We're setting up card payment processing. In the meantime, please use M-Pesa to complete your purchase.
                      </p>
                      <button onClick={() => setPaymentMethod('mpesa')} className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
                        Switch to M-Pesa
                      </button>
                    </div>}
                </div>

                <button onClick={() => setStep('shipping')} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Shipping
                </button>
              </div>}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {cart.map(item => <div key={item.product_id + (item.variant_id || '')} className="flex gap-3">
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      {item.variant_title && <p className="text-xs text-gray-500">{item.variant_title}</p>}
                      <p className="text-xs text-gray-500" data-mixed-content="true">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap">{formatKES(item.price * item.quantity)}</p>
                  </div>)}
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatKES(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Free
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#1a365d]">{formatKES(cartTotal)}</span>
                </div>
              </div>

              {/* Shipping Address Preview */}
              {step === 'payment' && shippingAddress.name && <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Ship to</h3>
                    <button onClick={() => setStep('shipping')} className="text-xs text-red-600 hover:text-red-700">Edit</button>
                  </div>
                  <p className="text-sm text-gray-600">{shippingAddress.name}</p>
                  <p className="text-xs text-gray-500">{shippingAddress.address}</p>
                  <p className="text-xs text-gray-500">{shippingAddress.city}{shippingAddress.county ? `, ${shippingAddress.county}` : ''}</p>
                  <p className="text-xs text-gray-500">{shippingAddress.phone}</p>
                </div>}

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5" /> Secure & encrypted checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default CheckoutPage;
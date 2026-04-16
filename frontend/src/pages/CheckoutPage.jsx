// src/pages/CheckoutPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentAPI, orderAPI } from '../services/api';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=address, 2=review, 3=payment
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  const shipping  = totalPrice >= 999 ? 0 : 79;
  const grandTotal = totalPrice + shipping;

  const handleAddressChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAddress = () => {
    const { fullName, phone, street, city, state, pincode } = address;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      toast.error('Please fill in all address fields');
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Enter a valid 10-digit phone number');
      return false;
    }
    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleRazorpayPayment = async () => {
    if (!validateAddress()) return;
    setLoading(true);

    try {
      // Step 1: Create Razorpay order on backend
      const { data: orderData } = await paymentAPI.createOrder(grandTotal);

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Drip Store',
        description: `Order for ${items.length} item(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email,
        },
        theme: { color: '#f97316' },

        handler: async (response) => {
          try {
            // Step 3: Verify signature
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Step 4: Create order in DB
            const orderItems = items.map((item) => ({
              product: item.product._id,
              name: item.product.name,
              image: item.product.images?.[0],
              price: item.price,
              quantity: item.quantity,
              size: item.size,
            }));

            const { data: savedOrder } = await orderAPI.create({
              items: orderItems,
              shippingAddress: address,
              itemsTotal: totalPrice,
              shippingPrice: shipping,
              totalAmount: grandTotal,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            clearCart();
            navigate(`/order-success/${savedOrder.order._id}`);
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
            navigate('/order-failure');
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setLoading(false);
        navigate('/order-failure');
      });
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="section-title mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-4 mb-10">
        {[{ n: 1, label: 'Address' }, { n: 2, label: 'Review' }, { n: 3, label: 'Payment' }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step > s.n ? 'bg-green-500 text-white' :
              step === s.n ? 'bg-primary-500 text-white' :
              'bg-white/10 text-gray-500'
            }`}>
              {step > s.n ? <FiCheck size={14} /> : s.n}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step >= s.n ? 'text-white' : 'text-gray-600'}`}>
              {s.label}
            </span>
            {i < 2 && <div className={`h-px flex-1 min-w-[2rem] ${step > s.n ? 'bg-green-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-white text-lg mb-5">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Full Name *</label>
                  <input name="fullName" value={address.fullName} onChange={handleAddressChange} className="input" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Phone *</label>
                  <input name="phone" value={address.phone} onChange={handleAddressChange} className="input" placeholder="10-digit mobile" maxLength={10} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Street Address *</label>
                  <input name="street" value={address.street} onChange={handleAddressChange} className="input" placeholder="House no, Street, Area" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">City *</label>
                  <input name="city" value={address.city} onChange={handleAddressChange} className="input" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Pincode *</label>
                  <input name="pincode" value={address.pincode} onChange={handleAddressChange} className="input" placeholder="400001" maxLength={6} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">State *</label>
                  <select name="state" value={address.state} onChange={handleAddressChange} className="input">
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => { if (validateAddress()) setStep(2); }} className="btn-primary w-full mt-6 py-3">
                Continue to Review →
              </button>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-white text-lg mb-5">Review Your Order</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                    <img src={item.product.images?.[0]} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg bg-white/5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-white mb-2">Delivery to:</h3>
                <p className="text-sm text-gray-400">{address.fullName}</p>
                <p className="text-sm text-gray-400">{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                <p className="text-sm text-gray-400">📱 {address.phone}</p>
                <button onClick={() => setStep(1)} className="text-xs text-primary-400 mt-2 hover:text-primary-300">Edit address</button>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Proceed to Pay →</button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-white text-lg mb-5">Payment</h2>
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                <FiLock className="text-primary-400 flex-shrink-0" />
                <p className="text-sm text-gray-400">
                  Payments are processed securely via <span className="text-white font-medium">Razorpay</span>. Your card details are never stored.
                </p>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Items Total</span><span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
                  <span>Total Payable</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1">← Back</button>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  <FiLock size={16} />
                  {loading ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-white mb-4">Order Summary</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-xs text-gray-400">
                <img src={item.product.images?.[0]} alt="" className="w-8 h-8 rounded object-cover bg-white/5" />
                <span className="flex-1 line-clamp-1">{item.product.name}</span>
                <span>×{item.quantity}</span>
                <span className="text-white font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <hr className="border-white/10 my-4" />
          <div className="flex justify-between font-bold text-white">
            <span>Total</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

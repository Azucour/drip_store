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

  const [step, setStep] = useState(1);
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
      const { data: orderData } = await paymentAPI.createOrder(grandTotal);

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
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

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
      <h1 className="section-title mb-8 text-black">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-10">
        {[{ n: 1, label: 'Address' }, { n: 2, label: 'Review' }, { n: 3, label: 'Payment' }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step > s.n ? 'bg-green-500 text-white' :
              step === s.n ? 'bg-primary-500 text-white' :
              'bg-gray-200 text-gray-600'
            }`}>
              {step > s.n ? <FiCheck size={14} /> : s.n}
            </div>

            <span className={`text-sm font-medium hidden sm:block ${
              step >= s.n ? 'text-black' : 'text-gray-500'
            }`}>
              {s.label}
            </span>

            {i < 2 && (
              <div className={`h-px flex-1 min-w-[2rem] ${
                step > s.n ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2">

          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-black text-lg mb-5">Shipping Address</h2>

              <label className="text-xs text-gray-600 mb-1 block">Full Name *</label>
              <input name="fullName" value={address.fullName} onChange={handleAddressChange} className="input" />

              <label className="text-xs text-gray-600 mb-1 block mt-3">Phone *</label>
              <input name="phone" value={address.phone} onChange={handleAddressChange} className="input" />

              <label className="text-xs text-gray-600 mb-1 block mt-3">Street *</label>
              <input name="street" value={address.street} onChange={handleAddressChange} className="input" />

              <label className="text-xs text-gray-600 mb-1 block mt-3">City *</label>
              <input name="city" value={address.city} onChange={handleAddressChange} className="input" />

              <label className="text-xs text-gray-600 mb-1 block mt-3">Pincode *</label>
              <input name="pincode" value={address.pincode} onChange={handleAddressChange} className="input" />

              <button onClick={() => validateAddress() && setStep(2)} className="btn-primary w-full mt-6 py-3">
                Continue to Review →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-black text-lg mb-5">Review Your Order</h2>

              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-0">
                  <img src={item.product.images?.[0]} className="w-14 h-14 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-600">Size: {item.size} · Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-black">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}

              <button onClick={() => setStep(3)} className="btn-primary w-full mt-6 py-3">
                Proceed to Pay →
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-semibold text-black text-lg mb-5">Payment</h2>

              <button onClick={handleRazorpayPayment} className="btn-primary w-full py-3">
                Pay ₹{grandTotal.toLocaleString('en-IN')}
              </button>
            </div>
          )}

        </div>

        {/* RIGHT */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-black mb-4">Order Summary</h3>

          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="flex-1 line-clamp-1">{item.product.name}</span>
              <span>×{item.quantity}</span>
              <span className="text-black font-medium">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </span>
            </div>
          ))}

          <hr className="border-gray-200 my-4" />

          <div className="flex justify-between font-bold text-black">
            <span>Total</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
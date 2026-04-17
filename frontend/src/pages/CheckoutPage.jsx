// src/pages/CheckoutPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentAPI, orderAPI } from '../services/api';

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

  const shipping = totalPrice >= 999 ? 0 : 79;
  const grandTotal = totalPrice + shipping;

  const handleAddressChange = (e) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAddress = () => {
    const { fullName, phone, street, city, state, pincode } = address;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      toast.error('Fill all fields');
      return false;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Invalid phone number');
      return false;
    }
    if (!/^\d{6}$/.test(pincode)) {
      toast.error('Invalid pincode');
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

        theme: { color: '#111827' },

        handler: async (response) => {
          try {
            await paymentAPI.verify(response);

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
            });

            clearCart();
            navigate(`/order-success/${savedOrder.order._id}`);
          } catch {
            toast.error('Payment verification failed');
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
      rzp.open();
    } catch (err) {
      toast.error('Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <h1 className="section-title text-black mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex gap-4 mb-10">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step >= n ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
              {step > n ? <FiCheck size={14} /> : n}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="card p-6 bg-white border border-gray-200">
              <h2 className="text-black font-semibold mb-5">Shipping Address</h2>

              <div className="grid gap-4">
                <input className="input" name="fullName" placeholder="Full Name"
                  value={address.fullName} onChange={handleAddressChange} />

                <input className="input" name="phone" placeholder="Phone"
                  value={address.phone} onChange={handleAddressChange} />

                <input className="input" name="street" placeholder="Street"
                  value={address.street} onChange={handleAddressChange} />

                <input className="input" name="city" placeholder="City"
                  value={address.city} onChange={handleAddressChange} />

                <input className="input" name="pincode" placeholder="Pincode"
                  value={address.pincode} onChange={handleAddressChange} />
              </div>

              <button onClick={() => validateAddress() && setStep(2)}
                className="btn-primary w-full mt-6">
                Continue
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="card p-6 bg-white border border-gray-200">
              <h2 className="text-black font-semibold mb-5">Review Order</h2>

              {items.map((item) => (
                <div key={item.key} className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-700">{item.product.name}</span>
                  <span className="text-black">₹{item.price * item.quantity}</span>
                </div>
              ))}

              <button onClick={() => setStep(3)} className="btn-primary w-full mt-6">
                Proceed to Payment
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="card p-6 bg-white border border-gray-200">

              <h2 className="text-black font-semibold mb-5">Payment</h2>

              <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6 flex items-center gap-3">
                <FiLock className="text-gray-600" />
                <p className="text-sm text-gray-600">
                  Secure payment via Razorpay
                </p>
              </div>

              <button
                onClick={handleRazorpayPayment}
                className="btn-primary w-full"
              >
                Pay ₹{grandTotal}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="card p-5 bg-white border border-gray-200">
          <h3 className="text-black font-semibold mb-4">Order Summary</h3>

          {items.map((item) => (
            <div key={item.key} className="flex justify-between text-sm text-gray-600 py-1">
              <span>{item.product.name}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <hr className="border-gray-200 my-4" />

          <div className="flex justify-between text-black font-bold">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
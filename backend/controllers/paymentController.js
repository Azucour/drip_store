const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials missing in .env');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;

  // Validate amount - must be a positive number and max ₹5,00,000
  if (!amount || isNaN(amount) || amount <= 0 || amount > 500000) {
    return res.status(400).json({ success: false, message: 'Invalid amount. Must be between ₹1 and ₹5,00,000' });
  }

  const options = {
    amount: Math.round(Number(amount) * 100), // Convert to paise
    currency: 'INR',
    receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
    notes: { userId: req.user._id.toString() },
  };

  const razorpay = getRazorpay();
  const order = await razorpay.orders.create(options);

  // Only send keyId to frontend - never send secret
  res.json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
  }

  // Validate format to prevent injection
  if (!/^order_[A-Za-z0-9]+$/.test(razorpay_order_id)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID format' });
  }
  if (!/^pay_[A-Za-z0-9]+$/.test(razorpay_payment_id)) {
    return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
  }

  // HMAC-SHA256 signature verification
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(razorpay_signature, 'hex')
  );

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
  }

  res.json({
    success: true,
    message: 'Payment verified successfully',
    paymentId: razorpay_payment_id,
  });
};

module.exports = { createRazorpayOrder, verifyPayment };
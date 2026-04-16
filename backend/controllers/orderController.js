// controllers/orderController.js - Order management
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create a new order (after payment verification)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const {
    items,
    shippingAddress,
    itemsTotal,
    shippingPrice,
    totalAmount,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items provided' });
  }

  // Reduce stock for each ordered product
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      await product.save();
    }
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    itemsTotal,
    shippingPrice,
    totalAmount,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    paidAt: Date.now(),
    statusHistory: [
      { status: 'confirmed', note: 'Payment received, order confirmed' },
    ],
  });

  res.status(201).json({ success: true, message: 'Order placed successfully', order });
};

// @desc    Get orders of logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('items.product', 'name images');

  res.json({ success: true, orders });
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Users can only see their own orders; admins can see all
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
  }

  res.json({ success: true, order });
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {};
  if (status) query.orderStatus = status;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [orders, totalCount] = await Promise.all([
    Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email'),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    orders,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalOrders: totalCount,
    },
  });
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { orderStatus, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.orderStatus = orderStatus;
  order.statusHistory.push({ status: orderStatus, note: note || `Status updated to ${orderStatus}` });

  if (orderStatus === 'delivered') {
    order.deliveredAt = Date.now();
  }

  await order.save();
  res.json({ success: true, message: 'Order status updated', order });
};

// @desc    Get admin order dashboard stats
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
const getOrderStats = async (req, res) => {
  const [totalOrders, totalRevenue, pendingOrders, recentOrders] = await Promise.all([
    Order.countDocuments({ paymentStatus: 'paid' }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.find({ paymentStatus: 'paid' })
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email'),
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      recentOrders,
    },
  });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
};

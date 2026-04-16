// server.js - Main entry point for Drip Store Backend
require('dotenv').config();
require('express-async-errors');

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss        = require('xss-clean');
const hpp        = require('hpp');

const connectDB      = require('./config/db');
const errorHandler   = require('./middleware/errorHandler');

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const uploadRoutes  = require('./routes/upload');
const paymentRoutes = require('./routes/payment');

connectDB();

const app = express();

// Security Headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsers with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
});
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
  message: { success: false, message: 'Too many payment requests, please try again later' },
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/payment', paymentLimiter);

// Data Sanitization - prevent NoSQL injection
app.use(mongoSanitize());
// Prevent XSS attacks
app.use(xss());
// Prevent HTTP Parameter Pollution
app.use(hpp({ whitelist: ['price', 'category', 'sort', 'limit', 'page', 'size'] }));

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/payment',  paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Drip Store API is running' });
});

app.all('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Drip Store server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
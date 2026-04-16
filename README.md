# 🛍️ Drip Store — Full-Stack E-Commerce

A production-ready clothing e-commerce platform built with React + Vite, Node.js + Express, MongoDB, Razorpay, and Cloudinary.

---

## 📁 Project Structure

```
drip-store/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js   # Signup, login, profile
│   │   ├── productController.js# Full product CRUD
│   │   ├── orderController.js  # Order management
│   │   ├── paymentController.js# Razorpay integration
│   │   └── uploadController.js # Image upload
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + adminOnly
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt)
│   │   ├── Product.js          # Product schema
│   │   └── Order.js            # Order + tracking schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── payment.js
│   │   └── upload.js
│   ├── utils/
│   │   └── generateToken.js    # JWT token helper
│   ├── server.js               # Express entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/         # Spinner, Skeleton, Badges, etc.
    │   │   ├── layout/         # Navbar, Footer
    │   │   └── product/        # ProductCard, ProductGrid
    │   ├── context/
    │   │   ├── AuthContext.jsx  # JWT auth state
    │   │   └── CartContext.jsx  # Cart with localStorage
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── CategoryPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx # 3-step checkout + Razorpay
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── OrderSuccessPage.jsx
    │   │   ├── OrderFailurePage.jsx
    │   │   ├── OrderTrackingPage.jsx
    │   │   ├── MyOrdersPage.jsx
    │   │   ├── SearchPage.jsx
    │   │   ├── NotFoundPage.jsx
    │   │   └── admin/
    │   │       ├── AdminLayout.jsx
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminProducts.jsx
    │   │       ├── AdminProductForm.jsx
    │   │       ├── AdminOrders.jsx
    │   │       └── AdminInventory.jsx
    │   ├── routes/
    │   │   ├── ProtectedRoute.jsx
    │   │   └── AdminRoute.jsx
    │   ├── services/
    │   │   └── api.js          # Axios instance + all API calls
    │   ├── App.jsx             # Root router
    │   ├── main.jsx
    │   └── index.css           # Tailwind + custom styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Razorpay account (test mode)

---

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Backend Environment Variables

```bash
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/drip-store?retryWrites=true&w=majority
JWT_SECRET=pick_a_long_random_secret_string_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLIENT_URL=http://localhost:5173
```

**Getting credentials:**
- **MongoDB Atlas**: Create cluster at https://cloud.mongodb.com → Connect → Get connection string
- **Cloudinary**: https://cloudinary.com → Dashboard → copy Cloud Name, API Key, API Secret
- **Razorpay**: https://dashboard.razorpay.com → Settings → API Keys → Generate Test Key

---

### 3. Frontend Environment Variables

```bash
cp frontend/.env.example frontend/.env
```

Fill in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
```

---

### 4. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App starts on http://localhost:5173
```

---

### 5. Create Admin User

After starting the backend, use this curl or Postman to create a user, then manually set `role: "admin"` in MongoDB Atlas:

```bash
# 1. Register a user via API
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@drip.com","password":"admin123"}'

# 2. In MongoDB Atlas → Browse Collections → users → find the document
# 3. Edit the document → change role from "user" to "admin"
# 4. Now log in at /login with admin credentials
# 5. Visit /admin to access the admin panel
```

---

## 🌐 Deployment

### Backend → Render

1. Push backend folder to a GitHub repo
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Root Directory**: `backend`
5. Add all environment variables from `.env` (use production values)
6. Set `NODE_ENV=production` and `CLIENT_URL=https://your-frontend.vercel.app`
7. Deploy

### Frontend → Vercel

1. Push frontend folder to a GitHub repo (or same repo)
2. Go to https://vercel.com → New Project → Import repo
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxx` (use live key for production)
5. Deploy

### Database → MongoDB Atlas

- Use the free M0 cluster for development
- For production: upgrade to M10+ for better performance
- Enable IP Whitelist: `0.0.0.0/0` (allow all) for Render deployments
- Create a dedicated DB user with only readWrite permissions

---

## 🔑 Key Features Summary

| Feature | Implementation |
|---|---|
| Auth | JWT tokens, bcrypt password hashing |
| Cart | React useReducer + localStorage persistence |
| Payment | Razorpay checkout + HMAC signature verification |
| Image Upload | Cloudinary via Multer (up to 5 images/product) |
| Search | MongoDB text index on name, description, category |
| Filters | Category, price range, size — all backend-side |
| Pagination | Server-side with configurable page size |
| Protected Routes | JWT middleware + React route guards |
| Admin Panel | Role-based access (role: "admin") |
| Order Tracking | Status history timeline with timestamps |
| Reviews | One review per user per product |
| Stock Alerts | Low stock (≤10) and out-of-stock indicators |

---

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| State | Context API + useReducer |
| Backend | Node.js, Express.js, express-async-errors |
| Database | MongoDB Atlas + Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Payments | Razorpay (create order + verify signature) |
| Images | Cloudinary + multer-storage-cloudinary |
| Icons | react-icons (Feather icons) |
| Toasts | react-hot-toast |

---

## 🧪 Testing Razorpay Payments

In test mode, use these card details on the Razorpay checkout:
- **Card**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 1234 (if prompted)

---

## 🛡️ Security Notes

- Never commit `.env` files (add to `.gitignore`)
- Use strong, unique `JWT_SECRET` in production
- Switch Razorpay to live keys only in production
- MongoDB Atlas: use IP whitelist + dedicated DB users
- All admin routes require both JWT auth + `role: "admin"` check

---

## 🔧 Common Issues

**CORS errors?**
→ Make sure `CLIENT_URL` in backend `.env` matches your frontend URL exactly.

**Cloudinary upload fails?**
→ Check your Cloud Name, API Key, API Secret are correct. Verify the folder `drip-store/products` exists or will be auto-created.

**Razorpay payment not opening?**
→ Confirm `VITE_RAZORPAY_KEY_ID` is set in frontend `.env`. The Razorpay script must load from `index.html`.

**MongoDB connection error?**
→ Whitelist your IP in Atlas → Network Access. Check the connection string has correct username/password.

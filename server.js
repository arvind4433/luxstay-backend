if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const connectDB = require("./database");
const passport = require("./services/passport");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:5178",
  "https://bookmyhotelroom.online",
  "https://www.bookmyhotelroom.online",
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
].filter(Boolean);

// ========================
// Security Middleware
// ========================

// Set secure HTTP headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // disabled so frontend assets load easily
}));

// Rate limiting — global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many authentication attempts, please try again later." },
});

// ========================
// Body Parsing
// ========================
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// ========================
// CORS
// ========================
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// ========================
// Data sanitization
// ========================
// Prevent NoSQL injection
app.use(mongoSanitize());
// Prevent XSS attacks
app.use(xss());
// Prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: ["amenities", "rating", "priceMin", "priceMax", "sort"],
}));

// ========================
// Session
// ========================
app.use(
  session({
    secret: process.env.JWT_SECRET || "luxstay_secret_session",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 20 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

connectDB();

// ========================
// Health Check
// ========================
app.get("/", (req, res) => {
  res.json({ message: "LuxStay API is running!", status: "ok", timestamp: new Date().toISOString() });
});

// ========================
// Admin Routes
// ========================
const adminAuthRoutes = require("./routes/admin/adminRoutes");
const adminUserRoutes = require("./routes/admin/userRoutes");
const adminHotelRoutes = require("./routes/admin/hotelRoutes");
const dashboardRoutes = require("./routes/admin/dashboardRoutes");
const bookingRoutes = require("./routes/admin/bookingRoutes");
const couponRoutes = require("./routes/admin/couponRoutes");
const roomRoutes = require("./routes/admin/roomRoutes");
const inventoryRoutes = require("./routes/admin/inventoryRoutes");
const paymentRoutes = require("./routes/admin/paymentRoutes");
const reviewRoutes = require("./routes/admin/reviewRoutes");
const notificationsRouter = require("./routes/admin/notificationRoutes");

app.use("/api/admin/auth", authLimiter, adminAuthRoutes);
app.use("/api/admin/user", adminUserRoutes);
app.use("/api/admin/hotel", adminHotelRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/booking", bookingRoutes);
app.use("/api/admin/coupon", couponRoutes);
app.use("/api/admin/room", roomRoutes);
app.use("/api/admin/inventory", inventoryRoutes);
app.use("/api/admin/payment", paymentRoutes);
app.use("/api/admin/review", reviewRoutes);
app.use("/api/admin/notification", notificationsRouter);

// ========================
// User Routes
// ========================
const AuthRoutes = require("./routes/user/authRoutes");
const UserRoutes = require("./routes/user/userRoutes");
const HotelRoutes = require("./routes/user/hotelRoutes");
const PaymentRoutes = require("./routes/user/paymentRoutes");
const RoomRoutes = require("./routes/user/roomRoutes");
const UserBookingRoutes = require("./routes/user/bookingRoutes");
const UserReviewRoutes = require("./routes/user/reviewRoutes");
const UserOfferRoutes = require("./routes/user/offerRoutes");
const UserNotificationRoutes = require("./routes/user/notificationRoutes");

app.use("/api/auth", authLimiter, AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/hotel", HotelRoutes);
app.use("/api/payment", PaymentRoutes);
app.use("/api/room", RoomRoutes);
app.use("/api/booking", UserBookingRoutes);
app.use("/api/review", UserReviewRoutes);
app.use("/api/offer", UserOfferRoutes);
app.use("/api/notification", UserNotificationRoutes);

// ─── Seed Route (dev only) ────────────────────────────────
const SeedRoute = require("./routes/seedRoute");
app.use("/api/seed", SeedRoute);

// ========================
// 404 Handler
// ========================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ========================
// Global Error Handler
// ========================
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ LuxStay API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

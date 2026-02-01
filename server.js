const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./database');
const path = require("path");

dotenv.config({});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get('/', (req, res) => {
  res.send('API is working!');
});


const adminAuthRoutes = require('./routes/admin/adminRoutes');

const adminUserRoutes = require('./routes/admin/userRoutes');
const adminHotelRoutes = require('./routes/admin/hotelRoutes');
const dashboardRoutes = require('./routes/admin/dashboardRoutes');

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/user', adminUserRoutes);
app.use('/api/admin/hotel', adminHotelRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

const bookingRoutes = require('./routes/admin/bookingRoutes');
const couponRoutes = require('./routes/admin/couponRoutes');
const roomRoutes = require('./routes/admin/roomRoutes');
const inventoryRoutes = require('./routes/admin/inventoryRoutes');
const paymentRoutes = require('./routes/admin/paymentRoutes');
const reviewRoutes = require('./routes/admin/reviewRoutes');
const userRoutes = require('./routes/admin/userRoutes');
const notificationsRouter = require('./routes/admin/notificationRoutes');


app.use('/api/booking', bookingRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notification', notificationsRouter);




/* User ROutes */

const AuthRoutes = require('./routes/user/authRoutes');

const UserRoutes = require('./routes/user/userRoutes');
const HotelRoutes = require('./routes/user/hotelRoutes');
const PaymentRoutes = require('./routes/user/paymentRoutes');

app.use('/api/auth', AuthRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/hotel', HotelRoutes);
app.use('/api/payment', PaymentRoutes);


app.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`Server is running at http://${process.env.HOST}:${process.env.PORT}`);
});

const AdminUser = require('../../models/AdminUser');
const Booking = require('../../models/Booking');
const Coupon = require('../../models/Coupon');
const Hotel = require('../../models/Hotel');
const Payment = require('../../models/Payment');
const Review = require('../../models/Review');
const Room = require('../../models/Room');
const User = require('../../models/User');

const Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const get = async(req,res) => {

   try {
      const bookingTotal = await Booking.find().countDocuments();
      const hotelTotal = await Hotel.find().countDocuments();
      const roomTotal = await Room.find().countDocuments();
      const guestTotal = await User.find().countDocuments();
      const adminTotal = await AdminUser.find().countDocuments();
      const reviewTotal = await Review.find().countDocuments();
      const paymentTotal = await Payment.find().countDocuments();
      const couponTotal = await Coupon.find().countDocuments();
    
      const PaymentData = await Payment.aggregate([
        {
            $group : {
                _id : "$paidAt",
                revenue : { $sum : "$amount" },
            }
        }
      ]);

      const RevenueOverview = Months.map((month, index) => {
        const paymentMonthData = PaymentData.find(data => {
          const paymentDate = new Date(data._id);
          return paymentDate.getMonth() === index;
        });
      
            return { month, revenue: paymentMonthData ? paymentMonthData.revenue : 0 };
    
      
      });


      const BookingData = await Booking.aggregate([
        {
            $group : {
                _id : "$createdAt",
                bookings : { $sum : 1 },
            }
        }
      ])
        const BookingsOverview = Months.map((month, index) => {
        const bookingMonthData = BookingData.find(data => {
          const bookingDate = new Date(data._id);
          return bookingDate.getMonth() === index;
        });
      
            return { month, bookings: bookingMonthData ? bookingMonthData.bookings : 0 };
    
      
      });
      
      const RecentBookings = await Booking.find().sort({ createdAt: -1 }).limit(10);
    
    
      const data = {
            booking : {total : bookingTotal},
            hotel : {total : hotelTotal},
            room : {total : roomTotal},
            guest : {total : guestTotal},
            user : {total : adminTotal},
            review : {total : reviewTotal},
            payment : {total : paymentTotal},
            coupon : {total : couponTotal},
            RevenueOverview,
            BookingsOverview,
            RecentBookings
        }


    res.status(200).json({ status: 'success', message: 'getMatrix successful' , data });

    
   } catch (error) {
    return res.status(500).json(error.message || "Server Error")
   }


}


module.exports = {
   get
}
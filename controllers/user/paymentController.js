const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../../models/Payment");
const Booking = require("../../models/Booking");
const Notification = require("../../models/Notification");

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

async function getUserBooking(userId, bookingId) {
  return Booking.findOne({ _id: bookingId, userId }).populate("hotelId", "name");
}

async function getUserBookings(userId, bookingIds) {
  return Booking.find({ _id: { $in: bookingIds }, userId }).populate("hotelId", "name");
}

/**
 * POST /api/payment/create
 * Create a Razorpay order for an existing booking
 */
const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { bookingId, bookingIds = [] } = req.body;
    const targetBookingIds = bookingIds.length ? bookingIds : bookingId ? [bookingId] : [];

    if (targetBookingIds.length === 0) {
      return res.status(400).json({ status: false, message: "Booking ID is required" });
    }

    if (!razorpay) {
      return res.status(500).json({ status: false, message: "Razorpay is not configured" });
    }

    const bookings = await getUserBookings(userId, targetBookingIds);
    if (bookings.length !== targetBookingIds.length) {
      return res.status(404).json({ status: false, message: "One or more bookings were not found" });
    }

    const existingPayment = await Payment.findOne({
      bookingId: { $in: bookings.map((booking) => booking._id) },
      userId,
      status: "success",
    });

    if (existingPayment) {
      return res.status(200).json({
        status: true,
        message: "Booking already paid",
        data: {
          alreadyPaid: true,
          bookingIds: bookings.map((booking) => booking._id),
          transactionId: existingPayment.transactionId,
        },
      });
    }

    const finalAmount = bookings.reduce(
      (sum, booking) => sum + Number(booking.price?.totalAmount || 0),
      0
    );
    if (!finalAmount) {
      return res.status(400).json({ status: false, message: "Booking amount is invalid" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        bookingIds: bookings.map((booking) => String(booking._id)).join(","),
        bookingRefs: bookings.map((booking) => booking.bookingId).join(", "),
        hotelName: bookings[0]?.hotelId?.name || "LuxStay",
      },
    });

    return res.status(200).json({
      status: true,
      message: "Payment order created",
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingIds: bookings.map((booking) => booking._id),
        bookingRef: bookings.map((booking) => booking.bookingId).join(", "),
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        hotelName: bookings[0]?.hotelId?.name || "LuxStay",
      },
    });
  } catch (err) {
    console.error("Create payment order error:", err);
    return res.status(500).json({ status: false, message: "Unable to create Razorpay order" });
  }
};

/**
 * POST /api/payment/verify
 * Verify Razorpay signature and mark booking as paid
 */
const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const {
      bookingId,
      bookingIds = [],
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method,
    } = req.body;

    const targetBookingIds = bookingIds.length ? bookingIds : bookingId ? [bookingId] : [];

    if (targetBookingIds.length === 0 || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ status: false, message: "Incomplete payment verification data" });
    }

    const bookings = await getUserBookings(userId, targetBookingIds);
    if (bookings.length !== targetBookingIds.length) {
      return res.status(404).json({ status: false, message: "One or more bookings were not found" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ status: false, message: "Payment signature verification failed" });
    }

    for (const booking of bookings) {
      const existingPayment = await Payment.findOne({
        bookingId: booking._id,
        transactionId: razorpay_payment_id,
        status: "success",
      });

      if (!existingPayment) {
        await Payment.create({
          bookingId: booking._id,
          userId,
          paymentGateway: "Razorpay",
          transactionId: razorpay_payment_id,
          status: "success",
          amount: booking.price?.totalAmount || 0,
          currency: "INR",
          paymentMethod: method || "razorpay",
          metadata: {
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature,
            method: method || "razorpay",
          },
        });
      }

      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";
      await booking.save();
    }

    const hotelName = bookings.length > 1
      ? `${bookings.length} bookings`
      : `${bookings[0]?.hotelId?.name || "your hotel"} booking`;

    await Notification.create({
      userId,
      title: "Payment received",
      message: `${hotelName} confirmed`,
      type: "payment",
      isRead: false,
    });

    return res.status(200).json({
      status: true,
      message: "Payment verified successfully",
      data: {
        bookingIds: bookings.map((booking) => booking._id),
        bookingRef: bookings.map((booking) => booking.bookingId).join(", "),
        transactionId: razorpay_payment_id,
      },
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    return res.status(500).json({ status: false, message: "Payment verification failed" });
  }
};

/**
 * GET /api/payment/booking/:bookingId
 */
const getPaymentByBooking = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const payment = await Payment.findOne({ bookingId: req.params.bookingId, userId });
    if (!payment) {
      return res.status(404).json({ status: false, message: "Payment not found" });
    }
    return res.status(200).json({ status: true, data: payment });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getPaymentByBooking };

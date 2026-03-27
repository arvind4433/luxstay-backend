const express = require("express");
const bookingController = require("../../controllers/user/bookingController");
const { verifyToken } = require("../../services/jwt");

const router = express.Router();

// POST /api/booking  → create booking (auth required)
router.post("/", verifyToken, bookingController.createBooking);
router.post("/confirm", verifyToken, bookingController.createBooking); // compat

// GET /api/booking/my-bookings  → user's bookings
router.get("/my-bookings", verifyToken, bookingController.getMyBookings);

// GET /api/booking/:id  → single booking
router.get("/:id", verifyToken, bookingController.getBookingById);

module.exports = router;

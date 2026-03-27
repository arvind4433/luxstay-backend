const express = require("express");
const paymentController = require("../../controllers/user/paymentController");
const { verifyToken } = require("../../services/jwt");

const router = express.Router();

router.post("/", verifyToken, paymentController.createPaymentOrder);
router.post("/create", verifyToken, paymentController.createPaymentOrder);
router.post("/verify", verifyToken, paymentController.verifyPayment);
router.get("/booking/:bookingId", verifyToken, paymentController.getPaymentByBooking);

module.exports = router;

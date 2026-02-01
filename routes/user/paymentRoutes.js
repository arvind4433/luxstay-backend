const express = require("express");
const paymentController = require("../../controllers/user/paymentController");
const { verifyToken } = require("../../services/jwt");

const router = express.Router();

router.post("/create", paymentController.createPaymentOrder);

module.exports = router;

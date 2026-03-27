const express = require("express");
const offerController = require("../../controllers/user/offerController");
const { verifyToken } = require("../../services/jwt");

const router = express.Router();

// GET /api/offer  → all active offers
router.get("/", offerController.getAll);

// GET /api/offer/code/:code  → verify single coupon
router.get("/code/:code", offerController.getByCode);

// POST /api/offer/apply  → apply coupon (calculate discount)
router.post("/apply", offerController.applyCoupon);

module.exports = router;

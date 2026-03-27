const express = require("express");
const reviewController = require("../../controllers/user/reviewController");
const { verifyToken } = require("../../services/jwt");

const router = express.Router();

// GET /api/review  → all reviews (home page highlights)
router.get("/", reviewController.getAllReviews);

// GET /api/review/hotel/:hotelId  → reviews for a hotel
router.get("/hotel/:hotelId", reviewController.getHotelReviews);

// GET /api/review/:hotelId (legacy)
router.get("/:hotelId", reviewController.getHotelReviews);

// POST /api/review  → create review (auth)
router.post("/", verifyToken, reviewController.createReview);

module.exports = router;

const Review = require("../../models/Review");
const Hotel = require("../../models/Hotel");
const Booking = require("../../models/Booking");

/**
 * GET /api/review/:hotelId  → reviews for a hotel
 */
const getHotelReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hotelId: req.params.hotelId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      message: "Reviews fetched",
      data: reviews,
      total: reviews.length,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

/**
 * GET /api/review  → all reviews (home page)
 */
const getAllReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const reviews = await Review.find({ rating: { $gte: 4 } })
      .populate("userId", "name")
      .populate("hotelId", "name address")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({ status: true, data: reviews, total: reviews.length });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

/**
 * POST /api/review  → create review (auth required)
 */
const createReview = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { hotelId, bookingId, rating, comment, title } = req.body;

    if (!hotelId || !rating || !comment) {
      return res.status(400).json({ status: false, message: "Hotel, rating and comment are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ status: false, message: "Rating must be between 1 and 5" });
    }

    // Optionally verify booking belongs to user
    if (bookingId) {
      const booking = await Booking.findOne({ _id: bookingId, userId });
      if (!booking) return res.status(403).json({ status: false, message: "You can only review hotels you have stayed at" });
    }

    // Check if user already reviewed this hotel
    const existing = await Review.findOne({ hotelId, userId });
    if (existing) {
      return res.status(409).json({ status: false, message: "You have already reviewed this hotel" });
    }

    const review = await Review.create({
      hotelId,
      userId,
      bookingId: bookingId || undefined,
      rating: Number(rating),
      comment,
      title: title || "",
    });

    // Update hotel averageRating
    const allReviews = await Review.find({ hotelId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Hotel.findByIdAndUpdate(hotelId, {
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: allReviews.length,
    });

    const populated = await review.populate("userId", "name");
    return res.status(201).json({ status: true, message: "Review submitted", data: populated });
  } catch (err) {
    console.error("Review error:", err);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = { getHotelReviews, getAllReviews, createReview };

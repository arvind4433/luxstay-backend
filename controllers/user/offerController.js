const Offer = require("../../models/OfferSchema");

/**
 * GET /api/offer  → all active offers
 */
const getAll = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      validFrom: { $lte: now },
      validTill: { $gte: now },
    }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      status: true,
      message: "Offers fetched",
      data: offers,
      total: offers.length,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

/**
 * POST /api/offer/apply  → validate coupon & return discount
 */
const applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) return res.status(400).json({ status: false, message: "Coupon code is required" });

    const now = new Date();
    const offer = await Offer.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      validFrom: { $lte: now },
      validTill: { $gte: now },
    });

    if (!offer) {
      return res.status(404).json({ status: false, message: "Invalid or expired coupon code" });
    }

    const bookingAmount = Number(amount) || 0;

    if (bookingAmount > 0 && bookingAmount < offer.minBookingAmount) {
      return res.status(400).json({
        status: false,
        message: `Minimum booking amount of ₹${offer.minBookingAmount} required for this coupon`,
      });
    }

    let discountAmount = 0;
    if (offer.discountType === "PERCENT") {
      discountAmount = Math.round((bookingAmount * offer.discountValue) / 100);
      if (offer.maxDiscount) discountAmount = Math.min(discountAmount, offer.maxDiscount);
    } else {
      discountAmount = offer.discountValue;
    }

    return res.status(200).json({
      status: true,
      message: `Coupon applied! You save ₹${discountAmount}`,
      data: {
        code: offer.code,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        discountAmount,
        discountPercentage: offer.discountType === "PERCENT" ? offer.discountValue : 0,
        finalAmount: Math.max(0, bookingAmount - discountAmount),
        offer,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

/**
 * GET /api/offer/code/:code  → verify a single coupon
 */
const getByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const now = new Date();
    const offer = await Offer.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: now },
      validTill: { $gte: now },
    });
    if (!offer) return res.status(404).json({ status: false, message: "Coupon not found or expired" });
    return res.status(200).json({ status: true, data: offer });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = { getAll, applyCoupon, getByCode };

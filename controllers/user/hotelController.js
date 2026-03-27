const Hotel = require("../../models/Hotel");
const Room = require("../../models/Room");
const Review = require("../../models/Review");

const getAll = async (req, res) => {
  try {
    const {
      location,
      city,
      minPrice,
      maxPrice,
      rating,
      stars,
      sort,
      amenities,
      search,
      limit,
      page,
    } = req.query;

    const filter = { status: "active" };
    const andFilters = [];

    if (location || city) {
      const loc = location || city;
      andFilters.push({
        $or: [
          { "address.city": { $regex: loc, $options: "i" } },
          { "address.state": { $regex: loc, $options: "i" } },
          { name: { $regex: loc, $options: "i" } },
        ],
      });
    }

    if (search) {
      andFilters.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { "address.city": { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (stars) {
      const starsArr = String(stars).split(",").map(Number).filter(Boolean);
      if (starsArr.length > 0) filter.starRating = { $in: starsArr };
    }

    if (rating) {
      filter.averageRating = { $gte: Number(rating) };
    }

    if (minPrice || maxPrice) {
      filter["pricing.basePricePerNight"] = {};
      if (minPrice) filter["pricing.basePricePerNight"].$gte = Number(minPrice);
      if (maxPrice) filter["pricing.basePricePerNight"].$lte = Number(maxPrice);
    }

    if (amenities) {
      const amenArr = String(amenities).split(",").map((a) => new RegExp(a.trim(), "i"));
      filter.amenities = { $all: amenArr };
    }

    if (andFilters.length > 0) {
      filter.$and = andFilters;
    }

    let sortObj = { isFeatured: -1, createdAt: -1 };
    if (sort === "price_asc") sortObj = { "pricing.basePricePerNight": 1 };
    else if (sort === "price_desc") sortObj = { "pricing.basePricePerNight": -1 };
    else if (sort === "rating") sortObj = { averageRating: -1 };
    else if (sort === "newest") sortObj = { createdAt: -1 };

    const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currentPage - 1) * lim;

    const hotels = await Hotel.find(filter).sort(sortObj).skip(skip).limit(lim).lean();
    const total = await Hotel.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / lim), 1);

    return res.status(200).json({
      status: true,
      message: "Hotels fetched successfully",
      data: hotels,
      total,
      page: currentPage,
      limit: lim,
      totalPages,
    });
  } catch (err) {
    console.error("Hotel getAll Error:", err);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

const get = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).lean();
    if (!hotel) return res.status(404).json({ status: false, message: "Hotel not found" });

    const rooms = await Room.find({ hotelId: req.params.id, status: "available" }).lean();
    const reviews = await Review.find({ hotelId: req.params.id })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const prices = rooms.map(r => r.basePrice).filter(Boolean);
    const priceRange = prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: hotel.pricing?.basePricePerNight || 0, max: hotel.pricing?.basePricePerNight || 0 };

    return res.status(200).json({
      status: true,
      message: "Hotel fetched successfully",
      data: { ...hotel, priceRange, price: hotel.pricing?.basePricePerNight || priceRange.min, rooms, reviews },
    });
  } catch (err) {
    console.error("Hotel get Error:", err);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = { getAll, get };

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
      propertyType,
      roomType,
      availableOnly,
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

    if (propertyType) {
      const types = String(propertyType)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (types.length) {
        filter.propertyType = { $in: types };
      }
    }

    if (amenities) {
      const amenArr = String(amenities).split(",").map((value) => new RegExp(value.trim(), "i"));
      filter.amenities = { $all: amenArr };
    }

    if (roomType || availableOnly === "true") {
      const roomFilter = {};
      if (roomType) {
        roomFilter.roomTypeName = {
          $in: String(roomType)
            .split(",")
            .map((value) => new RegExp(value.trim(), "i")),
        };
      }
      if (availableOnly === "true") {
        roomFilter.availableRooms = { $gt: 0 };
      }

      const matchingRooms = await Room.find(roomFilter).select("hotelId").lean();
      const hotelIds = [...new Set(matchingRooms.map((room) => String(room.hotelId)))];
      if (!hotelIds.length) {
        const lim = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
        return res.status(200).json({
          status: true,
          message: "Hotels fetched successfully",
          data: [],
          total: 0,
          page: 1,
          limit: lim,
          totalPages: 1,
        });
      }
      filter._id = { $in: hotelIds };
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

    const hotelIds = hotels.map((hotel) => hotel._id);
    const roomDocs = hotelIds.length ? await Room.find({ hotelId: { $in: hotelIds } }).lean() : [];
    const roomSummaryByHotel = roomDocs.reduce((acc, room) => {
      const key = String(room.hotelId);
      if (!acc[key]) {
        acc[key] = {
          roomCount: 0,
          totalInventory: 0,
          availableInventory: 0,
          roomTypes: [],
          minRoomPrice: Number.POSITIVE_INFINITY,
          maxRoomPrice: 0,
        };
      }

      acc[key].roomCount += 1;
      acc[key].totalInventory += Number(room.totalRooms || 0);
      acc[key].availableInventory += Number(room.availableRooms || 0);
      acc[key].roomTypes.push(room.roomTypeName);
      acc[key].minRoomPrice = Math.min(acc[key].minRoomPrice, Number(room.basePrice || 0) || acc[key].minRoomPrice);
      acc[key].maxRoomPrice = Math.max(acc[key].maxRoomPrice, Number(room.basePrice || 0));
      return acc;
    }, {});

    const enrichedHotels = hotels.map((hotel) => {
      const summary = roomSummaryByHotel[String(hotel._id)];
      const minRoomPrice = summary?.minRoomPrice;
      const maxRoomPrice = summary?.maxRoomPrice;

      return {
        ...hotel,
        roomCount: summary?.roomCount || 0,
        totalInventory: summary?.totalInventory || 0,
        availableInventory: summary?.availableInventory || 0,
        roomTypes: [...new Set(summary?.roomTypes || [])],
        priceRange: {
          min: Number.isFinite(minRoomPrice) ? minRoomPrice : hotel.pricing?.basePricePerNight || 0,
          max: maxRoomPrice || hotel.pricing?.basePricePerNight || 0,
        },
      };
    });

    return res.status(200).json({
      status: true,
      message: "Hotels fetched successfully",
      data: enrichedHotels,
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

    const rooms = await Room.find({ hotelId: req.params.id }).lean();
    const reviews = await Review.find({ hotelId: req.params.id })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const prices = rooms.map((room) => room.basePrice).filter(Boolean);
    const availableInventory = rooms.reduce((sum, room) => sum + Number(room.availableRooms || 0), 0);
    const totalInventory = rooms.reduce((sum, room) => sum + Number(room.totalRooms || 0), 0);

    const priceRange = prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: hotel.pricing?.basePricePerNight || 0, max: hotel.pricing?.basePricePerNight || 0 };

    return res.status(200).json({
      status: true,
      message: "Hotel fetched successfully",
      data: {
        ...hotel,
        priceRange,
        price: hotel.pricing?.basePricePerNight || priceRange.min,
        roomCount: rooms.length,
        totalInventory,
        availableInventory,
        roomTypes: [...new Set(rooms.map((room) => room.roomTypeName).filter(Boolean))],
        rooms,
        reviews,
      },
    });
  } catch (err) {
    console.error("Hotel get Error:", err);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = { getAll, get };

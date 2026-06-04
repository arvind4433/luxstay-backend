const express = require("express");
const { hotels: seedHotels, offers: seedOffers, buildRoomsForHotel } = require("../seedData");

const router = express.Router();

const REVIEW_SNIPPETS = [
  { rating: 5, comment: "The booking flow felt polished and the stay looked exactly like the preview." },
  { rating: 5, comment: "Rooms were clearly presented and the overall browsing experience felt smooth." },
  { rating: 4, comment: "Great property details, fair pricing, and a quick route from search to checkout." },
];

function createReview(hotel, index) {
  const template = REVIEW_SNIPPETS[index % REVIEW_SNIPPETS.length];
  return {
    _id: `${hotel._id}-review-${index + 1}`,
    hotelId: hotel._id,
    rating: template.rating,
    comment: template.comment,
    userId: { name: ["Aarav", "Priya", "Rohan"][index % 3] },
    hotelRef: { name: hotel.name, address: hotel.address },
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  };
}

function enrichHotel(rawHotel) {
  const hotel = {
    ...rawHotel,
    _id: rawHotel.slug || rawHotel.hotelCode,
  };

  const rooms = buildRoomsForHotel(hotel).map((room) => ({
    ...room,
    _id: `${hotel._id}-${room.roomTypeCode.toLowerCase()}`,
  }));

  const reviews = Array.from({ length: Math.min(3, Math.max(1, hotel.totalReviews ? 3 : 1)) }, (_, index) =>
    createReview(hotel, index)
  );

  const prices = rooms.map((room) => Number(room.basePrice || 0)).filter(Boolean);
  const availableInventory = rooms.reduce((sum, room) => sum + Number(room.availableRooms || 0), 0);
  const totalInventory = rooms.reduce((sum, room) => sum + Number(room.totalRooms || 0), 0);

  return {
    ...hotel,
    price: hotel.pricing?.basePricePerNight || prices[0] || 0,
    roomCount: rooms.length,
    totalInventory,
    availableInventory,
    roomTypes: [...new Set(rooms.map((room) => room.roomTypeName).filter(Boolean))],
    priceRange: {
      min: prices.length ? Math.min(...prices) : hotel.pricing?.basePricePerNight || 0,
      max: prices.length ? Math.max(...prices) : hotel.pricing?.basePricePerNight || 0,
    },
    rooms,
    reviews,
  };
}

const hotels = seedHotels.map(enrichHotel);
const rooms = hotels.flatMap((hotel) => hotel.rooms);
const reviews = hotels.flatMap((hotel) => hotel.reviews);
const offers = seedOffers.map((offer, index) => ({
  _id: `offer-${index + 1}`,
  ...offer,
}));

function applyHotelFilters(items, query = {}) {
  let filtered = [...items];
  const {
    location,
    city,
    search,
    minPrice,
    maxPrice,
    rating,
    stars,
    sort,
    propertyType,
    roomType,
    availableOnly,
  } = query;

  const searchTerm = (location || city || search || "").trim().toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter((hotel) =>
      [
        hotel.name,
        hotel.address?.city,
        hotel.address?.state,
        hotel.description,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchTerm))
    );
  }

  if (minPrice) filtered = filtered.filter((hotel) => hotel.priceRange.min >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter((hotel) => hotel.priceRange.min <= Number(maxPrice));
  if (rating) filtered = filtered.filter((hotel) => Number(hotel.averageRating || 0) >= Number(rating));

  if (stars) {
    const starSet = String(stars)
      .split(",")
      .map((value) => Number(value.trim()))
      .filter(Boolean);
    if (starSet.length) filtered = filtered.filter((hotel) => starSet.includes(Number(hotel.starRating)));
  }

  if (propertyType) {
    const types = String(propertyType)
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (types.length) filtered = filtered.filter((hotel) => types.includes(String(hotel.propertyType).toLowerCase()));
  }

  if (roomType) {
    const roomTypes = String(roomType)
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    filtered = filtered.filter((hotel) =>
      hotel.rooms.some((room) => roomTypes.some((type) => room.roomTypeName.toLowerCase().includes(type)))
    );
  }

  if (availableOnly === "true") {
    filtered = filtered.filter((hotel) => hotel.availableInventory > 0);
  }

  if (sort === "price_asc") filtered.sort((a, b) => a.priceRange.min - b.priceRange.min);
  else if (sort === "price_desc") filtered.sort((a, b) => b.priceRange.min - a.priceRange.min);
  else if (sort === "rating") filtered.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0));
  else filtered.sort((a, b) => Number(b.isFeatured || 0) - Number(a.isFeatured || 0));

  return filtered;
}

function applyRoomFilters(items, query = {}) {
  let filtered = [...items];
  const { minPrice, maxPrice, roomType, availableOnly, sort } = query;

  if (minPrice) filtered = filtered.filter((room) => Number(room.basePrice || 0) >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter((room) => Number(room.basePrice || 0) <= Number(maxPrice));
  if (roomType) {
    const term = String(roomType).trim().toLowerCase();
    filtered = filtered.filter((room) => room.roomTypeName.toLowerCase().includes(term));
  }
  if (availableOnly === "true") filtered = filtered.filter((room) => Number(room.availableRooms || 0) > 0);

  if (sort === "price_asc") filtered.sort((a, b) => a.basePrice - b.basePrice);
  else if (sort === "price_desc") filtered.sort((a, b) => b.basePrice - a.basePrice);
  else if (sort === "size_desc") filtered.sort((a, b) => Number(b.roomSize || 0) - Number(a.roomSize || 0));

  return filtered;
}

router.get("/hotel", (req, res) => {
  const all = applyHotelFilters(hotels, req.query);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const start = (page - 1) * limit;
  const paged = all.slice(start, start + limit);

  res.json({
    status: true,
    message: "Hotels fetched successfully",
    data: paged,
    total: all.length,
    page,
    limit,
    totalPages: Math.max(Math.ceil(all.length / limit), 1),
  });
});

router.get("/hotel/:id", (req, res) => {
  const hotel = hotels.find((item) => item._id === req.params.id);
  if (!hotel) return res.status(404).json({ status: false, message: "Hotel not found" });
  return res.json({ status: true, message: "Hotel fetched successfully", data: hotel });
});

router.get("/room", (req, res) => {
  const hotelId = req.query.hotelId;
  if (!hotelId) return res.status(400).json({ status: false, message: "Hotel ID is required" });
  const filtered = applyRoomFilters(rooms.filter((room) => room.hotelId === hotelId), req.query);
  return res.json({ status: true, message: "Rooms fetched successfully", data: filtered, total: filtered.length });
});

router.get("/room/hotel/:hotelId", (req, res) => {
  const filtered = applyRoomFilters(rooms.filter((room) => room.hotelId === req.params.hotelId), req.query);
  return res.json({ status: true, message: "Rooms fetched successfully", data: filtered, total: filtered.length });
});

router.get("/room/:id", (req, res) => {
  const room = rooms.find((item) => item._id === req.params.id);
  if (!room) return res.status(404).json({ status: false, message: "Room not found" });
  return res.json({ status: true, data: room });
});

router.get("/review", (req, res) => {
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
  const data = reviews.slice(0, limit).map((review) => ({
    ...review,
    hotelId: review.hotelRef,
  }));
  return res.json({ status: true, data, total: data.length });
});

router.get("/review/hotel/:hotelId", (req, res) => {
  const data = reviews
    .filter((review) => review.hotelId === req.params.hotelId)
    .map((review) => ({ ...review, hotelId: review.hotelId }));
  return res.json({ status: true, message: "Reviews fetched", data, total: data.length });
});

router.get("/review/:hotelId", (req, res) => {
  const data = reviews
    .filter((review) => review.hotelId === req.params.hotelId)
    .map((review) => ({ ...review, hotelId: review.hotelId }));
  return res.json({ status: true, message: "Reviews fetched", data, total: data.length });
});

router.get("/offer", (req, res) => {
  res.json({ status: true, data: offers.filter((offer) => offer.isActive !== false) });
});

router.get("/offer/code/:code", (req, res) => {
  const offer = offers.find((item) => item.code.toLowerCase() === String(req.params.code).toLowerCase());
  if (!offer) return res.status(404).json({ status: false, message: "Coupon not found" });
  return res.json({ status: true, data: offer });
});

router.post("/offer/apply", (req, res) => {
  const { code, amount = 0 } = req.body || {};
  const offer = offers.find((item) => item.code.toLowerCase() === String(code || "").toLowerCase());
  if (!offer) return res.status(404).json({ status: false, message: "Coupon not found" });

  const numericAmount = Number(amount || 0);
  if (offer.minBookingAmount && numericAmount < Number(offer.minBookingAmount)) {
    return res.status(400).json({ status: false, message: `Minimum booking amount is ${offer.minBookingAmount}` });
  }

  let discount = offer.discountType === "FLAT"
    ? Number(offer.discountValue || 0)
    : Math.round((numericAmount * Number(offer.discountValue || 0)) / 100);

  if (offer.maxDiscount) discount = Math.min(discount, Number(offer.maxDiscount));

  return res.json({
    status: true,
    message: "Coupon applied",
    data: {
      offer,
      originalAmount: numericAmount,
      discount,
      finalAmount: Math.max(numericAmount - discount, 0),
    },
  });
});

router.get("/notification", (req, res) => {
  res.json({ status: true, data: [], unreadCount: 0 });
});

router.get("/user/get", (req, res) => {
  res.status(401).json({ status: false, message: "Please sign in to access your profile." });
});

router.post("/payment/create", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Mock payment created",
    data: {
      orderId: `mock-order-${Date.now()}`,
      amount: req.body?.amount || 0,
      currency: "INR",
    },
  });
});

module.exports = router;

/**
 * Seed Route - POST /api/seed
 * Inserts hotels, rooms, and offers using the live MongoDB connection.
 */
const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Offer = require("../models/OfferSchema");
const { hotels, offers, buildRoomsForHotel } = require("../seedData");

router.post("/", async (req, res) => {
  const key = req.headers["x-seed-key"];
  if (key !== "luxstay_seed_2025") {
    return res.status(403).json({ status: false, message: "Forbidden" });
  }

  try {
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Offer.deleteMany({});

    const insertedHotels = await Hotel.insertMany(hotels);
    const rooms = insertedHotels.flatMap((hotel) => buildRoomsForHotel(hotel));
    const insertedRooms = await Room.insertMany(rooms);
    const insertedOffers = await Offer.insertMany(offers);

    return res.status(200).json({
      status: true,
      message: "Database seeded successfully!",
      data: {
        hotels: insertedHotels.length,
        rooms: insertedRooms.length,
        offers: insertedOffers.length,
        coupons: offers.map((offer) => offer.code),
      },
    });
  } catch (err) {
    console.error("Seed error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;

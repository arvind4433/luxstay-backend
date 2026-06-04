/**
 * LuxStay Seed Script
 * Run: node seed.js
 * Populates MongoDB with hotels, rooms, and offers
 */

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");
const Room = require("./models/Room");
const Offer = require("./models/OfferSchema");
const { hotels, offers, buildRoomsForHotel } = require("./seedData");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/luxstay";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Offer.deleteMany({});
    console.log("Cleared existing hotels, rooms, and offers");

    const insertedHotels = await Hotel.insertMany(hotels);
    console.log(`Inserted ${insertedHotels.length} hotels`);

    let totalRooms = 0;
    for (const hotel of insertedHotels) {
      const insertedRooms = await Room.insertMany(buildRoomsForHotel(hotel));
      totalRooms += insertedRooms.length;
    }
    console.log(`Inserted ${totalRooms} rooms across ${insertedHotels.length} hotels`);

    const insertedOffers = await Offer.insertMany(offers);
    console.log(`Inserted ${insertedOffers.length} offers`);

    console.log("\nSeed completed successfully");
    console.log(`Hotels: ${insertedHotels.length}`);
    console.log(`Rooms: ${totalRooms}`);
    console.log(`Offers: ${insertedOffers.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();

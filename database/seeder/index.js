import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../../models/User.js";
import Hotel from "../../models/Hotel.js";
import Room from "../../models/Room.js";
import RoomInventory from "../../models/RoomInventory.js";
import Booking from "../../models/Booking.js";
import Payment from "../../models/Payment.js";
import Review from "../../models/Review.js";

dotenv.config();

/* --------------------------------------------------
   MongoDB Connection
-------------------------------------------------- */
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
};

/* --------------------------------------------------
   Seeder Function
-------------------------------------------------- */
const seedDatabase = async () => {
  try {
    await connectDB();

    /* 🔥 Clean old data */
    await Promise.all([
      User.deleteMany(),
      Hotel.deleteMany(),
      Room.deleteMany(),
      RoomInventory.deleteMany(),
      Booking.deleteMany(),
      Payment.deleteMany(),
      Review.deleteMany()
    ]);

    /* --------------------------------------------------
       Users
    -------------------------------------------------- */
    const users = await User.insertMany([
      {
        role: "admin",
        name: "Admin User",
        username: "admin",
        email: "admin@hoteladmin.com",
        phone: "9999999999",
        password: "$2b$10$hashedpassword",
        isVerified: true,
        status: "active"
      },
      {
        role: "customer",
        name: "Rahul Sharma",
        email: "rahul@gmail.com",
        username: "rahulsharma",
        password: "$2b$10$hashedpassword",
        phone: "8888888888",
        isVerified: true,
        status: "active"
      }
    ]);

    const adminUser = users[0];
    const customerUser = users[1];

    /* --------------------------------------------------
       Hotel
    -------------------------------------------------- */
    const hotels = await Hotel.insertMany([
      {
        hotelCode: "HTL001",
        name: "Grand Palace Hotel",
        brand: "Grand Group",
        description: "Luxury hotel in city center",
        starRating: 5,
        propertyType: "Hotel",

        contact: {
          email: "info@grandpalace.com",
          phone: "01123456789"
        },

        address: {
          addressLine1: "MG Road",
          city: "Delhi",
          state: "Delhi",
          country: "India",
          pincode: "110001",
          latitude: 28.6139,
          longitude: 77.209
        },

        amenities: ["Free WiFi", "Swimming Pool", "Spa", "Gym"],

        policies: {
          checkInTime: "14:00",
          checkOutTime: "12:00",
          cancellationPolicy: "Free cancellation before 24 hours"
        },

        status: "active",
        isFeatured: true
      }
    ]);

    const hotel = hotels[0];

    /* --------------------------------------------------
       Room
    -------------------------------------------------- */
    const rooms = await Room.insertMany([
      {
        hotelId: hotel._id,
        roomTypeCode: "DLX",
        roomTypeName: "Deluxe Room",
        description: "Spacious deluxe room",
        maxAdults: 2,
        maxChildren: 1,
        bedType: "King",
        roomSize: 350,
        amenities: ["AC", "TV", "Mini Bar"],
        basePrice: 4500,
        extraAdultPrice: 1000,
        extraChildPrice: 500,
        totalRooms: 20,
        availableRooms: 20,
        status: "active"
      }
    ]);

    const room = rooms[0];

    /* --------------------------------------------------
       Room Inventory (Date-wise)
    -------------------------------------------------- */
    const inventories = await RoomInventory.insertMany([
      {
        hotelId: hotel._id,
        roomId: room._id,
        date: new Date("2026-02-01"),
        totalRooms: 20,
        bookedRooms: 5,
        availableRooms: 15,
        price: 4800,
        isBlocked: false
      }
    ]);

    /* --------------------------------------------------
       Booking
    -------------------------------------------------- */
    const bookings = await Booking.insertMany([
      {
        bookingId: "BK20260001",
        hotelId: hotel._id,
        roomId: room._id,
        userId: customerUser._id,

        checkInDate: new Date("2026-02-01"),
        checkOutDate: new Date("2026-02-03"),
        nights: 2,

        guests: {
          adults: 2,
          children: 0
        },

        price: {
          roomPrice: 9000,
          taxes: 900,
          discount: 0,
          totalAmount: 9900
        },

        paymentStatus: "paid",
        bookingStatus: "confirmed",
        source: "website"
      }
    ]);

    const booking = bookings[0];

    /* --------------------------------------------------
       Payment
    -------------------------------------------------- */
    await Payment.insertMany([
      {
        bookingId: booking._id,
        userId: customerUser._id,
        paymentGateway: "Razorpay",
        transactionId: "TXN123456789",
        amount: 9900,
        currency: "INR",
        status: "success",
        paymentMethod: "upi",
        paidAt: new Date()
      }
    ]);

    /* --------------------------------------------------
       Review
    -------------------------------------------------- */
    await Review.insertMany([
      {
        hotelId: hotel._id,
        bookingId: booking._id,
        userId: customerUser._id,
        rating: 5,
        comment: "Excellent stay, very clean and friendly staff!",
        isApproved: true
      }
    ]);

    console.log("✅ Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder error:", error);
    process.exit(1);
  }
};

seedDatabase();


///npx tsx database/seeder/index.js
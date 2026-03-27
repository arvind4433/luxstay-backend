/**
 * LuxStay Seed Script
 * Run: node seed.js
 * Populates MongoDB with hotels, rooms, offers, and notifications
 */

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");
const Room = require("./models/Room");
const Offer = require("./models/OfferSchema");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/luxstay";

const hotels = [
  {
    name: "The Grand Palace",
    brand: "LuxStay Signature",
    slug: "the-grand-palace",
    description: "Experience unparalleled luxury at The Grand Palace. Nestled in the heart of Mumbai, our 5-star property offers breathtaking views of the Arabian Sea with world-class amenities, Michelin-starred dining, and impeccable service that redefines hospitality.",
    starRating: 5,
    propertyType: "Hotel",
    address: { addressLine1: "Marine Drive", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400020" },
    amenities: ["Swimming Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar", "Parking", "Concierge"],
    pricing: { basePricePerNight: 12000, currency: "INR" },
    averageRating: 4.8,
    totalReviews: 247,
    status: "active",
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    ],
    policies: { checkInTime: "14:00", checkOutTime: "12:00", cancellationPolicy: "Free cancellation until 24 hours before check-in" },
    contact: { email: "reservations@grandpalace.com", phone: "+91 22 1234 5678" },
  },
  {
    name: "Azure Ocean Resort",
    brand: "LuxStay Premium",
    slug: "azure-ocean-resort",
    description: "A oceanfront paradise in Goa offering exclusive beachfront villas, infinity pools, and a private beach stretch. Perfect for honeymooners and luxury seekers wanting the ultimate coastal retreatexperience.",
    starRating: 5,
    propertyType: "Resort",
    address: { addressLine1: "Calangute Beach Road", city: "Goa", state: "Goa", country: "India", pincode: "403516" },
    amenities: ["Private Beach", "Infinity Pool", "Spa", "WiFi", "Water Sports", "Restaurant", "Bar", "Yoga Classes"],
    pricing: { basePricePerNight: 9500, currency: "INR" },
    averageRating: 4.9,
    totalReviews: 312,
    status: "active",
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
    ],
    policies: { checkInTime: "15:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation until 48 hours before check-in" },
    contact: { email: "stay@azureresort.com", phone: "+91 832 999 8888" },
  },
  {
    name: "Royal Heritage Haveli",
    brand: "LuxStay Heritage",
    slug: "royal-heritage-haveli",
    description: "Step into Rajasthan royalty at this meticulously restored 300-year-old haveli. Each room is uniquely decorated with traditional Rajasthani art, hand-painted murals, and period furnishings, offering agenuine royal experience.",
    starRating: 4,
    propertyType: "Hotel",
    address: { addressLine1: "Old City, Near Amber Fort", city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001" },
    amenities: ["Heritage Tours", "Rooftop Restaurant", "WiFi", "Pool", "Cultural Events", "Spa", "Parking"],
    pricing: { basePricePerNight: 6500, currency: "INR" },
    averageRating: 4.7,
    totalReviews: 189,
    status: "active",
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    ],
    policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation until 24 hours before check-in" },
    contact: { email: "book@royalhaveli.com", phone: "+91 141 555 6789" },
  },
  {
    name: "Himalayan Retreat",
    brand: "LuxStay Mountain",
    slug: "himalayan-retreat",
    description: "Perched at 8,000 feet above sea level with stunning panoramic views of the Himalayan range. Our stone-and-cedar lodge blends seamlessly with nature while offering world-class comfort and mountain experiences.",
    starRating: 4,
    propertyType: "Resort",
    address: { addressLine1: "Mall Road", city: "Shimla", state: "Himachal Pradesh", country: "India", pincode: "171001" },
    amenities: ["Mountain Views", "Fireplace", "Trekking", "WiFi", "Restaurant", "Bonfire Area", "Library"],
    pricing: { basePricePerNight: 4800, currency: "INR" },
    averageRating: 4.6,
    totalReviews: 143,
    status: "active",
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&q=80",
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80",
      "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
    ],
    policies: { checkInTime: "14:00", checkOutTime: "12:00", cancellationPolicy: "Free cancellation until 72 hours before check-in" },
    contact: { email: "info@himalayanretreat.com", phone: "+91 177 222 3456" },
  },
  {
    name: "Beachfront Serenity Villa",
    brand: "LuxStay Villas",
    slug: "beachfront-serenity-villa",
    description: "Private luxury villas steps from the beach in Kerala's enchanting backwaters. Experience traditional Kerala architecture with Dutch-gabled roofs, hardwood floors, and private plunge pools amid spice gardens.",
    starRating: 5,
    propertyType: "Villa",
    address: { addressLine1: "Kumarakom Lake Road", city: "Kochi", state: "Kerala", country: "India", pincode: "686566" },
    amenities: ["Private Pool", "Backwater Views", "Ayurveda Spa", "WiFi", "Butler Service", "Boat Rides", "Organic Garden"],
    pricing: { basePricePerNight: 15000, currency: "INR" },
    averageRating: 4.9,
    totalReviews: 98,
    status: "active",
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
      "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&q=80",
      "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800&q=80",
    ],
    policies: { checkInTime: "15:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation until 48 hours before check-in" },
    contact: { email: "villa@serenity.com", phone: "+91 484 444 5678" },
  },
  {
    name: "The Urban Luxe",
    brand: "LuxStay City",
    slug: "the-urban-luxe",
    description: "A contemporary luxury hotel in the business heart of Bangalore. Featuring cutting-edge design, rooftop infinity pool, sky bar, and seamless connectivity — perfect for the modern business traveler seeking premium urban experiences.",
    starRating: 4,
    propertyType: "Hotel",
    address: { addressLine1: "Residency Road, MG Road", city: "Bangalore", state: "Karnataka", country: "India", pincode: "560025" },
    amenities: ["Rooftop Pool", "Sky Bar", "Business Center", "WiFi", "Gym", "Restaurant", "Parking", "EV Charging"],
    pricing: { basePricePerNight: 7500, currency: "INR" },
    averageRating: 4.5,
    totalReviews: 267,
    status: "active",
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    ],
    policies: { checkInTime: "14:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation until 24 hours before check-in" },
    contact: { email: "stay@theurbanluxe.com", phone: "+91 80 9876 5432" },
  },
  {
    name: "Golden Sands Resort",
    brand: "LuxStay Premium",
    slug: "golden-sands-resort",
    description: "Where the Thar Desert meets luxury — experience camel safaris by day and star-gazing by night in our exclusive desert camp-style resort with modern amenities, cultural performances, and authentic Rajasthani cuisine.",
    starRating: 4,
    propertyType: "Resort",
    address: { addressLine1: "Sam Sand Dunes Road", city: "Jaisalmer", state: "Rajasthan", country: "India", pincode: "345001" },
    amenities: ["Desert Safari", "Cultural Shows", "Rooftop Dining", "WiFi", "Pool", "Camel Rides", "Star Gazing"],
    pricing: { basePricePerNight: 8500, currency: "INR" },
    averageRating: 4.7,
    totalReviews: 156,
    status: "active",
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80",
      "https://images.unsplash.com/photo-1529551739587-e242c564f727?w=800&q=80",
      "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&q=80",
    ],
    policies: { checkInTime: "14:00", checkOutTime: "12:00" },
    contact: { email: "desert@goldensands.com", phone: "+91 2992 555 444" },
  },
  {
    name: "Nirvana Wellness Retreat",
    brand: "LuxStay Wellness",
    slug: "nirvana-wellness-retreat",
    description: "India's premier wellness destination nestled in the foothills of Uttarakhand. Offering Ayurvedic treatments, yoga certification programs, organic farm-to-table dining, and digital detox retreats in a Himalayan sanctuary.",
    starRating: 4,
    propertyType: "Resort",
    address: { addressLine1: "Rajpur Road", city: "Rishikesh", state: "Uttarakhand", country: "India", pincode: "249137" },
    amenities: ["Yoga Studio", "Ayurveda Center", "Organic Restaurant", "WiFi", "Meditation Hall", "Riverside Walks", "Detox Programs"],
    pricing: { basePricePerNight: 5500, currency: "INR" },
    averageRating: 4.8,
    totalReviews: 203,
    status: "active",
    isFeatured: false,
    coverImage: "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&q=80",
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    ],
    policies: { checkInTime: "15:00", checkOutTime: "10:00" },
    contact: { email: "namaste@nirvana.com", phone: "+91 135 888 9999" },
  },
];

const getRoomTemplates = (hotelId, basePrice) => [
  {
    hotelId,
    roomTypeCode: "STD",
    roomTypeName: "Standard Room",
    description: "A comfortable and elegantly furnished standard room with all essential amenities for a relaxing stay.",
    maxAdults: 2,
    maxChildren: 1,
    bedType: "Queen",
    roomSize: 250,
    amenities: ["AC", "WiFi", "TV", "Mini Bar", "Work Desk"],
    basePrice: Math.round(basePrice * 0.7),
    extraAdultPrice: Math.round(basePrice * 0.1),
    extraChildPrice: 0,
    totalRooms: 10,
    availableRooms: 8,
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
    ],
  },
  {
    hotelId,
    roomTypeCode: "DLX",
    roomTypeName: "Deluxe Room",
    description: "Spacious deluxe room featuring premium furnishings, a private balcony with scenic views, and upgraded amenities.",
    maxAdults: 2,
    maxChildren: 2,
    bedType: "King",
    roomSize: 380,
    amenities: ["AC", "WiFi", "Smart TV", "Mini Bar", "Bathtub", "Work Desk", "Room Service 24/7"],
    basePrice: basePrice,
    extraAdultPrice: Math.round(basePrice * 0.12),
    extraChildPrice: Math.round(basePrice * 0.05),
    totalRooms: 8,
    availableRooms: 6,
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80",
    ],
  },
  {
    hotelId,
    roomTypeCode: "SUITE",
    roomTypeName: "Executive Suite",
    description: "The epitome of luxury — a sprawling suite with separate living area, king-size bed, premium bath amenities, and panoramic views.",
    maxAdults: 3,
    maxChildren: 2,
    bedType: "King",
    roomSize: 650,
    amenities: ["AC", "WiFi", "Smart TV", "Full Bar", "Jacuzzi", "Living Room", "Kitchenette", "Butler Service", "Private Balcony"],
    basePrice: Math.round(basePrice * 1.8),
    extraAdultPrice: Math.round(basePrice * 0.15),
    extraChildPrice: Math.round(basePrice * 0.08),
    totalRooms: 4,
    availableRooms: 3,
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80",
    ],
  },
];

const offers = [
  {
    title: "Early Bird Special",
    description: "Book 30 days in advance and enjoy 30% off on all room categories. Perfect for planners who love great deals!",
    code: "EARLY30",
    discountType: "PERCENT",
    discountValue: 30,
    minBookingAmount: 3000,
    maxDiscount: 5000,
    validFrom: new Date("2024-01-01"),
    validTill: new Date("2027-12-31"),
    applicableOn: "BOTH",
    isActive: true,
  },
  {
    title: "Weekend Break",
    description: "Exclusive savings for weekend warriors. Save 20% on stays of 2 nights or more during weekends.",
    code: "WEEKEND20",
    discountType: "PERCENT",
    discountValue: 20,
    minBookingAmount: 2000,
    maxDiscount: 3000,
    validFrom: new Date("2024-01-01"),
    validTill: new Date("2027-12-31"),
    applicableOn: "BOTH",
    isActive: true,
  },
  {
    title: "Welcome Gift",
    description: "A special gift from LuxStay for first-time users! Enjoy ₹1,500 off your very first booking.",
    code: "FIRST1500",
    discountType: "FLAT",
    discountValue: 1500,
    minBookingAmount: 5000,
    validFrom: new Date("2024-01-01"),
    validTill: new Date("2027-12-31"),
    applicableOn: "BOTH",
    isActive: true,
  },
  {
    title: "Loyalty Bonus",
    description: "Our way of thanking returning guests — get 15% off your next stay at any LuxStay property.",
    code: "LOYAL15",
    discountType: "PERCENT",
    discountValue: 15,
    minBookingAmount: 1000,
    maxDiscount: 4000,
    validFrom: new Date("2024-01-01"),
    validTill: new Date("2027-12-31"),
    applicableOn: "BOTH",
    isActive: true,
  },
  {
    title: "Monsoon Magic",
    description: "Escape the heat with our monsoon special — flat ₹2,000 off on stays during the monsoon season.",
    code: "MONSOON2K",
    discountType: "FLAT",
    discountValue: 2000,
    minBookingAmount: 6000,
    validFrom: new Date("2024-01-01"),
    validTill: new Date("2027-12-31"),
    applicableOn: "BOTH",
    isActive: true,
  },
  {
    title: "Suite Dreams",
    description: "Upgrade to a suite and save! Get 25% off when you book any suite or premium room category.",
    code: "SUITE25",
    discountType: "PERCENT",
    discountValue: 25,
    minBookingAmount: 8000,
    maxDiscount: 6000,
    validFrom: new Date("2024-01-01"),
    validTill: new Date("2027-12-31"),
    applicableOn: "ROOM",
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Offer.deleteMany({});
    console.log("🗑️  Cleared existing hotels, rooms, and offers");

    // Insert hotels
    const insertedHotels = await Hotel.insertMany(hotels);
    console.log(`✅ Inserted ${insertedHotels.length} hotels`);

    // Insert rooms for each hotel
    let totalRooms = 0;
    for (const hotel of insertedHotels) {
      const roomDocs = getRoomTemplates(hotel._id, hotel.pricing.basePricePerNight);
      const insertedRooms = await Room.insertMany(roomDocs);
      totalRooms += insertedRooms.length;
    }
    console.log(`✅ Inserted ${totalRooms} rooms (3 per hotel)`);

    // Insert offers
    const insertedOffers = await Offer.insertMany(offers);
    console.log(`✅ Inserted ${insertedOffers.length} offers`);

    console.log("\n🎉 Seed completed successfully!");
    console.log(`   Hotels: ${insertedHotels.length}`);
    console.log(`   Rooms:  ${totalRooms}`);
    console.log(`   Offers: ${insertedOffers.length}`);
    console.log("\n   Coupon codes: EARLY30, WEEKEND20, FIRST1500, LOYAL15, MONSOON2K, SUITE25");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();

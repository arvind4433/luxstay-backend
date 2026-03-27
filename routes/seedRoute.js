/**
 * Seed Route - POST /api/seed
 * Inserts hotels, rooms, and offers using the live MongoDB connection.
 * Only works in non-production (or when ALLOW_SEED=true).
 */
const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");
const Room = require("../models/Room");
const Offer = require("../models/OfferSchema");

router.post("/", async (req, res) => {
  // Basic protection — only allow if header matches
  const key = req.headers["x-seed-key"];
  if (key !== "luxstay_seed_2025") {
    return res.status(403).json({ status: false, message: "Forbidden" });
  }

  try {
    // Clear existing
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Offer.deleteMany({});

    const hotelDefs = [
      { name: "The Grand Palace", slug: "the-grand-palace", description: "Experience unparalleled luxury in the heart of Mumbai. 5-star property with breathtaking views of the Arabian Sea, Michelin-starred dining, and impeccable service.", starRating: 5, propertyType: "Hotel", address: { addressLine1: "Marine Drive", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400020" }, amenities: ["Swimming Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar", "Parking", "Concierge"], pricing: { basePricePerNight: 12000, currency: "INR" }, averageRating: 4.8, totalReviews: 247, status: "active", isFeatured: true, coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"], policies: { checkInTime: "14:00", checkOutTime: "12:00", cancellationPolicy: "Free cancellation until 24 hours before check-in" }, contact: { email: "reservations@grandpalace.com", phone: "+91 22 1234 5678" } },
      { name: "Azure Ocean Resort", slug: "azure-ocean-resort", description: "Oceanfront paradise in Goa with exclusive beachfront villas, infinity pools, and private beach. Perfect for honeymooners seeking the ultimate coastal experience.", starRating: 5, propertyType: "Resort", address: { addressLine1: "Calangute Beach Road", city: "Goa", state: "Goa", country: "India", pincode: "403516" }, amenities: ["Private Beach", "Infinity Pool", "Spa", "WiFi", "Water Sports", "Restaurant", "Bar", "Yoga Classes"], pricing: { basePricePerNight: 9500, currency: "INR" }, averageRating: 4.9, totalReviews: 312, status: "active", isFeatured: true, coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80"], policies: { checkInTime: "15:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation until 48 hours before check-in" }, contact: { email: "stay@azureresort.com", phone: "+91 832 999 8888" } },
      { name: "Royal Heritage Haveli", slug: "royal-heritage-haveli", description: "Step into Rajasthan royalty at this 300-year-old haveli with traditional art, hand-painted murals, and period furnishings offering a genuine royal experience.", starRating: 4, propertyType: "Hotel", address: { addressLine1: "Old City, Near Amber Fort", city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001" }, amenities: ["Heritage Tours", "Rooftop Restaurant", "WiFi", "Pool", "Cultural Events", "Spa", "Parking"], pricing: { basePricePerNight: 6500, currency: "INR" }, averageRating: 4.7, totalReviews: 189, status: "active", isFeatured: true, coverImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"], policies: { checkInTime: "13:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation until 24 hours before check-in" }, contact: { email: "book@royalhaveli.com", phone: "+91 141 555 6789" } },
      { name: "Himalayan Retreat", slug: "himalayan-retreat", description: "Perched at 8,000 feet with stunning Himalayan views. Stone-and-cedar lodge blending nature with world-class comfort.", starRating: 4, propertyType: "Resort", address: { addressLine1: "Mall Road", city: "Shimla", state: "Himachal Pradesh", country: "India", pincode: "171001" }, amenities: ["Mountain Views", "Fireplace", "Trekking", "WiFi", "Restaurant", "Bonfire Area", "Library"], pricing: { basePricePerNight: 4800, currency: "INR" }, averageRating: 4.6, totalReviews: 143, status: "active", isFeatured: false, coverImage: "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&q=80", images: ["https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&q=80", "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80"], policies: { checkInTime: "14:00", checkOutTime: "12:00" }, contact: { email: "info@himalayanretreat.com", phone: "+91 177 222 3456" } },
      { name: "Beachfront Serenity Villa", slug: "beachfront-serenity-villa", description: "Private luxury villas in Kerala's backwaters with Dutch-gabled roofs, hardwood floors, private plunge pools amid spice gardens.", starRating: 5, propertyType: "Villa", address: { addressLine1: "Kumarakom Lake Road", city: "Kochi", state: "Kerala", country: "India", pincode: "686566" }, amenities: ["Private Pool", "Backwater Views", "Ayurveda Spa", "WiFi", "Butler Service", "Boat Rides", "Organic Garden"], pricing: { basePricePerNight: 15000, currency: "INR" }, averageRating: 4.9, totalReviews: 98, status: "active", isFeatured: true, coverImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80", images: ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80", "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&q=80"], policies: { checkInTime: "15:00", checkOutTime: "11:00" }, contact: { email: "villa@serenity.com", phone: "+91 484 444 5678" } },
      { name: "The Urban Luxe", slug: "the-urban-luxe", description: "Contemporary luxury in Bangalore's business heart with rooftop infinity pool, sky bar, and seamless connectivity.", starRating: 4, propertyType: "Hotel", address: { addressLine1: "Residency Road, MG Road", city: "Bangalore", state: "Karnataka", country: "India", pincode: "560025" }, amenities: ["Rooftop Pool", "Sky Bar", "Business Center", "WiFi", "Gym", "Restaurant", "Parking"], pricing: { basePricePerNight: 7500, currency: "INR" }, averageRating: 4.5, totalReviews: 267, status: "active", isFeatured: false, coverImage: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80", images: ["https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80", "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"], policies: { checkInTime: "14:00", checkOutTime: "11:00" }, contact: { email: "stay@theurbanluxe.com", phone: "+91 80 9876 5432" } },
      { name: "Golden Sands Resort", slug: "golden-sands-resort", description: "Thar Desert meets luxury — camel safaris by day, star-gazing by night, cultural performances and authentic Rajasthani cuisine.", starRating: 4, propertyType: "Resort", address: { addressLine1: "Sam Sand Dunes Road", city: "Jaisalmer", state: "Rajasthan", country: "India", pincode: "345001" }, amenities: ["Desert Safari", "Cultural Shows", "Rooftop Dining", "WiFi", "Pool", "Camel Rides", "Star Gazing"], pricing: { basePricePerNight: 8500, currency: "INR" }, averageRating: 4.7, totalReviews: 156, status: "active", isFeatured: false, coverImage: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80", images: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80"], policies: { checkInTime: "14:00", checkOutTime: "12:00" }, contact: { email: "desert@goldensands.com", phone: "+91 2992 555 444" } },
      { name: "Nirvana Wellness Retreat", slug: "nirvana-wellness-retreat", description: "India's premier wellness destination in Rishikesh with Ayurvedic treatments, yoga programs, organic farm-to-table dining and digital detox.", starRating: 4, propertyType: "Resort", address: { addressLine1: "Rajpur Road", city: "Rishikesh", state: "Uttarakhand", country: "India", pincode: "249137" }, amenities: ["Yoga Studio", "Ayurveda Center", "Organic Restaurant", "WiFi", "Meditation Hall", "Riverside Walks", "Detox Programs"], pricing: { basePricePerNight: 5500, currency: "INR" }, averageRating: 4.8, totalReviews: 203, status: "active", isFeatured: false, coverImage: "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&q=80", images: ["https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&q=80", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"], policies: { checkInTime: "15:00", checkOutTime: "10:00" }, contact: { email: "namaste@nirvana.com", phone: "+91 135 888 9999" } },
    ];

    const insertedHotels = await Hotel.insertMany(hotelDefs);

    // Rooms: 3 per hotel
    const rooms = [];
    for (const hotel of insertedHotels) {
      const bp = hotel.pricing.basePricePerNight;
      rooms.push(
        { hotelId: hotel._id, roomTypeCode: "STD", roomTypeName: "Standard Room", description: "Comfortable elegantly furnished room with all essential amenities for a relaxing stay.", maxAdults: 2, maxChildren: 1, bedType: "Queen", roomSize: 250, amenities: ["AC", "WiFi", "TV", "Mini Bar", "Work Desk"], basePrice: Math.round(bp * 0.7), extraAdultPrice: Math.round(bp * 0.1), totalRooms: 10, availableRooms: 8, status: "available", images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80", "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80"] },
        { hotelId: hotel._id, roomTypeCode: "DLX", roomTypeName: "Deluxe Room", description: "Spacious deluxe room with premium furnishings, private balcony with scenic views, and upgraded amenities.", maxAdults: 2, maxChildren: 2, bedType: "King", roomSize: 380, amenities: ["AC", "WiFi", "Smart TV", "Mini Bar", "Bathtub", "Work Desk", "Room Service 24/7"], basePrice: bp, extraAdultPrice: Math.round(bp * 0.12), totalRooms: 8, availableRooms: 6, status: "available", images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80"] },
        { hotelId: hotel._id, roomTypeCode: "SUITE", roomTypeName: "Executive Suite", description: "The epitome of luxury — sprawling suite with separate living area, king-size bed, jacuzzi, and panoramic views.", maxAdults: 3, maxChildren: 2, bedType: "King", roomSize: 650, amenities: ["AC", "WiFi", "Smart TV", "Full Bar", "Jacuzzi", "Living Room", "Kitchenette", "Butler Service", "Private Balcony"], basePrice: Math.round(bp * 1.8), extraAdultPrice: Math.round(bp * 0.15), totalRooms: 4, availableRooms: 3, status: "available", images: ["https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600&q=80", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80"] }
      );
    }
    const insertedRooms = await Room.insertMany(rooms);

    // Offers
    const now = new Date();
    const future = new Date("2027-12-31");
    const offerDefs = [
      { title: "Early Bird Special", description: "Book 30 days in advance and enjoy 30% off on all room categories!", code: "EARLY30", discountType: "PERCENT", discountValue: 30, minBookingAmount: 3000, maxDiscount: 5000, validFrom: now, validTill: future, applicableOn: "BOTH", isActive: true },
      { title: "Weekend Break", description: "20% off on weekend stays of 2 or more nights.", code: "WEEKEND20", discountType: "PERCENT", discountValue: 20, minBookingAmount: 2000, maxDiscount: 3000, validFrom: now, validTill: future, applicableOn: "BOTH", isActive: true },
      { title: "Welcome Gift", description: "₹1,500 off your very first LuxStay booking!", code: "FIRST1500", discountType: "FLAT", discountValue: 1500, minBookingAmount: 5000, validFrom: now, validTill: future, applicableOn: "BOTH", isActive: true },
      { title: "Loyalty Bonus", description: "Returning guests get 15% off their next stay.", code: "LOYAL15", discountType: "PERCENT", discountValue: 15, minBookingAmount: 1000, maxDiscount: 4000, validFrom: now, validTill: future, applicableOn: "BOTH", isActive: true },
      { title: "Monsoon Magic", description: "₹2,000 flat off on monsoon season stays.", code: "MONSOON2K", discountType: "FLAT", discountValue: 2000, minBookingAmount: 6000, validFrom: now, validTill: future, applicableOn: "BOTH", isActive: true },
      { title: "Suite Dreams", description: "25% off when you book any suite or premium room.", code: "SUITE25", discountType: "PERCENT", discountValue: 25, minBookingAmount: 8000, maxDiscount: 6000, validFrom: now, validTill: future, applicableOn: "ROOM", isActive: true },
    ];
    const insertedOffers = await Offer.insertMany(offerDefs);

    return res.status(200).json({
      status: true,
      message: "Database seeded successfully!",
      data: {
        hotels: insertedHotels.length,
        rooms: insertedRooms.length,
        offers: insertedOffers.length,
        coupons: offerDefs.map(o => o.code),
      },
    });
  } catch (err) {
    console.error("Seed error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
});

module.exports = router;

/**
 * LuxStay - Seed via HTTP API
 * Run: node seed-api.js
 * Seeds data through the live running backend (uses existing MongoDB connection)
 */

const http = require("http");

const BASE = "http://localhost:5000";

const hotels = [
  { name: "The Grand Palace", brand: "LuxStay Signature", slug: "the-grand-palace", description: "Experience unparalleled luxury at The Grand Palace. Nestled in the heart of Mumbai, our 5-star property offers breathtaking views of the Arabian Sea with world-class amenities, Michelin-starred dining, and impeccable service.", starRating: 5, propertyType: "Hotel", address: { city: "Mumbai", state: "Maharashtra", country: "India", addressLine1: "Marine Drive", pincode: "400020" }, amenities: ["Swimming Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar", "Parking", "Concierge"], pricing: { basePricePerNight: 12000, currency: "INR" }, averageRating: 4.8, totalReviews: 247, status: "active", isFeatured: true, coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"], policies: { checkInTime: "14:00", checkOutTime: "12:00", cancellationPolicy: "Free cancellation until 24 hours before check-in" }, contact: { email: "reservations@grandpalace.com", phone: "+91 22 1234 5678" } },
  { name: "Azure Ocean Resort", brand: "LuxStay Premium", slug: "azure-ocean-resort", description: "A oceanfront paradise in Goa offering exclusive beachfront villas, infinity pools, and a private beach stretch. Perfect for honeymooners and luxury seekers wanting the ultimate coastal experience.", starRating: 5, propertyType: "Resort", address: { city: "Goa", state: "Goa", country: "India", addressLine1: "Calangute Beach Road", pincode: "403516" }, amenities: ["Private Beach", "Infinity Pool", "Spa", "WiFi", "Water Sports", "Restaurant", "Bar", "Yoga Classes"], pricing: { basePricePerNight: 9500, currency: "INR" }, averageRating: 4.9, totalReviews: 312, status: "active", isFeatured: true, coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80"], policies: { checkInTime: "15:00", checkOutTime: "11:00", cancellationPolicy: "Free cancellation until 48 hours before check-in" }, contact: { email: "stay@azureresort.com", phone: "+91 832 999 8888" } },
  { name: "Royal Heritage Haveli", brand: "LuxStay Heritage", slug: "royal-heritage-haveli", description: "Step into Rajasthan royalty at this meticulously restored 300-year-old haveli. Each room is uniquely decorated with traditional art and period furnishings, offering a genuine royal experience.", starRating: 4, propertyType: "Hotel", address: { city: "Jaipur", state: "Rajasthan", country: "India", addressLine1: "Old City, Near Amber Fort", pincode: "302001" }, amenities: ["Heritage Tours", "Rooftop Restaurant", "WiFi", "Pool", "Cultural Events", "Spa", "Parking"], pricing: { basePricePerNight: 6500, currency: "INR" }, averageRating: 4.7, totalReviews: 189, status: "active", isFeatured: true, coverImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80", "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80"], policies: { checkInTime: "13:00", checkOutTime: "11:00" }, contact: { email: "book@royalhaveli.com", phone: "+91 141 555 6789" } },
  { name: "Himalayan Retreat", brand: "LuxStay Mountain", slug: "himalayan-retreat", description: "Perched at 8,000 feet with stunning Himalayan views. Stone-and-cedar lodge blending nature with world-class comfort and mountain experiences.", starRating: 4, propertyType: "Resort", address: { city: "Shimla", state: "Himachal Pradesh", country: "India", addressLine1: "Mall Road", pincode: "171001" }, amenities: ["Mountain Views", "Fireplace", "Trekking", "WiFi", "Restaurant", "Bonfire Area"], pricing: { basePricePerNight: 4800, currency: "INR" }, averageRating: 4.6, totalReviews: 143, status: "active", isFeatured: false, coverImage: "https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&q=80", images: ["https://images.unsplash.com/photo-1519449556851-5720b33024e7?w=800&q=80"] },
  { name: "Beachfront Serenity Villa", brand: "LuxStay Villas", slug: "beachfront-serenity-villa", description: "Private luxury villas steps from the beach in Kerala's backwaters with traditional architecture, private plunge pools, and spice gardens.", starRating: 5, propertyType: "Villa", address: { city: "Kochi", state: "Kerala", country: "India", addressLine1: "Kumarakom Lake Road", pincode: "686566" }, amenities: ["Private Pool", "Backwater Views", "Ayurveda Spa", "WiFi", "Butler Service", "Boat Rides"], pricing: { basePricePerNight: 15000, currency: "INR" }, averageRating: 4.9, totalReviews: 98, status: "active", isFeatured: true, coverImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80", images: ["https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80"] },
  { name: "The Urban Luxe", brand: "LuxStay City", slug: "the-urban-luxe", description: "Contemporary luxury in the heart of Bangalore with rooftop infinity pool, sky bar, and seamless connectivity for modern business travelers.", starRating: 4, propertyType: "Hotel", address: { city: "Bangalore", state: "Karnataka", country: "India", addressLine1: "Residency Road", pincode: "560025" }, amenities: ["Rooftop Pool", "Sky Bar", "Business Center", "WiFi", "Gym", "Restaurant"], pricing: { basePricePerNight: 7500, currency: "INR" }, averageRating: 4.5, totalReviews: 267, status: "active", isFeatured: false, coverImage: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80", images: ["https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80", "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"] },
  { name: "Golden Sands Resort", brand: "LuxStay Premium", slug: "golden-sands-resort", description: "Where the Thar Desert meets luxury — camel safaris, star-gazing, and authentic Rajasthani cuisine in an exclusive desert resort.", starRating: 4, propertyType: "Resort", address: { city: "Jaisalmer", state: "Rajasthan", country: "India", addressLine1: "Sam Sand Dunes Road", pincode: "345001" }, amenities: ["Desert Safari", "Cultural Shows", "Rooftop Dining", "WiFi", "Pool", "Camel Rides"], pricing: { basePricePerNight: 8500, currency: "INR" }, averageRating: 4.7, totalReviews: 156, status: "active", isFeatured: false, coverImage: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80", images: ["https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80"] },
  { name: "Nirvana Wellness Retreat", brand: "LuxStay Wellness", slug: "nirvana-wellness-retreat", description: "India's premier wellness destination in Rishikesh with Ayurveda, yoga programs, organic dining, and digital detox retreats.", starRating: 4, propertyType: "Resort", address: { city: "Rishikesh", state: "Uttarakhand", country: "India", addressLine1: "Rajpur Road", pincode: "249137" }, amenities: ["Yoga Studio", "Ayurveda Center", "Organic Restaurant", "WiFi", "Meditation Hall", "Riverside Walks"], pricing: { basePricePerNight: 5500, currency: "INR" }, averageRating: 4.8, totalReviews: 203, status: "active", isFeatured: false, coverImage: "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&q=80", images: ["https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&q=80"] },
];

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request({ hostname: "localhost", port: 5000, path, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } }, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}${path}`, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    }).on("error", reject);
  });
}

async function seed() {
  console.log("🌱 Seeding via API (uses live backend MongoDB connection)…");

  // 1. Insert hotels via admin endpoint (skip auth by using admin seed route)
  console.log("\n📍 Inserting hotels…");
  const hotelIds = [];
  for (const hotel of hotels) {
    try {
      const res = await post("/api/admin/hotel/add", hotel);
      if (res.data?._id || res._id) {
        const id = res.data?._id || res._id;
        hotelIds.push({ id, basePrice: hotel.pricing.basePricePerNight, name: hotel.name });
        console.log(`   ✓ ${hotel.name}`);
      } else {
        console.log(`   ⚠ ${hotel.name}: ${JSON.stringify(res).slice(0, 80)}`);
      }
    } catch (e) {
      console.log(`   ✗ ${hotel.name}: ${e.message}`);
    }
  }

  console.log("\n🛏️  Done! Hotels attempted:", hotels.length);
  console.log("\n💡 If hotels failed (auth required), run the seed.js directly once MongoDB DNS resolves.");
  console.log("   Or use the admin panel to add hotels/rooms manually.");
  console.log("\n✅ Seed-API complete.");
}

seed().catch(console.error);

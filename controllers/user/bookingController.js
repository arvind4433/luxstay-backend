const Booking = require("../../models/Booking");
const Room = require("../../models/Room");
const Hotel = require("../../models/Hotel");
const Notification = require("../../models/Notification");

const createBooking = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const {
      roomId, hotelId,
      checkIn, checkOutDate, checkInDate, checkOut,
      guests, totalAmount, couponCode, guestInfo, specialRequests
    } = req.body;

    const finalCheckIn = checkIn || checkInDate;
    const finalCheckOut = checkOut || checkOutDate;

    if (!hotelId) {
      return res.status(400).json({ status: false, message: "Hotel ID is required" });
    }
    if (!finalCheckIn || !finalCheckOut) {
      return res.status(400).json({ status: false, message: "Check-in and check-out dates are required" });
    }

    // Verify hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ status: false, message: "Hotel not found" });

    let room = null;
    let roomPrice = hotel.pricing?.basePricePerNight || 1000;

    if (roomId) {
      room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ status: false, message: "Room not found" });
      if (room.availableRooms <= 0) {
        return res.status(400).json({ status: false, message: "Room is no longer available" });
      }
      roomPrice = room.basePrice || roomPrice;
    }

    // Calculate nights
    const d1 = new Date(finalCheckIn);
    const d2 = new Date(finalCheckOut);
    const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    const subtotal = roomPrice * nights;
    const taxes = Math.round(subtotal * 0.18);
    const finalTotal = totalAmount || (subtotal + taxes);

    const booking = await Booking.create({
      bookingId: `BK-${Date.now()}`,
      hotelId,
      roomId: roomId || undefined,
      userId,
      checkInDate: new Date(finalCheckIn),
      checkOutDate: new Date(finalCheckOut),
      nights,
      guests: typeof guests === "object" ? guests : { adults: Number(guests) || 1, children: 0 },
      price: {
        roomPrice,
        taxes,
        discount: 0,
        totalAmount: finalTotal,
      },
      paymentStatus: "pending",
      bookingStatus: "pending",
      source: "website",
      specialRequests: specialRequests || "",
      guestInfo: guestInfo || {},
    });

    // Decrement availableRooms
    if (room) {
      await Room.findByIdAndUpdate(roomId, { $inc: { availableRooms: -1 } });
    }

    // Create notification for user
    await Notification.create({
      userId,
      title: "Booking pending",
      message: `${hotel.name} added for payment`,
      type: "booking",
      isRead: false,
    });

    const populated = await Booking.findById(booking._id)
      .populate("hotelId", "name address images pricing")
      .populate("roomId", "roomTypeName basePrice images");

    return res.status(201).json({
      status: true,
      message: "Booking created successfully",
      data: populated,
    });
  } catch (err) {
    console.error("Booking create error:", err);
    return res.status(500).json({ status: false, message: "Server Error: " + err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const bookings = await Booking.find({ userId })
      .populate("hotelId", "name address images coverImage pricing starRating")
      .populate("roomId", "roomTypeName basePrice images bedType")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      message: "Bookings fetched successfully",
      data: bookings,
      total: bookings.length,
    });
  } catch (err) {
    console.error("getMyBookings error:", err);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

const getBookingById = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const booking = await Booking.findOne({ _id: req.params.id, userId })
      .populate("hotelId", "name address images pricing policies contact")
      .populate("roomId", "roomTypeName basePrice images bedType amenities");

    if (!booking) return res.status(404).json({ status: false, message: "Booking not found" });

    return res.status(200).json({ status: true, data: booking });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById };

const Room = require("../../models/Room");

const getByHotel = async (req, res) => {
  try {
    const hotelId = req.params.hotelId || req.query.hotelId;
    const { minPrice, maxPrice, roomType, availableOnly, sort } = req.query;

    if (!hotelId) {
      return res.status(400).json({ status: false, message: "Hotel ID is required" });
    }

    const filter = { hotelId };
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }
    if (roomType) {
      filter.roomTypeName = {
        $in: String(roomType)
          .split(",")
          .map((value) => new RegExp(value.trim(), "i")),
      };
    }
    if (availableOnly === "true") {
      filter.availableRooms = { $gt: 0 };
    }

    let query = Room.find(filter);
    if (sort === "price_asc") query = query.sort({ basePrice: 1 });
    else if (sort === "price_desc") query = query.sort({ basePrice: -1 });
    else if (sort === "size_desc") query = query.sort({ roomSize: -1 });

    const rooms = await query.lean();
    return res.status(200).json({
      status: true,
      message: "Rooms fetched successfully",
      data: rooms,
      total: rooms.length,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

const getAll = async (req, res) => {
  try {
    const rooms = await Room.find({}).populate("hotelId").lean();
    return res.status(200).json({ status: true, data: rooms });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

const get = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("hotelId").lean();
    if (!room) return res.status(404).json({ status: false, message: "Room not found" });
    return res.status(200).json({ status: true, data: room });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

const addRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    return res.status(201).json({ status: true, data: room });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

const update = async (req, res) => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ status: false, message: "Room not found" });
    return res.status(200).json({ status: true, data: updated });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ status: false, message: "Room not found" });
    return res.status(200).json({ status: true, message: "Room deleted" });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = { getByHotel, getAll, get, addRoom, update, remove };

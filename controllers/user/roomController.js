const Room = require("../../models/Room");

/**
 * GET /api/room?hotelId=xxx
 * GET /api/room/hotel/:hotelId
 */
const getByHotel = async (req, res) => {
  try {
    const hotelId = req.params.hotelId || req.query.hotelId;
    if (!hotelId) {
      return res.status(400).json({ status: false, message: "Hotel ID is required" });
    }
    const rooms = await Room.find({ hotelId }).lean();
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

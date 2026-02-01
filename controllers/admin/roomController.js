const Room = require("../../models/Room");

const addRoom = async (req, res) => {
    try {
        const room = new Room(req.body);
        const saved = await room.save();

        return res.status(201).json({
            status: true,
            message: "room created successfully",
            data: saved
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

const getAll = async (req, res) => {
    try {
        const rooms = await Room.find({})
            .populate("hotelId");

        return res.status(200).json({
            status: true,
            message: "rooms fetched successfully",
            data: rooms
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

const get = async (req, res) => {
    try {
        if (!req.params.id) {
            throw Error("Room Id Required!");
        }

        const room = await Room.findById(req.params.id)
            .populate("hotelId");

        if (!room) {
            throw Error("Room Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "room fetched successfully",
            data: room
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

const update = async (req, res) => {
    try {
        if (!req.params.id) {
            throw Error("Room Id Required!");
        }

        const updated = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            throw Error("Room Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "room updated successfully",
            data: updated
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

const remove = async (req, res) => {
    try {
        if (!req.params.id) {
            throw Error("Room Id Required!");
        }

        const deleted = await Room.findByIdAndDelete(req.params.id);

        if (!deleted) {
            throw Error("Room Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "room deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    addRoom,
    getAll,
    get,
    update,
    remove
};

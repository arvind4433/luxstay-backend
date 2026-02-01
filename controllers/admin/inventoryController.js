const RoomInventory = require("../../models/RoomInventory");

const addInventory = async (req, res) => {
    try {
        const inventory = new RoomInventory(req.body);
        const saved = await inventory.save();

        return res.status(201).json({
            status: true,
            message: "inventory created successfully",
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
        const inventories = await RoomInventory.find({})
            .populate("hotelId")
            .populate("roomId");

        return res.status(200).json({
            status: true,
            message: "inventory fetched successfully",
            data: inventories
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
            throw Error("Inventory Id Required!");
        }

        const inventory = await RoomInventory.findById(req.params.id)
            .populate("hotelId")
            .populate("roomId");

        if (!inventory) {
            throw Error("Inventory Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "inventory fetched successfully",
            data: inventory
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
            throw Error("Inventory Id Required!");
        }

        const updated = await RoomInventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            throw Error("Inventory Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "inventory updated successfully",
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
            throw Error("Inventory Id Required!");
        }

        const deleted = await RoomInventory.findByIdAndDelete(req.params.id);

        if (!deleted) {
            throw Error("Inventory Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "inventory deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    addInventory,
    getAll,
    get,
    update,
    remove
};

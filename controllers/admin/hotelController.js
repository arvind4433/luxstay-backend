const Hotel = require("../../models/Hotel");

const addHotel = async (req, res) => {
    try {
        const hotel = new Hotel(req.body);
        const saved = await hotel.save();

        return res.status(201).json({
            status: true,
            message: "hotel created successfully",
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
        const hotels = await Hotel.find({});

        return res.status(200).json({
            status: true,
            message: "hotels fetched successfully",
            data: hotels
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
            throw Error("Hotel Id Required!");
        }

        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            throw Error("Hotel Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "hotel fetched successfully",
            data: hotel
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
            throw Error("Hotel Id Required!");
        }

        const updated = await Hotel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            throw Error("Hotel Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "hotel updated successfully",
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
            throw Error("Hotel Id Required!");
        }

        const deleted = await Hotel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            throw Error("Hotel Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "hotel deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    addHotel,
    getAll,
    get,
    update,
    remove
};

const Booking = require("../../models/Booking");

const addBooking = async (req, res) => {
    try {
        const booking = new Booking(req.body);
        const saved = await booking.save();

        return res.status(201).json({
            status: true,
            message: "booking created successfully",
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
        const bookings = await Booking.find({})
           if(!bookings){
            throw Error("no  hotel founded")
           }
        return res.status(200).json({
            status: true,
            message: "bookings fetched successfully",
            data: bookings
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
            throw Error("Booking Id Required!");
        }

        const booking = await Booking.findById(req.params.id)
            .populate("hotelId")
            .populate("roomId")
            .populate("userId");

        if (!booking) {
            throw Error("Booking Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "booking fetched successfully",
            data: booking
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
            throw Error("Booking Id Required!");
        }

        const updated = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            throw Error("Booking Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "booking updated successfully",
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
            throw Error("Booking Id Required!");
        }

        const deleted = await Booking.findByIdAndDelete(req.params.id);

        if (!deleted) {
            throw Error("Booking Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "booking deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    addBooking,
    getAll,
    get,
    update,
    remove
};

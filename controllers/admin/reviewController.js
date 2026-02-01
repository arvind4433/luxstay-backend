const Review = require("../../models/Review");

const addReview = async (req, res) => {
    try {
        const review = new Review(req.body);
        const saved = await review.save();

        return res.status(201).json({
            status: true,
            message: "review created successfully",
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
        const reviews = await Review.find({})
            .populate("hotelId")
            .populate("bookingId")
            .populate("userId");

        return res.status(200).json({
            status: true,
            message: "reviews fetched successfully",
            data: reviews
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
            throw Error("Review Id Required!");
        }

        const review = await Review.findById(req.params.id)
            .populate("hotelId")
            .populate("bookingId")
            .populate("userId");

        if (!review) {
            throw Error("Review Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "review fetched successfully",
            data: review
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
            throw Error("Review Id Required!");
        }

        const updated = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            throw Error("Review Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "review updated successfully",
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
            throw Error("Review Id Required!");
        }

        const deleted = await Review.findByIdAndDelete(req.params.id);

        if (!deleted) {
            throw Error("Review Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "review deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    addReview,
    getAll,
    get,
    update,
    remove
};

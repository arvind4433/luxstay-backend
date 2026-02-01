const Payment = require("../../models/Payment");

const addPayment = async (req, res) => {
    try {
        const payment = new Payment(req.body);
        const saved = await payment.save();

        return res.status(201).json({
            status: true,
            message: "payment created successfully",
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
        const payments = await Payment.find({})
            .populate("bookingId")
            .populate("userId");

        return res.status(200).json({
            status: true,
            message: "payments fetched successfully",
            data: payments
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
            throw Error("Payment Id Required!");
        }

        const payment = await Payment.findById(req.params.id)
            .populate("bookingId")
            .populate("userId");

        if (!payment) {
            throw Error("Payment Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "payment fetched successfully",
            data: payment
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
            throw Error("Payment Id Required!");
        }

        const updated = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            throw Error("Payment Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "payment updated successfully",
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
            throw Error("Payment Id Required!");
        }

        const deleted = await Payment.findByIdAndDelete(req.params.id);

        if (!deleted) {
            throw Error("Payment Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "payment deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    addPayment,
    getAll,
    get,
    update,
    remove
};

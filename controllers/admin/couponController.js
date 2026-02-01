const Coupon = require("../../models/Coupon");

const addCoupon = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        const saved = await coupon.save();

        return res.status(201).json({
            status: true,
            message: "coupon created successfully",
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
        const coupons = await Coupon.find({});

        return res.status(200).json({
            status: true,
            message: "coupons fetched successfully",
            data: coupons
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
            throw Error("Coupon Id Required!");
        }

        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            throw Error("Coupon Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "coupon fetched successfully",
            data: coupon
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
            throw Error("Coupon Id Required!");
        }

        const updated = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            throw Error("Coupon Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "coupon updated successfully",
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
            throw Error("Coupon Id Required!");
        }

        const deleted = await Coupon.findByIdAndDelete(req.params.id);

        if (!deleted) {
            throw Error("Coupon Not Found");
        }

        return res.status(200).json({
            status: true,
            message: "coupon deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    addCoupon,
    getAll,
    get,
    update,
    remove
};

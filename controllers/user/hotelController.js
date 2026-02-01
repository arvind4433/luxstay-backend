const Hotel = require("../../models/Hotel");



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


module.exports = {
  
    getAll,
    get,
};

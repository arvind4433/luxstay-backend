const Hotel = require("../models/hotels");

const addHotel = async (req, res) => {
    try {
        const { name, rooms, location, availability, price } = req.body;      
        const newHotel = new Hotel({
            name,
            rooms,
            location,
            availability,
            price
        });      
        const savedHotel = await newHotel.save(); 
        return res.status(201).json({ 
            status: true,
            message: "hotel details added successfully",
            data: savedHotel
        });       
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
}

module.exports = { 
    addHotel 
};
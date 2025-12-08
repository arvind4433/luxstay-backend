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

const getAll = async (req,res) => {
    
    try {
        const hotels = await Hotel.find({});

        if(!hotels){
            throw Error("Hotel Not Found")

        }
 return res.status(200).json({ 
            status: true,
              message: "hotel fetched successfully",
            data: hotels
        });
    }
    catch (err){
 return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }

}

const get = async (req,res) => {
    
    try {

        if(!req.params.id){
             throw Error("Hotel Id Required!")

        }
        const hotels = await Hotel.findById(req.params.id);

        if(!hotels){
            throw Error("Hotel Not Found")

        }
 return res.status(200).json({ 
            status: true,
              message: "hotel fetched successfully",
            data: hotels
        });
    }
    catch (err){
 return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }

}

module.exports = { 
    addHotel,
    getAll,
    get
};
const express = require("express"); 
const hotelController = require("../controllers/hotelController");

const router = express.Router();
router.post("/addHotel", hotelController.addHotel);
module.exports = router;

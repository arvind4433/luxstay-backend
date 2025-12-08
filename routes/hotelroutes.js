const express = require("express"); 
const hotelController = require("../controllers/hotelcontroller");

const router = express.Router();
router.post("/addHotel", hotelController.addHotel);
router.get("/getAll", hotelController.getAll);
router.get("/get/:id", hotelController.get);
module.exports = router;

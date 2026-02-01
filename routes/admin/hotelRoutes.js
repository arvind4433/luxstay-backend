const express = require("express");
const hotelController = require("../../controllers/admin/hotelController");

const router = express.Router();

router.post("/addHotel", hotelController.addHotel);
router.get("/getAll", hotelController.getAll);
router.get("/get/:id", hotelController.get);
router.put("/update/:id", hotelController.update);
router.delete("/delete/:id", hotelController.remove);

module.exports = router;

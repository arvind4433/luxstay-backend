const express = require("express");
const hotelController = require("../../controllers/user/hotelController");

const router = express.Router();

router.get("/getAll", hotelController.getAll);
router.get("/get/:id", hotelController.get);

module.exports = router;

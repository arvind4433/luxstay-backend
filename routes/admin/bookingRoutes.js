const express = require("express");
const bookingController = require("../../controllers/admin/bookingController");

const router = express.Router();

router.post("/addBooking", bookingController.addBooking);
router.get("/getAll", bookingController.getAll);
router.get("/get/:id", bookingController.get);
router.put("/update/:id", bookingController.update);
router.delete("/delete/:id", bookingController.remove);

module.exports = router;

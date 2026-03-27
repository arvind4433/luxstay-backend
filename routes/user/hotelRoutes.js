const express = require("express");
const hotelController = require("../../controllers/user/hotelController");

const router = express.Router();

// GET /api/hotel  → all hotels (with filters)
router.get("/", hotelController.getAll);
// Backward compat
router.get("/getAll", hotelController.getAll);

// GET /api/hotel/:id
router.get("/:id", hotelController.get);
router.get("/get/:id", hotelController.get);

module.exports = router;

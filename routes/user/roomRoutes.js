const express = require("express");
const roomController = require("../../controllers/user/roomController");

const router = express.Router();

// GET /api/room?hotelId=xxx  → rooms by hotel
router.get("/", roomController.getByHotel);

// GET /api/room/hotel/:hotelId  → rooms by hotel (explicit)
router.get("/hotel/:hotelId", roomController.getByHotel);

// GET /api/room/:id  → single room
router.get("/:id", roomController.get);

// Backward compat
router.get("/getAll", roomController.getAll);
router.get("/get/:id", roomController.get);

module.exports = router;

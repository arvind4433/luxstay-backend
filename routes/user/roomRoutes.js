const express = require("express");
const roomController = require("../../controllers/user/roomController");

const router = express.Router();

router.get("/getAll", roomController.getAll);
router.get("/get/:id", roomController.get);

module.exports = router;

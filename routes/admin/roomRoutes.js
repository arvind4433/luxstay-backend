const express = require("express");
const roomController = require("../../controllers/admin/roomController");

const router = express.Router();

router.post("/addRoom", roomController.addRoom);
router.get("/getAll", roomController.getAll);
router.get("/get/:id", roomController.get);
router.put("/update/:id", roomController.update);
router.delete("/delete/:id", roomController.remove);

module.exports = router;

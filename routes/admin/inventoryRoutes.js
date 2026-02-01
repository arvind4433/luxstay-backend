const express = require("express");
const inventoryController = require("../../controllers/admin/inventoryController");

const router = express.Router();

router.post("/addInventory", inventoryController.addInventory);
router.get("/getAll", inventoryController.getAll);
router.get("/get/:id", inventoryController.get);
router.put("/update/:id", inventoryController.update);
router.delete("/delete/:id", inventoryController.remove);

module.exports = router;

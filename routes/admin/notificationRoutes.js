const express = require("express");
const notificationController = require("../../controllers/admin/notificationController");

const router = express.Router();
router.get("/getAll", notificationController.getAll);
router.get("/get/:id", notificationController.get);
router.put("/update/:id", notificationController.update);
router.delete("/delete/:id", notificationController.remove);

module.exports = notificationsRouter = router;

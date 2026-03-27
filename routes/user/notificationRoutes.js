const express = require("express");
const notifController = require("../../controllers/user/notificationController");
const { verifyToken } = require("../../services/jwt");

const router = express.Router();

// GET /api/notification  → user notifications
router.get("/", verifyToken, notifController.getUserNotifications);

// PATCH /api/notification/read-all → mark all as read  (must be before /:id)
router.patch("/read-all", verifyToken, notifController.markAllRead);

// PATCH /api/notification/:id/read  → mark one as read
router.patch("/:id/read", verifyToken, notifController.markRead);

module.exports = router;

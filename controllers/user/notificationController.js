const Notification = require("../../models/Notification");

/**
 * GET /api/notification  → user-specific notifications
 */
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      status: true,
      message: "Notifications fetched",
      data: notifications,
      total: notifications.length,
      unreadCount: notifications.filter(n => !n.isRead).length,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

/**
 * PATCH /api/notification/:id/read  → mark one as read
 */
const markRead = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ status: false, message: "Notification not found" });
    return res.status(200).json({ status: true, data: notification });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

/**
 * PATCH /api/notification/read-all  → mark all as read
 */
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.user.id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return res.status(200).json({ status: true, message: "All notifications marked as read" });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = { getUserNotifications, markRead, markAllRead };
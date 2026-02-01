const Notification = require("../../models/Notification");
const User = require("../../models/User");

const getAll = async (req, res) => {
  try {
    const notifications = await Notification.find({});

 res.status(200).json({ status: 'success', message: 'getNotifications successful' , data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
   return res.status(500).json(error.message || "Server Error")
  }
}

const get = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id });
    if(!notification){
      throw new Error("Notification not Found!")
    }

    res.status(200).json({ status: 'success', message: 'getNotification successful' , data: notification });
  } catch (error) {
   return res.status(500).json(error.message || "Server Error")
  }
}

const update = async (req, res) => {
  try {
    const { title, message, type, isRead } = req.body;
    const notification = await Notification.findOne({ _id: req.params.id });

    if(!notification){
      throw new Error("Notification not Found!")
    }
    if(title  == "" || message == "" || !title || !message){
      throw new Error("Title and Message are required fields!")
    }

    notification.title = title;
    notification.message = message ;
    notification.type = type ;
    notification.isRead = isRead;
    
    await notification.save();

    res.status(200).json({ status: 'success', message: 'updateNotification successful' , data: notification });
  } catch (error) {
   return res.status(500).json(error.message || "Server Error")
  }
}

const remove = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if(!notification){
      throw new Error("Notification not Found!")
    }

    res.status(200).json({ status: 'success', message: 'removeNotification successful' });
  } catch (error) {
   return res.status(500).json(error.message || "Server Error")
  }
}

module.exports = {
  getAll,
  get,
  update,
  remove
} 
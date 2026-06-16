import exp from "express";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { NotificationModel } from "../models/NotificationModel.js";
export const notificationApp = exp.Router();

//Read notifications
notificationApp.get("/notifications", verifyToken("STUDENT", "COUNSELOR", "ADMIN"), async (req, res) => {
  const notifications = await NotificationModel.find({ user: req.user.id }).sort({ createdAt: -1 });
  const unreadCount = notifications.filter((notification) => notification.isRead === false).length;

  res.status(200).json({ message: "notifications", payload: notifications, unreadCount });
});

//Mark notification as read
notificationApp.patch("/notifications", verifyToken("STUDENT", "COUNSELOR", "ADMIN"), async (req, res) => {
  const { notificationId } = req.body;

  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, user: req.user.id },
    { $set: { isRead: true } },
    { new: true },
  );

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  const unreadCount = await NotificationModel.countDocuments({ user: req.user.id, isRead: false });

  res.status(200).json({ message: "Notification updated", payload: notification, unreadCount });
});

//Create meditation reminder
notificationApp.post("/meditation-reminder", verifyToken("STUDENT"), async (req, res) => {
  const { message } = req.body;

  const notificationDoc = new NotificationModel({
    user: req.user.id,
    title: "Meditation reminder",
    message: message || "Take a few peaceful minutes for yourself today",
    type: "MEDITATION_REMINDER",
    actionPath: "/student-profile/meditation",
  });
  await notificationDoc.save();

  res.status(201).json({ message: "Reminder created", payload: notificationDoc });
});

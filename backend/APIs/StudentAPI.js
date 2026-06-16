import exp from "express";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { UserModel } from "../models/UserModel.js";
import { ChatRequestModel } from "../models/ChatRequestModel.js";
import { PrivateChatModel } from "../models/PrivateChatModel.js";
import { NotificationModel } from "../models/NotificationModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
export const studentApp = exp.Router();

//Get counselor profiles
studentApp.get("/counselors", verifyToken("STUDENT"), async (req, res) => {
  const counselors = await UserModel.find({ role: "COUNSELOR", isUserActive: true }).select("-password");

  res.status(200).json({ message: "counselors", payload: counselors });
});

//Get wellness articles
studentApp.get("/articles", verifyToken("STUDENT"), async (req, res) => {
  const articles = await ArticleModel.find({ isArticleActive: true }).populate("counselor", "firstName lastName email profileImageUrl counselorProfile");

  res.status(200).json({ message: "articles", payload: articles });
});

//Request private counselor chat
studentApp.post("/chat-requests", verifyToken("STUDENT"), async (req, res) => {
  const { counselor, message } = req.body;

  const counselorOfDB = await UserModel.findOne({ _id: counselor, role: "COUNSELOR", isUserActive: true });

  if (!counselorOfDB) {
    return res.status(404).json({ message: "Counselor not found" });
  }

  const existingRequest = await ChatRequestModel.findOne({ student: req.user.id, counselor, status: "PENDING" });

  if (existingRequest) {
    return res.status(400).json({ message: "Request already pending" });
  }

  const requestDoc = new ChatRequestModel({ student: req.user.id, counselor, message });
  await requestDoc.save();

  const notificationDoc = new NotificationModel({
    user: counselor,
    title: "New chat request",
    message: "A student requested private counseling support",
    type: "CHAT_REQUEST",
    actionPath: "/counselor-profile/requests",
  });
  await notificationDoc.save();

  res.status(201).json({ message: "Chat request sent", payload: requestDoc });
});

//Read own chat requests
studentApp.get("/chat-requests", verifyToken("STUDENT"), async (req, res) => {
  const requests = await ChatRequestModel.find({ student: req.user.id }).populate("counselor", "firstName lastName email profileImageUrl counselorProfile");

  res.status(200).json({ message: "chat requests", payload: requests });
});

//Read own private chats
studentApp.get("/chats", verifyToken("STUDENT"), async (req, res) => {
  const chats = await PrivateChatModel.find({ student: req.user.id, isChatActive: true }).populate("counselor", "firstName lastName email profileImageUrl counselorProfile");

  res.status(200).json({ message: "chats", payload: chats });
});

//Send private message
studentApp.put("/chats", verifyToken("STUDENT"), async (req, res) => {
  const { chatId, message } = req.body;

  const chat = await PrivateChatModel.findOne({ _id: chatId, student: req.user.id, isChatActive: true });

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  chat.messages.push({ sender: req.user.id, message });
  await chat.save();

  const notificationDoc = new NotificationModel({
    user: chat.counselor,
    title: "New student message",
    message: "A student sent you a private message",
    type: "COUNSELOR_REPLY",
    actionPath: `/counselor-profile/chats?chatId=${chat._id}`,
  });
  await notificationDoc.save();

  res.status(200).json({ message: "Message sent", payload: chat });
});

//Mood check-in
studentApp.put("/mood", verifyToken("STUDENT"), async (req, res) => {
  const { mood, note } = req.body;

  const user = await UserModel.findById(req.user.id).select("-password");
  user.moodCheckIns.push({ mood, note });
  await user.save();

  res.status(200).json({ message: "Mood saved", payload: user.moodCheckIns });
});

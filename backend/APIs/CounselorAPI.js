import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { ChatRequestModel } from "../models/ChatRequestModel.js";
import { PrivateChatModel } from "../models/PrivateChatModel.js";
import { NotificationModel } from "../models/NotificationModel.js";
import { verifyToken } from "../middlewares/VerifyToken.js";

export const counselorApp = exp.Router();

//Update counselor profile
counselorApp.put("/profile", verifyToken("COUNSELOR"), async (req, res) => {
  const { qualifications, certifications, yearsOfExperience, expertise, availabilityStatus, bio } = req.body;

  const counselor = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        "counselorProfile.qualifications": qualifications,
        "counselorProfile.certifications": certifications,
        "counselorProfile.yearsOfExperience": yearsOfExperience,
        "counselorProfile.expertise": expertise,
        "counselorProfile.availabilityStatus": availabilityStatus,
        "counselorProfile.bio": bio,
      },
    },
    { new: true },
  ).select("-password");

  res.status(200).json({ message: "Profile updated", payload: counselor });
});

//Write article (protected route)
counselorApp.post("/article", verifyToken("COUNSELOR"), async (req, res) => {
  //get articleObj from client
  const articleObj = req.body;
  //get user from decoded token
  let user = req.user;
  //check counselor
  let counselor = await UserModel.findById(articleObj.counselor);

  if (!counselor) {
    return res.status(404).json({ message: "Invalid counselor" });
  }

  //cross check emails
  if (counselor.email != user.email) {
    return res.status(403).json({ message: "You are not authorized" });
  }

  //create article Document
  const articleDoc = new ArticleModel(articleObj);
  //save
  await articleDoc.save();
  //send res
  res.status(201).json({ message: "Article published successfully" });
});

//Read own articles
counselorApp.get("/articles", verifyToken("COUNSELOR"), async (req, res) => {
  //get counselor id from decoded token
  const counselorIdOfToken = req.user?.id;
  //get artcles by counselor id
  const articlesList = await ArticleModel.find({ counselor: counselorIdOfToken });
  //send res
  res.status(200).json({ message: "articles", payload: articlesList });
});

//Edit article
counselorApp.put("/articles", verifyToken("COUNSELOR"), async (req, res) => {
  //get counselor id from decoded token
  const counselorIdOfToken = req.user?.id;
  //get modified article from client
  const { articleId, title, category, content } = req.body;

  const modifiedArticle = await ArticleModel.findOneAndUpdate(
    { _id: articleId, counselor: counselorIdOfToken },
    { $set: { title, category, content } },
    { new: true },
  );

  //if either article id or counselor not correct
  if (!modifiedArticle) {
    return res.status(403).json({ message: "Not authorized to edit article" });
  }

  //send res
  res.status(200).json({ message: "Article modified", payload: modifiedArticle });
});

//Delete article(soft delete)
counselorApp.patch("/articles", verifyToken("COUNSELOR"), async (req, res) => {
  //get counselor id from decoded token
  const counselorIdOfToken = req.user?.id;
  //get modified article from client
  const { articleId, isArticleActive } = req.body;
  //get article by id
  const articleOfDB = await ArticleModel.findOne({ _id: articleId, counselor: counselorIdOfToken });

  if (!articleOfDB) {
    return res.status(404).json({ message: "Article not found" });
  }

  //check status
  if (isArticleActive === articleOfDB.isArticleActive) {
    return res.status(200).json({ message: "Article already in the same state" });
  }

  articleOfDB.isArticleActive = isArticleActive;
  await articleOfDB.save();

  //SEND RES
  res.status(200).json({ message: "Article modified", payload: articleOfDB });
});

//Read private chat requests
counselorApp.get("/chat-requests", verifyToken("COUNSELOR"), async (req, res) => {
  const requests = await ChatRequestModel.find({ counselor: req.user.id }).populate("student", "firstName lastName email profileImageUrl");

  res.status(200).json({ message: "chat requests", payload: requests });
});

//Accept or reject request
counselorApp.patch("/chat-requests", verifyToken("COUNSELOR"), async (req, res) => {
  const { requestId, status } = req.body;

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const request = await ChatRequestModel.findOneAndUpdate(
    { _id: requestId, counselor: req.user.id, status: "PENDING" },
    { $set: { status } },
    { new: true },
  );

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  let chat = null;
  if (status === "ACCEPTED") {
    chat = new PrivateChatModel({ student: request.student, counselor: request.counselor, request: request._id });
    await chat.save();
  }

  const notificationDoc = new NotificationModel({
    user: request.student,
    title: "Counselor request update",
    message: status === "ACCEPTED" ? "Your counselor request was accepted" : "Your counselor request was rejected",
    type: "CHAT_REQUEST",
    actionPath: status === "ACCEPTED" ? "/student-profile/chats" : "/student-profile/counselors",
  });
  await notificationDoc.save();

  res.status(200).json({ message: "Request updated", payload: { request, chat } });
});

//Read own private chats
counselorApp.get("/chats", verifyToken("COUNSELOR"), async (req, res) => {
  const chats = await PrivateChatModel.find({ counselor: req.user.id, isChatActive: true }).populate("student", "firstName lastName email profileImageUrl");

  res.status(200).json({ message: "chats", payload: chats });
});

//Send private message
counselorApp.put("/chats", verifyToken("COUNSELOR"), async (req, res) => {
  const { chatId, message } = req.body;

  const chat = await PrivateChatModel.findOne({ _id: chatId, counselor: req.user.id, isChatActive: true });

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  chat.messages.push({ sender: req.user.id, message });
  await chat.save();

  const notificationDoc = new NotificationModel({
    user: chat.student,
    title: "Counselor replied",
    message: "Your counselor sent you a private message",
    type: "COUNSELOR_REPLY",
    actionPath: `/student-profile/chats?chatId=${chat._id}`,
  });
  await notificationDoc.save();

  res.status(200).json({ message: "Message sent", payload: chat });
});
